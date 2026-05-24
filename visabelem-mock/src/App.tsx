import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ModeProvider, useMode } from './contexts/ModeContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { CitizenHome } from './pages/CitizenHome';
import { LicensingWizard } from './pages/LicensingWizard';
import { TriageQueue } from './pages/TriageQueue';
import { ProcessDetail } from './pages/ProcessDetail';
import { ProcessDetailCompleted } from './pages/ProcessDetailCompleted';
import { ManipuladoresPage } from './pages/ManipuladoresPage';
import { CompanyPortal } from './pages/CompanyPortal';
import { CompanySettings } from './pages/CompanySettings';
import { CompanyLicensingWizard } from './pages/CompanyLicensingWizard';
import ChatMockPage from './pages/ChatMockPage';
import { AcaiMapPage } from './pages/AcaiMapPage';
import { AcaiAppPage } from './pages/AcaiAppPage';
import { PrescribersPage } from './pages/PrescribersPage';
import { HRManagementPage } from './pages/HRManagementPage';

// Placeholder pages for navigation structure
const PlaceholderPage = ({ title, description }: { title: string; description?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
    <div className="bg-gray-100 rounded-full p-6 mb-6">
      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-500 max-w-md">{description || 'Esta página será implementada na versão completa do sistema.'}</p>
  </div>
);

const PublicLayoutWrapper = () => {
  const { setRole } = useMode();
  useEffect(() => { setRole('public'); }, [setRole]);
  return <AppLayout />;
};

const AdminLayoutWrapper = () => {
  const { setRole } = useMode();
  useEffect(() => { setRole('admin_manager_medicamentos'); }, [setRole]);
  return <AppLayout />;
};

const CompanyLayoutWrapper = () => {
  const { setRole } = useMode();
  useEffect(() => { setRole('company'); }, [setRole]);
  return <AppLayout />;
};

function App() {
  return (
    <ModeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayoutWrapper />}>
            <Route path="/" element={<CitizenHome />} />
            <Route path="/novo" element={<LicensingWizard />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayoutWrapper />}>
            <Route index element={<Dashboard />} />
            <Route path="chat" element={<ChatMockPage />} />
            <Route path="relatorios" element={<PlaceholderPage title="Relatórios" description="Geração de relatórios consolidados do sistema." />} />
            <Route path="analiticos" element={<PlaceholderPage title="Analíticos" description="Dashboards e métricas de performance operacional." />} />

            {/* Triagem */}
            <Route path="triagem" element={<TriageQueue />} />
            <Route path="triagem/licenciamento" element={<TriageQueue />} />
            <Route path="triagem/diversos" element={<TriageQueue />} />

            {/* Arquivo */}
            <Route path="arquivo" element={<PlaceholderPage title="Arquivo" description="Gestão do arquivo físico e digital de processos." />} />

            {/* Setores */}
            <Route path="setores/alimentos" element={<PlaceholderPage title="Setor de Alimentos (DVSA)" description="Gerenciamento de processos do setor de alimentos." />} />
            <Route path="setores/engenharia" element={<PlaceholderPage title="Setor de Engenharia" description="Gerenciamento de projetos e análise técnica." />} />
            <Route path="setores/saude" element={<PlaceholderPage title="Setor de Saúde (DVSCEP)" description="Gerenciamento de processos de serviços de saúde." />} />
            <Route path="setores/medicamentos" element={<PlaceholderPage title="Setor de Medicamentos (DVSDM)" description="Gerenciamento de processos de drogarias e farmácias." />} />

            {/* Documentos */}
            <Route path="documentos/licenca-funcionamento" element={<PlaceholderPage title="Licença de Funcionamento (LF)" description="Emissão e gestão de licenças sanitárias e alvarás." />} />
            <Route path="documentos/projeto" element={<PlaceholderPage title="Aprovação de Projeto Arq. (APA)" description="Análise e aprovação de projetos arquitetônicos para VISA." />} />
            <Route path="documentos/carta-credito" element={<PlaceholderPage title="Carta de Crédito (CC)" description="Gestão de créditos e garantias financeiras vinculadas." />} />
            <Route path="documentos/relatorio-inspecao" element={<PlaceholderPage title="Relatório de Inspeção (RI)" description="Emissão e consulta de relatórios de vistoria técnica." />} />
            <Route path="documentos/auto-infracao" element={<PlaceholderPage title="Auto de Infração (AI)" description="Registro e acompanhamento de infrações sanitárias." />} />
            <Route path="documentos/autorizacao-ambiental" element={<PlaceholderPage title="SAC/SAA Água para Consumo Humano" description="Gestão de autorizações do sistema de abastecimento de água para consumo humano." />} />
            <Route path="documentos/dispensa-licenca" element={<PlaceholderPage title="Dispensa de Licença de Funcionamento (DLF)" description="Emissão de certificados de isenção ou dispensa de licenciamento." />} />

            {/* Fiscalização */}
            <Route path="fiscalizacao/tis" element={<PlaceholderPage title="TIS - Termo de Inspeção Sanitária" description="Registro detalhado de vistorias e inspeções técnicas realizadas." />} />
            <Route path="fiscalizacao/ti" element={<PlaceholderPage title="TI - Termo de Intimação" description="Notificação oficial para correção de irregularidades identificadas." />} />
            <Route path="fiscalizacao/aap" element={<PlaceholderPage title="AAP - Auto de Apreensão" description="Registro de apreensão de produtos ou equipamentos em desacordo com a legislação." />} />
            <Route path="fiscalizacao/tic" element={<PlaceholderPage title="TIC - Termo de Interdição Cautelar" description="Documento para interdição imediata e preventiva de estabelecimentos ou atividades." />} />
            <Route path="fiscalizacao/tca" element={<PlaceholderPage title="TCA - Termo de Colheita de Amostra" description="Registro de coleta de amostras para análise laboratorial fiscal." />} />

            {/* Future/Refactoring */}
            <Route path="manipuladores">
              <Route index element={<Navigate to="inicio" replace />} />
              <Route path="inicio" element={<ManipuladoresPage />} />
              <Route path="analiticos" element={<PlaceholderPage title="Analíticos - Manipuladores" description="Métricas e performance das turmas e emissões." />} />
              <Route path="triagem" element={<PlaceholderPage title="Triagem - Manipuladores" description="Gestão de inscrições e análise de requisitos para cursos." />} />
              <Route path="agendamento" element={<PlaceholderPage title="Agendamento - Manipuladores" description="Calendário oficial de turmas e locações de palestras." />} />
              <Route path="certificados" element={<PlaceholderPage title="Certificados - Manipuladores" description="Repositório e consulta de certificados emitidos." />} />
            </Route>

            <Route path="mapeamento">
              <Route path="empresas" element={<PlaceholderPage title="Geomapeamento - Empresas" description="Localização e rotas para inspeção em empresas licenciadas." />} />
              <Route path="acai" element={<AcaiMapPage />} />
              <Route path="acai-app" element={<AcaiAppPage />} />
              <Route path="sac" element={<PlaceholderPage title="Geomapeamento - Pontos de SAC" description="Localização dos pontos de abastecimento de água (SAC/SAA) para monitoramento de qualidade." />} />
            </Route>

            <Route path="prescritores">
              <Route index element={<PrescribersPage />} />
              <Route path="talonarios" element={<PrescribersPage />} />
              <Route path="cadastro-pf" element={<PrescribersPage />} />
              <Route path="instituicoes" element={<PrescribersPage />} />
              <Route path="talidomida" element={<PlaceholderPage title="Protocolos Talidomida" description="Fluxo específico para cadastramento de prescritores e unidades de Talidomida (RDC 11/2011)." />} />
              <Route path="base" element={<PlaceholderPage title="Base de Prescritores" description="Consulta consolidada e estatísticas de prescritores registrados no município." />} />
            </Route>

            {/* RH Routes */}
            <Route path="rh">
              <Route index element={<HRManagementPage />} />
              <Route path="servidores" element={<HRManagementPage />} />
              <Route path="frequencia" element={<HRManagementPage />} />
            </Route>

            <Route path="chamados" element={<PlaceholderPage title="Chamados" description="Sistema de tickets e suporte interno." />} />
            <Route path="configuracoes" element={<PlaceholderPage title="Configurações" description="Configurações do sistema e preferências." />} />

            {/* Process Info inside Admin */}
            <Route path="processo/concluido" element={<ProcessDetailCompleted />} />
            <Route path="processo/:id" element={<ProcessDetail />} />
          </Route>

          {/* Company Routes */}
          <Route path="/empresa/:companyId" element={<CompanyLayoutWrapper />}>
            <Route index element={<CompanyPortal />} />
            <Route path="ativos" element={<CompanyPortal />} />
            <Route path="pendentes" element={<PlaceholderPage title="Pendências Técnicas" description="Responda aqui às exigências solicitadas pela fiscalização." />} />
            <Route path="historico" element={<PlaceholderPage title="Histórico de Alvarás" description="Consulte e baixe suas licenças e alvarás emitidos anteriormente." />} />
            <Route path="mensagens" element={<PlaceholderPage title="Notificações" description="Comunicados importantes da Vigilância Sanitária para sua empresa." />} />
            <Route path="configuracoes" element={<CompanySettings />} />
            <Route path="ajuda" element={<PlaceholderPage title="Ajuda e Manuais" description="Tutoriais e legislação para auxiliar no seu licenciamento." />} />
            <Route path="novo-processo" element={<CompanyLicensingWizard />} />

            <Route path="processo/:id" element={<ProcessDetail />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ModeProvider>
  );
}

export default App;
