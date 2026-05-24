import { useState } from 'react';
import AcaiMapPage from './AcaiMapPage';
import ChoroplethMapPage from './ChoroplethMapPage';
import { Map, MapPin, LayoutDashboard, Globe } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'acai' | 'choropleth'>('acai');

  return (
    <div className="h-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* Unified Global Header */}
      <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 shrink-0 z-50 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
            <Globe className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold tracking-tight">Belém Geospatial</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Portfolio Project</p>
          </div>
        </div>

        {/* Professional Tab Switcher */}
        <nav className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('acai')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'acai'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MapPin size={16} />
            Açaí no Ponto
          </button>
          <button
            onClick={() => setActiveTab('choropleth')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'choropleth'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={16} />
            Densidade Municipal
          </button>
        </nav>

        <div className="hidden md:flex items-center gap-4">
           <span className="text-xs text-slate-500 font-medium">DEVISA / SESMA</span>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'acai' ? <AcaiMapPage /> : <ChoroplethMapPage />}
      </main>
    </div>
  );
}
