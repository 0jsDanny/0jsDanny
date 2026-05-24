import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, Users, CheckCircle } from 'lucide-react';

/**
 * Exemplo prático de um componente modular de Dashboard.
 * Na arquitetura real, estes dados viriam hidratados via TanStack Query a partir de uma API Go de alta performance.
 */

const DashboardCard = ({ title, value, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
        <Icon size={24} />
      </div>
    </div>
    {trend && (
      <div className={`mt-4 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'} flex items-center`}>
        <span className="font-medium">{trend > 0 ? '+' : ''}{trend}%</span>
        <span className="text-gray-400 ml-2">em relação ao mês passado</span>
      </div>
    )}
  </div>
);

export default function App() {
  const [loading, setLoading] = useState(true);

  // Simulação rápida de fetching de dados (Mock)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Activity className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Health Analytics PoC</h1>
          <p className="text-gray-500 mt-2">Visão em tempo real de indicadores simulados de saúde pública.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard title="Processos Ativos" value="2.341" icon={Activity} trend={12} />
          <DashboardCard title="Licenças Emitidas" value="845" icon={CheckCircle} trend={5} />
          <DashboardCard title="Pendências" value="124" icon={AlertCircle} trend={-2} />
          <DashboardCard title="Usuários Ativos" value="89" icon={Users} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimas Atividades de Triagem</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">ID do Processo</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">Tipo</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="py-3 px-4 text-sm font-medium text-gray-500">Data</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((item) => (
                  <tr key={item} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">#PRC-{item}890</td>
                    <td className="py-3 px-4 text-sm text-gray-600">Renovação Anual</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Deferido</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">Hoje, 14:30</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
