/**
 * @file populate-optimized-cache.js
 * @description Script CRÍTICO para repopular o cache de análise de tipos (w_analytics_types_cache).
 *              Este script consolida dados de 4 fontes diferentes para formar a linha do tempo completa (2018-Presente).
 * 
 * =========================================================================================
 * ⚠️ DOCUMENTAÇÃO DE MIGRAÇÃO E MANUTENÇÃO (NÃO REMOVER) ⚠️
 * =========================================================================================
 * 
 * HISTÓRICO E LIÇÕES APRENDIDAS (Dezembro 2025):
 * 
 * 1. DATAS EM REGISTROS MIGRADOS (O Problema de 2025):
 *    - Registros migrados para 'w_triagem_taxas' e 'w_triagem_visa' possuem 'created' com a data da migração (ex: Dez 2025).
 *    - SOLUÇÃO: Para o ano 2025, extraímos a data REAL do payload original (solicitacao.payload.createdAt). 
 *    - Para 2026+ (registros nativos), confiamos no campo 'created' ou 'data_tally'.
 *    - NÃO altere a lógica de parsing do payload sem testar se os dados de 2025 continuam distribuídos corretamente pelos meses.
 * 
 * 2. TIPOS GENÉRICOS DE TRIAGEM:
 *    - O campo direto 'tipo' em 'w_triagem_visa' costuma ser genérico ("Licenciamento" ou "Diversos").
 *    - SOLUÇÃO: Usamos 'expand' para buscar 'solicitacao_tally' e 'solicitacao_visa' e ler o campo 'proc_type', que contém o nome específico.
 * 
 * 3. NORMALIZAÇÃO PRIORITÁRIA (Taxas vs Licenciamento):
 *    - "Taxa de Licença de Funcionamento" contém a palavra "Licença".
 *    - Se verificarmos "Licença" antes, classificamos errado como "Licenciamento".
 *    - SOLUÇÃO: A função 'normalizeType' verifica estritamente: 1º TAXAS, 2º 2ª VIA, 3º OUTROS/LICENCIAMENTO.
 * 
 * 4. FILTRO DE STATUS (Consistência Métrica):
 *    - O histórico 'w_processos_old' exclui indeferidos.
 *    - Para consistência, 'w_triagem_visa' e 'w_triagem_taxas' DEVEM filtrar 'status = "Deferido"'.
 *    - Sem isso, os números de 2025 ficam inflados com tentativas falhas ou testes.
 * 
 * 5. EXPANDS SÃO OBRIGATÓRIOS:
 *    - Campos Relation (solicitacao) retornam apenas ID por padrão. O script falhará silenciosamente sem 'expand'.
 * 
 * =========================================================================================
 * 
 * FONTES DE DADOS:
 * 1. w_processos_old: Legado completo (Histórico < 2025). Filtra metadados !~ "indeferido".
 * 2. w_taxas_visa: Taxas Avulsas Legado (Histórico < 2025).
 * 3. w_triagem_visa: Novos Processos (2025+). Filtra status="Deferido". Usa expand proc_type.
 * 4. w_triagem_taxas: Novas Taxas (2025+). Filtra status="Deferido". Usa payload date extraction.
 * 
 * Uso: node scripts/populate-optimized-cache.js
 */

import 'dotenv/config';
import PocketBase from 'pocketbase';

const pb = new PocketBase('https://api.visabelem.net');

// Mapas de normalização
const NORMALIZE_MAP = {
    // Note: This map is used AFTER the priority checks in normalizeType
    'PRIMEIRA LICENÇA': 'Licenciamento',
    'PRIMEIRA LF': 'Licenciamento',
    'LICENÇA DE FUNCIONAMENTO': 'Licenciamento',
    'RENOVAÇÃO': 'Licenciamento',
    'LICENCIAMENTO': 'Licenciamento',
    'PROJETO ARQUITETÔNICO': 'Projeto Arquitetônico',
    'APROVAÇÃO DO PROJETO': 'Projeto Arquitetônico',
    'APROVAÇÃO DE PROJETO': 'Projeto Arquitetônico',
    'RELATÓRIO DE INSPEÇÃO': 'Relatório de Inspeção',
    'INSPEÇÃO': 'Relatório de Inspeção',
    'AFE/AE': 'AFE / AE / Anvisa',
    'ANVISA': 'AFE / AE / Anvisa',
    'LIVRO': 'Livros / SNGPC',
    'AUTENTICAÇÃO': 'Livros / SNGPC',
    'SNGPC': 'Livros / SNGPC',
    'BALANÇO': 'Livros / SNGPC',
    'INVENTÁRIO': 'Livros / SNGPC',
    'RELATÓRIO MENSAL': 'Livros / SNGPC',
    'VISTO EM RECEITA': 'Visto em Receita',
    'VISTO': 'Visto em Receita',
    'AUTORIZAÇÃO DE SAÚDE': 'Autorização de Saúde',
    'AÇÃO DE SERVIÇO DE SAÚDE': 'Autorização de Saúde',
    'SAC': 'Autorização de Saúde',
    'SAA': 'Autorização de Saúde',
    'ÁGUA PARA CONSUMO': 'Autorização de Saúde',
    'AUTORIZAÇÃO AMBIENTAL': 'Autorização Ambiental',
    'AMBIENTAL': 'Autorização Ambiental',
    'MISOPROSTOL': 'Cadastro de Misoprostol',
    'EVENTO': 'Eventos e Estádios',
    'ESTÁDIO': 'Eventos e Estádios',
    'LAUDO TÉCNICO': 'Eventos e Estádios',
    'LAUDO': 'Eventos e Estádios',
    'PARECER': 'Eventos e Estádios',
    'BAIXA': 'Baixa / Encerramento',
    'CANCELAMENTO': 'Baixa / Encerramento',
    'ENCERRAMENTO': 'Baixa / Encerramento',
    'ALTERAÇÃO': 'Alterações / 2ª Via',
    '2ª VIA': 'Alterações / 2ª Via',
    'SEGUNDA VIA': 'Alterações / 2ª Via',
    'SUBSTITUIÇÃO DE RT': 'Alterações / 2ª Via',
    'RETIFICAÇÃO': 'Alterações / 2ª Via',
    'CANCELAMENTO DE RT': 'Alterações / 2ª Via',
    'CERTIDÃO': 'Pareceres e Certidões',
    'CVLEA': 'Pareceres e Certidões',
    'TAXA': 'Taxas / Arrecadação',
    'AUTO DE INFRAÇÃO': 'Taxas / Arrecadação',
    'MULTA': 'Taxas / Arrecadação',
    'ACRÉSCIMO': 'Taxas / Arrecadação',
    'DENÚNCIA': 'Outros Processos',
    'DEFESA': 'Outros Processos',
    'RECURSO': 'Outros Processos',
    'DESINTERDIÇÃO': 'Outros Processos',
    'INUTILIZAÇÃO': 'Outros Processos',
    'MALETA': 'Outros Processos',
    'DIVERSOS': 'Outros Processos',
    'OUTRO': 'Outros Processos'
};

function normalizeType(originalType) {
    if (!originalType) return 'Outros Processos';
    const upper = originalType.toUpperCase().trim();

    // Priority 1: Taxas (Explicit, prevents "Taxa de Licença" becoming "Licenciamento")
    if (upper.startsWith('TAXA') || upper.includes('TAXA DE')) return 'Taxas / Arrecadação';

    // Priority 2: 2ª Via / Alterações (Prevents "2ª via de Licença" becoming "Licenciamento")
    if (upper.includes('2ª VIA') || upper.includes('SEGUNDA VIA') || upper.includes('ALTERAÇÃO')) return 'Alterações / 2ª Via';

    // Priority 3: Exact or Key Map Match
    if (NORMALIZE_MAP[upper]) return NORMALIZE_MAP[upper];

    for (const [key, value] of Object.entries(NORMALIZE_MAP)) {
        if (upper.includes(key)) return value;
    }

    // Priority 4: Keywords fallback (Logic from User for Licenciamento)
    if (upper.includes('LICENÇA') || upper.includes('LICENCIAMENTO') || upper.includes('LF ')) return 'Licenciamento';

    return 'Outros Processos';
}

async function main() {
    try {
        console.log('🚀 Populating TYPES Cache (Full History + Status Fix)...');
        await pb.admins.authWithPassword(process.env.PB_ADMIN_EMAIL, process.env.PB_ADMIN_PASSWORD);
        console.log('✅ Authenticated\n');

        const cacheCollection = 'w_analytics_types_cache';
        const aggregated = {}; // Key: "YYYY-MM|TYPE" -> Count

        // ============================================================
        // 1. w_processos_old (Legacy - All Historical Data)
        // ============================================================
        console.log('📊 Step 1: Processing w_processos_old (All Legacy History)...');
        const oldRecords = await pb.collection('w_processos_old').getFullList({
            filter: 'metadados !~ "indeferido" && metadados !~ "Indeferido"', // Apenas filtra indeferidos
            fields: 'data_criacao,tipo_processo',
            requestKey: null
        });

        console.log(`   Found ${oldRecords.length} records.`);

        oldRecords.forEach(r => {
            const dateStr = r.data_criacao?.substring(0, 10);
            if (!dateStr) return;
            const year = dateStr.substring(0, 4);
            if (year > '2024') return; // Exclude 2025+ (handled by new collections)

            let type;
            const rawType = r.tipo_processo || '';
            // normalizeType now handles 'Taxa...' priority correctly
            type = normalizeType(rawType);

            const month = dateStr.substring(0, 7);
            const key = `${month}|${type}`;
            aggregated[key] = (aggregated[key] || 0) + 1;
        });

        // ============================================================
        // 1.5 w_taxas_visa (Legacy Taxas - Data in Payload)
        // ============================================================
        console.log('📊 Step 1.5: Processing w_taxas_visa (Legacy Taxas)...');
        const taxasLegacy = await pb.collection('w_taxas_visa').getFullList({
            requestKey: null
        });
        console.log(`   Found ${taxasLegacy.length} legacy taxa records.`);

        taxasLegacy.forEach(r => {
            // Extrair data do payload JSON complexo
            let payload = r.payload;
            if (typeof payload === 'string') {
                try { payload = JSON.parse(payload); } catch (e) { return; }
            }

            // Tenta várias propriedades possíveis para a data
            let createdAt = payload?.data?.createdAt || payload?.createdAt || payload?.created || r.created;
            if (!createdAt) return;

            const dateStr = createdAt.substring(0, 10);
            const year = dateStr.substring(0, 4);

            if (year >= '2025') return; // Exclude 2025+ (handled by w_triagem_taxas)

            const type = 'Taxas / Arrecadação';
            const month = dateStr.substring(0, 7);
            const key = `${month}|${type}`;
            aggregated[key] = (aggregated[key] || 0) + 1;
        });

        // ============================================================
        // 2. w_triagem_visa (2025+)
        // ============================================================
        console.log('📊 Step 2: Processing w_triagem_visa (2025+)...');
        const triagemRecords = await pb.collection('w_triagem_visa').getFullList({
            // created >= 2025 for optimization, but we check data_tally inside
            // Adicionado filtro status="Deferido" para consistência com o banco original
            filter: 'created >= "2024-12-01 00:00:00" && status = "Deferido"',
            expand: 'solicitacao_tally,solicitacao_visa', // Expandir para pegar proc_type real das solicitações
            requestKey: null
        });

        console.log(`   Found ${triagemRecords.length} records (Deferidos).`);

        triagemRecords.forEach(r => {
            // Priority: data_tally -> created
            let dateStr = r.data_tally ? r.data_tally.substring(0, 10) : r.created.substring(0, 10);
            const year = dateStr.substring(0, 4);
            if (year < '2025') return; // Only 2025+

            // Extrair tipo real da solicitação expandida
            let rawType = r.tipo || ''; // Fallback

            if (r.expand?.solicitacao_tally?.proc_type) {
                rawType = r.expand.solicitacao_tally.proc_type;
            } else if (r.expand?.solicitacao_visa?.proc_type) {
                rawType = r.expand.solicitacao_visa.proc_type;
            }

            const type = normalizeType(rawType);
            const month = dateStr.substring(0, 7);
            const key = `${month}|${type}`;
            aggregated[key] = (aggregated[key] || 0) + 1;
        });

        // ============================================================
        // 3. w_triagem_taxas (2025+)
        // ============================================================
        console.log('📊 Step 3: Processing w_triagem_taxas (2025+)...');
        const triagemTaxas = await pb.collection('w_triagem_taxas').getFullList({
            // Adicionado filtro status="Deferido"
            filter: 'created >= "2024-12-01 00:00:00" && status = "Deferido"',
            expand: 'solicitacao', // IMPORTANTE: expandir para acessar payload da taxa original
            requestKey: null
        });

        console.log(`   Found ${triagemTaxas.length} records (Deferidos).`);

        triagemTaxas.forEach(r => {
            let dateStr = r.created.substring(0, 10);

            // Tenta extrair data real do payload para registros migrados de 2025
            try {
                // Acessa payload via expand
                let payload = r.expand?.solicitacao?.payload; // w_triagem_taxas.solicitacao points to w_taxas_visa which has payload

                if (payload) {
                    if (typeof payload === 'string') {
                        try { payload = JSON.parse(payload); } catch (e) { }
                    }

                    const pDate = payload?.data?.createdAt || payload?.createdAt || payload?.created;
                    if (pDate) {
                        const pYear = pDate.substring(0, 4);
                        // Regra: Se a data extraída for 2025, usa ela (migração).
                        if (pYear === '2025') {
                            dateStr = pDate.substring(0, 10);
                        }
                    }
                }
            } catch (e) {
                console.error("Error extracting payload date for taxa", e);
            }

            const year = dateStr.substring(0, 4);
            if (year < '2025') return; // Only 2025+

            const type = 'Taxas / Arrecadação';
            const month = dateStr.substring(0, 7);
            const key = `${month}|${type}`;
            aggregated[key] = (aggregated[key] || 0) + 1;
        });

        // ============================================================
        // 4. Save to Cache
        // ============================================================
        console.log('🗑️  Clearing old cache...');
        const existing = await pb.collection(cacheCollection).getFullList();
        // Batch delete to avoid timeouts if many records
        const DELETE_BATCH = 100;
        for (let i = 0; i < existing.length; i += DELETE_BATCH) {
            const batch = pb.createBatch();
            const chunk = existing.slice(i, i + DELETE_BATCH);
            chunk.forEach(item => batch.collection(cacheCollection).delete(item.id));
            await batch.send();
        }

        console.log('📝 Inserting new cache entries...');
        let inserted = 0;
        const entries = Object.entries(aggregated);

        // Batch insert
        const BATCH_SIZE = 100;
        for (let i = 0; i < entries.length; i += BATCH_SIZE) {
            const batch = pb.createBatch();
            const chunk = entries.slice(i, i + BATCH_SIZE);

            for (const [key, count] of chunk) {
                const [month, type] = key.split('|');
                batch.collection(cacheCollection).create({
                    date: month,
                    original_type: type, // Usando tipo normalizado
                    source: 'aggregated', // Fonte agregada
                    count: count
                });
            }
            await batch.send();
            inserted += chunk.length;
            process.stdout.write(`\r   Progress: ${inserted}/${entries.length}`);
        }

        console.log(`\n\n🎉 Done! Populated ${inserted} entries covering full history.`);

    } catch (e) {
        console.error('\n❌ Error:', e.message);
        if (e.data) console.error('Details:', JSON.stringify(e.data, null, 2));
    }
}

main();
