
import React from 'react';
import { FinancialResults } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Props {
  results: FinancialResults[];
  npv: number;
  aiSummary: string;
  onRestart: () => void;
}

const FinalReport: React.FC<Props> = ({ results, npv, aiSummary, onRestart }) => {
  const formatCurrency = (val: number) => val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto transition-colors relative">
      <div className="absolute top-8 right-8 flex gap-3 no-print">
        <button 
          onClick={handleExportPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Exportar Informe
        </button>
      </div>

      <div className="text-center mb-12">
        <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Simulación de Gestión Educativa</div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Informe Ejecutivo de Desempeño</h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium">Resultados consolidados de la trayectoria estratégica y financiera proyectada.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center relative overflow-hidden group transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          <span className="block text-xs text-slate-400 font-black uppercase mb-2 tracking-wider">VAN (Tasa 5%)</span>
          <span className={`text-3xl font-black ${npv >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(npv)}
          </span>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Viabilidad del Proyecto</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center relative overflow-hidden transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
          <span className="block text-xs text-slate-400 font-black uppercase mb-2 tracking-wider">Beneficio Acumulado</span>
          <span className="text-3xl font-black text-indigo-700">
            {formatCurrency(results.reduce((acc, curr) => acc + curr.netIncome, 0))}
          </span>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Excedente Total Generado</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center relative overflow-hidden transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <span className="block text-xs text-slate-400 font-black uppercase mb-2 tracking-wider">ROE Medio Anual</span>
          <span className="text-3xl font-black text-slate-800">
            {(results.reduce((acc, curr) => acc + curr.roe, 0) / (results.length || 1) * 100).toFixed(2)}%
          </span>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Rentabilidad Media</p>
        </div>
      </div>

      <div className="space-y-16">
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <span className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs">01</span>
              Dinámica de Rentabilidades
            </h2>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
              <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div> ROE</span>
              <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> ROA</span>
            </div>
          </div>
          <div className="h-80 w-full bg-slate-50 p-6 rounded-2xl border border-slate-100 font-bold transition-all">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={results} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="finalRoeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="finalRoaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="year" 
                  tickFormatter={(v) => `AÑO ${v}`} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="roe" 
                  stroke="#2563eb" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#finalRoeGradient)" 
                  name="ROE" 
                />
                <Area 
                  type="monotone" 
                  dataKey="roa" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  fillOpacity={1} 
                  fill="url(#finalRoaGradient)" 
                  name="ROA" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="bg-slate-900 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs">02</span>
            Matriz de Seguimiento Anual
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm transition-all bg-white">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5">Año</th>
                  <th className="px-6 py-5">Cifra Negocio</th>
                  <th className="px-6 py-5">B. Neto</th>
                  <th className="px-6 py-5">ROA</th>
                  <th className="px-6 py-5">ROE</th>
                  <th className="px-6 py-5">Liquidez</th>
                  <th className="px-6 py-5">Solvencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold transition-all">
                {results.map((r, index) => (
                  <tr 
                    key={r.year} 
                    className="hover:bg-slate-50 transition-colors opacity-0 animate-fade-in"
                    style={{ animationDelay: `${0.1 + index * 0.08}s` }}
                  >
                    <td className="px-6 py-4 text-slate-700">AÑO {r.year}</td>
                    <td className="px-6 py-4 text-slate-900">{formatCurrency(r.revenue)}</td>
                    <td className={`px-6 py-4 font-black ${r.netIncome >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(r.netIncome)}</td>
                    <td className="px-6 py-4 text-slate-600">{(r.roa * 100).toFixed(2)}%</td>
                    <td className="px-6 py-4 text-slate-600">{(r.roe * 100).toFixed(2)}%</td>
                    <td className="px-6 py-4 text-slate-600">{r.liquidityRatio.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-600">{r.solvencyRatio.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-slate-900 text-slate-100 p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl transition-all">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full blur-[140px] opacity-10 -mr-40 -mt-40"></div>
          
          <h2 className="text-2xl font-black mb-8 flex items-center gap-4 relative z-10 uppercase tracking-tighter">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/40">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
            </div>
            Dictamen del Comité Financiero (IA)
          </h2>
          <div className="prose prose-invert prose-blue max-w-none relative z-10">
            {aiSummary ? (
              <div className="whitespace-pre-wrap text-slate-300 leading-relaxed text-lg font-medium italic border-l-2 border-blue-500/30 pl-8">
                {aiSummary}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="animate-pulse bg-slate-800 h-4 w-5/6 rounded-full"></div>
                <div className="animate-pulse bg-slate-800 h-4 w-4/6 rounded-full"></div>
                <div className="animate-pulse bg-slate-800 h-4 w-3/4 rounded-full"></div>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="mt-16 pt-10 border-t border-slate-100 text-center no-print">
        <button 
          onClick={onRestart}
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Nueva Simulación Estratégica
        </button>
      </div>
    </div>
  );
};

export default FinalReport;
