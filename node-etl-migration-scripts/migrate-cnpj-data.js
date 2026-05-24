/**
 * Script de Migração de Dados CNPJ Belém (SQLite -> PocketBase)
 * 
 * Migra dados de dados_cnpj_belem.db para as coleções:
 * - w_empresas
 * - w_estabelecimentos
 * - w_socios
 * 
 * Features:
 * - Checkpoint para resume em caso de falha
 * - Batch processing com retry
 * - Tratamento robusto de valores null/empty
 * - Log detalhado
 * 
 * COMANDOS:
 * - node scripts/migrate-cnpj-data.js              -> Executa migração
 * - node scripts/migrate-cnpj-data.js --dry-run    -> Simula sem inserir
 * - node scripts/migrate-cnpj-data.js --reset      -> Limpa checkpoint e reinicia
 * 
 */

import dotenv from 'dotenv';
import PocketBase from 'pocketbase';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ============================================
// CONFIGURAÇÃO
// ============================================
const CONFIG = {
    PB_URL: process.env.VITE_POCKETBASE_URL || 'https://api.visabelem.net',
    ADMIN_EMAIL: process.env.PB_ADMIN_EMAIL || '',
    ADMIN_PASSWORD: process.env.PB_ADMIN_PASSWORD || '',

    DB_PATH: path.resolve(__dirname, '../../dados_cnpj_belem.db'),
    LOG_DIR: path.resolve(__dirname, '../logs'),
    CHECKPOINT_FILE: path.resolve(__dirname, '../logs/migration-cnpj-checkpoint.json'),

    BATCH_SIZE: 100,
    BATCH_TIMEOUT_MS: 120000, // 2 minutos
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 2000,
    DELAY_BETWEEN_BATCHES_MS: 500,

    DRY_RUN: process.argv.includes('--dry-run'),
    RESET: process.argv.includes('--reset'),
};

// ============================================
// CHECKPOINT MANAGER
// ============================================
class CheckpointManager {
    constructor() {
        this.data = {
            phase: 'empresas', // 'empresas', 'estabelecimentos', 'socios', 'done'
            empresasBatchIndex: 0,
            estabelecimentosBatchIndex: 0,
            sociosBatchIndex: 0,
            empresasIdMap: {}, // cnpj_basico -> PB record ID
            processedCounts: {
                empresas: 0,
                estabelecimentos: 0,
                socios: 0
            },
            lastUpdated: null,
        };
    }

    load() {
        if (CONFIG.RESET) {
            console.log('🔄 --reset flag: Clearing checkpoint');
            this.clear();
            return;
        }

        if (fs.existsSync(CONFIG.CHECKPOINT_FILE)) {
            try {
                const raw = fs.readFileSync(CONFIG.CHECKPOINT_FILE, 'utf-8');
                this.data = JSON.parse(raw);
                console.log(`📌 Resuming from checkpoint:`);
                console.log(`   Phase: ${this.data.phase}`);
                console.log(`   Empresas batch: ${this.data.empresasBatchIndex}`);
                console.log(`   Estabelecimentos batch: ${this.data.estabelecimentosBatchIndex}`);
                console.log(`   Socios batch: ${this.data.sociosBatchIndex}`);
                console.log(`   Empresas IDs cached: ${Object.keys(this.data.empresasIdMap).length}`);
            } catch (e) {
                console.warn('⚠️ Failed to load checkpoint, starting fresh');
                this.clear();
            }
        } else {
            console.log('📝 No checkpoint found, starting fresh');
        }
    }

    save() {
        this.data.lastUpdated = new Date().toISOString();

        if (!fs.existsSync(CONFIG.LOG_DIR)) {
            fs.mkdirSync(CONFIG.LOG_DIR, { recursive: true });
        }

        fs.writeFileSync(CONFIG.CHECKPOINT_FILE, JSON.stringify(this.data, null, 2));
    }

    clear() {
        this.data = {
            phase: 'empresas',
            empresasBatchIndex: 0,
            estabelecimentosBatchIndex: 0,
            sociosBatchIndex: 0,
            empresasIdMap: {},
            processedCounts: {
                empresas: 0,
                estabelecimentos: 0,
                socios: 0
            },
            lastUpdated: null,
        };

        if (fs.existsSync(CONFIG.CHECKPOINT_FILE)) {
            fs.unlinkSync(CONFIG.CHECKPOINT_FILE);
        }
    }

    setEmpresaId(cnpjBasico, pbId) {
        this.data.empresasIdMap[cnpjBasico] = pbId;
    }

    getEmpresaId(cnpjBasico) {
        return this.data.empresasIdMap[cnpjBasico] || null;
    }
}

const checkpoint = new CheckpointManager();

// ============================================
// LOGGER
// ============================================
class Logger {
    constructor() {
        this.logFile = null;
        this.startTime = new Date();
        this.stats = {
            empresasTotal: 0,
            empresasSuccess: 0,
            empresasErrors: 0,
            estabelecimentosTotal: 0,
            estabelecimentosSuccess: 0,
            estabelecimentosErrors: 0,
            sociosTotal: 0,
            sociosSuccess: 0,
            sociosErrors: 0,
            errors: [],
            batches: 0,
            retries: 0,
        };
    }

    init() {
        if (!fs.existsSync(CONFIG.LOG_DIR)) {
            fs.mkdirSync(CONFIG.LOG_DIR, { recursive: true });
        }

        const timestamp = this.startTime.toISOString().replace(/[:.]/g, '-');
        const logPath = path.join(CONFIG.LOG_DIR, `migration-cnpj-${timestamp}.log`);
        this.logFile = fs.createWriteStream(logPath, { flags: 'a' });

        this.info(`========================================`);
        this.info(`CNPJ Data Migration Started: ${this.startTime.toISOString()}`);
        this.info(`Mode: ${CONFIG.DRY_RUN ? 'DRY RUN' : 'LIVE EXECUTION'}`);
        this.info(`Source: ${CONFIG.DB_PATH}`);
        this.info(`Batch Size: ${CONFIG.BATCH_SIZE}`);
        this.info(`========================================`);
    }

    _write(level, message, data = null) {
        const timestamp = new Date().toISOString();
        let logLine = `[${timestamp}] [${level}] ${message}`;
        if (data) {
            logLine += ` | ${JSON.stringify(data)}`;
        }
        console.log(logLine);
        if (this.logFile) {
            this.logFile.write(logLine + '\n');
        }
    }

    debug(msg, data = null) { this._write('DEBUG', msg, data); }
    info(msg, data = null) { this._write('INFO', msg, data); }
    warn(msg, data = null) { this._write('WARN', msg, data); }
    error(msg, data = null) {
        this._write('ERROR', msg, data);
        if (this.stats.errors.length < 100) {
            this.stats.errors.push({ message: msg, data, timestamp: new Date().toISOString() });
        }
    }

    printReport() {
        const duration = ((new Date() - this.startTime) / 1000).toFixed(2);
        const report = `
========================================
📊 RELATÓRIO - MIGRAÇÃO CNPJ BELÉM
========================================
⏱️  Duração: ${duration}s
📁 Modo: ${CONFIG.DRY_RUN ? 'DRY RUN' : 'EXECUÇÃO REAL'}

📈 ESTATÍSTICAS:
   Empresas:
     Total no SQLite: ${this.stats.empresasTotal}
     Inseridas: ${this.stats.empresasSuccess}
     Erros: ${this.stats.empresasErrors}
   
   Estabelecimentos:
     Total no SQLite: ${this.stats.estabelecimentosTotal}
     Inseridos: ${this.stats.estabelecimentosSuccess}
     Erros: ${this.stats.estabelecimentosErrors}
   
   Sócios:
     Total no SQLite: ${this.stats.sociosTotal}
     Inseridos: ${this.stats.sociosSuccess}
     Erros: ${this.stats.sociosErrors}

📦 BATCH API:
   Total de batches: ${this.stats.batches}
   Retries: ${this.stats.retries}

❌ ERROS (primeiros 10): ${this.stats.errors.length}
${this.stats.errors.slice(0, 10).map((e, i) => `   ${i + 1}. ${e.message}`).join('\n')}
========================================
`;
        console.log(report);
        if (this.logFile) {
            this.logFile.write(report);
            this.logFile.end();
        }

        if (this.stats.errors.length > 0) {
            const errorPath = path.join(CONFIG.LOG_DIR, `migration-cnpj-errors-${this.startTime.toISOString().replace(/[:.]/g, '-')}.json`);
            fs.writeFileSync(errorPath, JSON.stringify(this.stats.errors, null, 2));
            console.log(`📝 Erros salvos em: ${errorPath}`);
        }
    }
}

const logger = new Logger();

// ============================================
// UTILITY FUNCTIONS
// ============================================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Limpa valor - retorna null para valores "vazios"
 */
function cleanValue(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '' || trimmed === 'null' || trimmed === 'NULL') return null;
        return trimmed;
    }
    return value;
}

/**
 * Limpa e trunca string
 */
function cleanString(value, maxLength = null) {
    const cleaned = cleanValue(value);
    if (cleaned === null) return '';
    if (maxLength && cleaned.length > maxLength) {
        return cleaned.substring(0, maxLength);
    }
    return cleaned;
}

/**
 * Parse date from SQLite format YYYYMMDD to PocketBase format
 */
function parseDate(dateStr) {
    const cleaned = cleanValue(dateStr);
    if (!cleaned || cleaned === '00000000' || cleaned.length !== 8) return null;

    try {
        const y = cleaned.substring(0, 4);
        const m = cleaned.substring(4, 6);
        const d = cleaned.substring(6, 8);

        const year = parseInt(y);
        const month = parseInt(m);
        const day = parseInt(d);

        // Validar data
        if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
            return null;
        }

        return `${y}-${m}-${d} 12:00:00.000Z`;
    } catch (e) {
        return null;
    }
}

/**
 * Parse capital social from Brazilian format "99900,00" to number
 */
function parseCapitalSocial(value) {
    const cleaned = cleanValue(value);
    if (!cleaned) return 0;

    try {
        // Remove dots (thousands separator), replace comma with period
        const normalized = cleaned.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(normalized);
        return isNaN(num) ? 0 : num;
    } catch (e) {
        return 0;
    }
}

/**
 * Limpa e valida email - usa regex para validação rigorosa
 */
function cleanEmail(email) {
    const cleaned = cleanValue(email);
    if (!cleaned) return null;

    const lower = cleaned.toLowerCase().trim();

    // Rejeitar emails com padrões claramente inválidos
    if (
        lower.includes('..') ||      // pontos consecutivos
        lower.includes('@.') ||      // ponto após @
        lower.includes('.@') ||      // ponto antes de @
        lower.startsWith('.') ||     // começa com ponto
        lower.startsWith('-') ||     // começa com hífen
        lower.includes('@-') ||      // hífen após @
        lower.includes('-@') ||      // hífen antes de @
        lower.length < 6             // muito curto
    ) {
        return null;
    }

    // Regex para validar email
    // Exige: pelo menos uma letra ou número antes do @
    // Exige: pelo menos uma letra ou número no domínio
    const emailRegex = /^[a-z0-9][a-z0-9._%+-]*@[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/;

    if (emailRegex.test(lower)) {
        return lower;
    }

    // Se não passar na validação, retorna null (campo fica vazio)
    return null;
}

/**
 * Limpa CNPJ - apenas números
 */
function cleanCnpj(value) {
    const cleaned = cleanValue(value);
    if (!cleaned) return '';
    return cleaned.replace(/\D/g, '');
}

// ============================================
// BATCH EXECUTION
// ============================================

async function executeBatch(pb, batchFn, description, attempt = 1) {
    try {
        logger.debug(`[Batch] ${description} - Attempt ${attempt}/${CONFIG.MAX_RETRIES}`);

        const batch = pb.createBatch();
        await batchFn(batch);

        const startTime = Date.now();
        const results = await Promise.race([
            batch.send(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Batch timeout')), CONFIG.BATCH_TIMEOUT_MS)
            ),
        ]);

        const duration = Date.now() - startTime;
        logger.debug(`[Batch] ${description} - Completed in ${duration}ms`);

        return results;
    } catch (error) {
        logger.warn(`[Batch] ${description} - Failed attempt ${attempt}/${CONFIG.MAX_RETRIES}`, {
            error: error.message,
            code: error.status,
        });

        if (attempt < CONFIG.MAX_RETRIES) {
            const delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
            logger.info(`[Batch] Retrying in ${delay}ms...`);
            logger.stats.retries++;
            await sleep(delay);
            return executeBatch(pb, batchFn, description, attempt + 1);
        }

        throw error;
    }
}

// ============================================
// TRANSFORM FUNCTIONS
// ============================================

function transformEmpresa(row) {
    return {
        cnpj_basico: cleanString(row.cnpj_basico, 8).padStart(8, '0'),
        razao_social: cleanString(row.razao_social, 200),
        natureza_juridica: cleanString(row.natureza_juridica, 10),
        qualificacao_responsavel: cleanString(row.qualificacao_responsavel, 5),
        capital_social: parseCapitalSocial(row.capital_social),
        porte_empresa: cleanString(row.porte_empresa, 5),
        ente_federativo_responsavel: cleanString(row.ente_federativo_responsavel, 50),
    };
}

function transformEstabelecimento(row, empresaId) {
    const cnpjBasico = cleanString(row.cnpj_basico, 8).padStart(8, '0');
    const cnpjOrdem = cleanString(row.cnpj_ordem, 4).padStart(4, '0');
    const cnpjDv = cleanString(row.cnpj_dv, 2).padStart(2, '0');
    const cnpjCompleto = `${cnpjBasico}${cnpjOrdem}${cnpjDv}`;

    const email = cleanEmail(row.correio_eletronico);

    return {
        cnpj: cnpjCompleto,
        cnpj_basico: cnpjBasico,
        cnpj_ordem: cnpjOrdem,
        cnpj_dv: cnpjDv,
        empresa: empresaId || '',
        matriz_filial: cleanString(row.matriz_filial, 1) || '',
        nome_fantasia: cleanString(row.nome_fantasia, 100),
        situacao_cadastral: cleanString(row.situacao_cadastral, 2) || '',
        data_situacao_cadastral: parseDate(row.data_situacao_cadastral),
        motivo_situacao_cadastral: cleanString(row.motivo_situacao_cadastral, 10),
        data_inicio_atividade: parseDate(row.data_inicio_atividade),
        cnae_fiscal_principal: cleanString(row.cnae_fiscal_principal, 10),
        cnae_fiscal_secundaria: cleanString(row.cnae_fiscal_secundaria, 1000),
        tipo_logradouro: cleanString(row.tipo_logradouro, 30),
        logradouro: cleanString(row.logradouro, 100),
        numero: cleanString(row.numero, 20),
        complemento: cleanString(row.complemento, 200),
        bairro: cleanString(row.bairro, 60),
        bairro_normalizado: cleanString(row.bairro_normalizado, 60),
        cep: cleanCnpj(row.cep).substring(0, 8), // Reusa a função de limpar números
        uf: cleanString(row.uf, 2) || 'PA',
        municipio: cleanString(row.municipio, 10),
        ddd_1: cleanString(row.ddd_1, 4),
        telefone_1: cleanString(row.telefone_1, 10),
        ddd_2: cleanString(row.ddd_2, 4),
        telefone_2: cleanString(row.telefone_2, 10),
        correio_eletronico: email,
        nome_cidade_exterior: cleanString(row.nome_cidade_exterior, 100),
        pais: cleanString(row.pais, 10),
        situacao_especial: cleanString(row.situacao_especial, 50),
        data_situacao_especial: parseDate(row.data_situacao_especial),
    };
}

function transformSocio(row, empresaId) {
    return {
        cnpj_basico: cleanString(row.cnpj_basico, 8).padStart(8, '0'),
        empresa: empresaId || '',
        identificador_socio: cleanString(row.identificador_socio, 1) || '',
        nome_socio_razao_social: cleanString(row.nome_socio_razao_social, 150),
        cnpj_cpf_socio: cleanCnpj(row.cnpj_cpf_socio).substring(0, 14),
        qualificacao_socio: cleanString(row.qualificacao_socio, 5),
        data_entrada_sociedade: parseDate(row.data_entrada_sociedade),
        pais: cleanString(row.pais, 10),
        representante_legal: cleanString(row.representante_legal, 15),
        nome_representante: cleanString(row.nome_representante, 100),
        qualificacao_representante_legal: cleanString(row.qualificacao_representante_legal, 5),
        faixa_etaria: cleanString(row.faixa_etaria, 1) || '',
    };
}

// ============================================
// MAIN
// ============================================

async function main() {
    checkpoint.load();
    logger.init();

    if (!CONFIG.ADMIN_EMAIL || !CONFIG.ADMIN_PASSWORD) {
        logger.error('Missing credentials. Set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD in .env');
        process.exit(1);
    }

    if (!fs.existsSync(CONFIG.DB_PATH)) {
        logger.error(`SQLite database not found: ${CONFIG.DB_PATH}`);
        process.exit(1);
    }

    // Initialize PocketBase
    const pb = new PocketBase(CONFIG.PB_URL);
    pb.autoCancellation(false);

    // Authenticate
    logger.info('Authenticating with PocketBase...');
    try {
        await pb.admins.authWithPassword(CONFIG.ADMIN_EMAIL, CONFIG.ADMIN_PASSWORD);
        logger.info('✅ Authentication successful');
    } catch (error) {
        logger.error('Auth failed', { error: error.message });
        process.exit(1);
    }

    // Open SQLite
    logger.info(`Opening SQLite database: ${CONFIG.DB_PATH}`);
    const db = new Database(CONFIG.DB_PATH, { readonly: true });

    // ============================================
    // PHASE 1: Migrate Empresas
    // ============================================
    if (checkpoint.data.phase === 'empresas') {
        logger.info('=== PHASE 1: Migrando w_empresas ===');

        const countResult = db.prepare('SELECT COUNT(*) as count FROM empresas').get();
        const totalCount = countResult.count;
        logger.stats.empresasTotal = totalCount;
        logger.info(`Found ${totalCount} empresas in SQLite`);

        const totalBatches = Math.ceil(totalCount / CONFIG.BATCH_SIZE);

        for (let batchIdx = checkpoint.data.empresasBatchIndex; batchIdx < totalBatches; batchIdx++) {
            const offset = batchIdx * CONFIG.BATCH_SIZE;
            const empresas = db.prepare(`SELECT * FROM empresas LIMIT ${CONFIG.BATCH_SIZE} OFFSET ${offset}`).all();

            logger.info(`[Empresas] Batch ${batchIdx + 1}/${totalBatches} (${empresas.length} records, offset ${offset})`);

            if (CONFIG.DRY_RUN) {
                empresas.forEach(row => {
                    const cnpjBasico = cleanString(row.cnpj_basico, 8).padStart(8, '0');
                    checkpoint.setEmpresaId(cnpjBasico, `dry-run-${cnpjBasico}`);
                    logger.stats.empresasSuccess++;
                });
                checkpoint.data.empresasBatchIndex = batchIdx + 1;
                checkpoint.save();
                continue;
            }

            try {
                const results = await executeBatch(
                    pb,
                    (batch) => {
                        empresas.forEach(row => {
                            const data = transformEmpresa(row);
                            batch.collection('w_empresas').create(data);
                        });
                    },
                    `Empresas Batch ${batchIdx + 1}/${totalBatches}`
                );

                results.forEach((result, idx) => {
                    const cnpjBasico = cleanString(empresas[idx].cnpj_basico, 8).padStart(8, '0');
                    if (result.status === 200 && result.body?.id) {
                        checkpoint.setEmpresaId(cnpjBasico, result.body.id);
                        logger.stats.empresasSuccess++;
                    } else {
                        logger.warn(`Empresa failed: ${cnpjBasico}`, { status: result.status, body: result.body });
                        logger.stats.empresasErrors++;
                    }
                });

                checkpoint.data.empresasBatchIndex = batchIdx + 1;
                checkpoint.save();
                logger.stats.batches++;

            } catch (error) {
                logger.error(`[Empresas] BATCH ${batchIdx + 1} FAILED - Saving progress`, {
                    error: error.message,
                });
                checkpoint.save();
                logger.printReport();
                console.log('\n🔄 Para continuar: node scripts/migrate-cnpj-data.js');
                db.close();
                process.exit(1);
            }

            await sleep(CONFIG.DELAY_BETWEEN_BATCHES_MS);
        }

        checkpoint.data.phase = 'estabelecimentos';
        checkpoint.save();
        logger.info('✅ Phase 1 (Empresas) completed!');
    }

    // ============================================
    // PHASE 2: Migrate Estabelecimentos
    // ============================================
    if (checkpoint.data.phase === 'estabelecimentos') {
        logger.info('=== PHASE 2: Migrando w_estabelecimentos ===');

        const countResult = db.prepare('SELECT COUNT(*) as count FROM estabelecimentos').get();
        const totalCount = countResult.count;
        logger.stats.estabelecimentosTotal = totalCount;
        logger.info(`Found ${totalCount} estabelecimentos in SQLite`);

        const totalBatches = Math.ceil(totalCount / CONFIG.BATCH_SIZE);

        for (let batchIdx = checkpoint.data.estabelecimentosBatchIndex; batchIdx < totalBatches; batchIdx++) {
            const offset = batchIdx * CONFIG.BATCH_SIZE;
            const estabelecimentos = db.prepare(`SELECT * FROM estabelecimentos LIMIT ${CONFIG.BATCH_SIZE} OFFSET ${offset}`).all();

            logger.info(`[Estabelecimentos] Batch ${batchIdx + 1}/${totalBatches} (${estabelecimentos.length} records, offset ${offset})`);

            if (CONFIG.DRY_RUN) {
                estabelecimentos.forEach(() => logger.stats.estabelecimentosSuccess++);
                checkpoint.data.estabelecimentosBatchIndex = batchIdx + 1;
                checkpoint.save();
                continue;
            }

            try {
                const results = await executeBatch(
                    pb,
                    (batch) => {
                        estabelecimentos.forEach(row => {
                            const cnpjBasico = cleanString(row.cnpj_basico, 8).padStart(8, '0');
                            const empresaId = checkpoint.getEmpresaId(cnpjBasico);
                            const data = transformEstabelecimento(row, empresaId);
                            batch.collection('w_estabelecimentos').create(data);
                        });
                    },
                    `Estabelecimentos Batch ${batchIdx + 1}/${totalBatches}`
                );

                results.forEach((result, idx) => {
                    if (result.status === 200 && result.body?.id) {
                        logger.stats.estabelecimentosSuccess++;
                    } else {
                        const cnpj = cleanString(estabelecimentos[idx].cnpj_basico, 8);
                        logger.warn(`Estabelecimento failed: ${cnpj}`, { status: result.status, body: result.body });
                        logger.stats.estabelecimentosErrors++;
                    }
                });

                checkpoint.data.estabelecimentosBatchIndex = batchIdx + 1;
                checkpoint.save();
                logger.stats.batches++;

            } catch (error) {
                logger.error(`[Estabelecimentos] BATCH ${batchIdx + 1} FAILED - Saving progress`, {
                    error: error.message,
                });
                checkpoint.save();
                logger.printReport();
                console.log('\n🔄 Para continuar: node scripts/migrate-cnpj-data.js');
                db.close();
                process.exit(1);
            }

            await sleep(CONFIG.DELAY_BETWEEN_BATCHES_MS);
        }

        checkpoint.data.phase = 'socios';
        checkpoint.save();
        logger.info('✅ Phase 2 (Estabelecimentos) completed!');
    }

    // ============================================
    // PHASE 3: Migrate Socios
    // ============================================
    if (checkpoint.data.phase === 'socios') {
        logger.info('=== PHASE 3: Migrando w_socios ===');

        const countResult = db.prepare('SELECT COUNT(*) as count FROM socios').get();
        const totalCount = countResult.count;
        logger.stats.sociosTotal = totalCount;
        logger.info(`Found ${totalCount} socios in SQLite`);

        const totalBatches = Math.ceil(totalCount / CONFIG.BATCH_SIZE);

        for (let batchIdx = checkpoint.data.sociosBatchIndex; batchIdx < totalBatches; batchIdx++) {
            const offset = batchIdx * CONFIG.BATCH_SIZE;
            const socios = db.prepare(`SELECT * FROM socios LIMIT ${CONFIG.BATCH_SIZE} OFFSET ${offset}`).all();

            logger.info(`[Socios] Batch ${batchIdx + 1}/${totalBatches} (${socios.length} records, offset ${offset})`);

            if (CONFIG.DRY_RUN) {
                socios.forEach(() => logger.stats.sociosSuccess++);
                checkpoint.data.sociosBatchIndex = batchIdx + 1;
                checkpoint.save();
                continue;
            }

            try {
                const results = await executeBatch(
                    pb,
                    (batch) => {
                        socios.forEach(row => {
                            const cnpjBasico = cleanString(row.cnpj_basico, 8).padStart(8, '0');
                            const empresaId = checkpoint.getEmpresaId(cnpjBasico);
                            const data = transformSocio(row, empresaId);
                            batch.collection('w_socios').create(data);
                        });
                    },
                    `Socios Batch ${batchIdx + 1}/${totalBatches}`
                );

                results.forEach((result, idx) => {
                    if (result.status === 200 && result.body?.id) {
                        logger.stats.sociosSuccess++;
                    } else {
                        const nome = cleanString(socios[idx].nome_socio_razao_social, 30);
                        logger.warn(`Socio failed: ${nome}`, { status: result.status, body: result.body });
                        logger.stats.sociosErrors++;
                    }
                });

                checkpoint.data.sociosBatchIndex = batchIdx + 1;
                checkpoint.save();
                logger.stats.batches++;

            } catch (error) {
                logger.error(`[Socios] BATCH ${batchIdx + 1} FAILED - Saving progress`, {
                    error: error.message,
                });
                checkpoint.save();
                logger.printReport();
                console.log('\n🔄 Para continuar: node scripts/migrate-cnpj-data.js');
                db.close();
                process.exit(1);
            }

            await sleep(CONFIG.DELAY_BETWEEN_BATCHES_MS);
        }

        checkpoint.data.phase = 'done';
        checkpoint.save();
        logger.info('✅ Phase 3 (Socios) completed!');
    }

    // ============================================
    // DONE
    // ============================================
    db.close();
    logger.info('✅ CNPJ Data Migration completed successfully!');
    checkpoint.clear();
    logger.printReport();
}

main().catch(error => {
    logger.error('Unhandled error', { error: error.message, stack: error.stack });
    checkpoint.save();
    logger.printReport();
    console.log('\n🔄 Para continuar: node scripts/migrate-cnpj-data.js');
    process.exit(1);
});
