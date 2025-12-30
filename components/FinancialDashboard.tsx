
import React from 'react';
import { FinancialResults } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LineChart, Line, ReferenceLine, Label } from 'recharts';
import BreakEvenAnalysis from './BreakEvenAnalysis';

interface Props {
  result: FinancialResults;
  history: FinancialResults[];
  currentInput: {
    unitPrice: number;
    unitVariableCost: number;
  };
}

const FinancialDashboard: React.FC<Props> = ({ result, history, currentInput }) => {
  const formatCurrency = (val: number) => val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
  const formatPercent = (val: number) => (val * 100).toFixed(2) + '%';

  const getStatus = (metric: string, value: number) => {
    if (metric === 'ROE') return value >= 0.15 ? 'good' : value < 0.05 ? 'bad' : 'neutral';
    if (metric === 'ROA') return value >= 0.10 ? 'good' : value < 0.03 ? 'bad' : 'neutral';
    if (metric === 'Liquidity' || metric === 'Solvency') return value >= 1.5 ? 'good' : value < 1.0 ? 'bad' : 'neutral';
    return 'neutral';
  };

  const statusColors = {
    good: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    bad: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
    neutral: 'bg-slate-300'
  };

  const tooltipStyle = {
    borderRadius: '16px',
    border: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    fontFamily: 'Poppins, sans-serif',
    padding: '12px'
  };

  const pmmData = history.map(r => ({
    year: r.year,
    Aprovisionamiento: r.pmm.storage,
    Fabricación: r.pmm.mfg,
    Venta: r.pmm.sales,
    Cobro: r.pmm.collection,
  }));

  const evolutionData = history.map(r => ({
    year: r.year,
    "Activo Fijo": r.balanceSheet.assets.fixed,
    "Clientes": r.balanceSheet.assets.receivables,
    "Tesorería": r.balanceSheet.assets.cash,
    "Patrimonio Neto": r.balanceSheet.equity.total,
    "Capital Social": r.balanceSheet.equity.socialCapital,
    "Préstamos": r.balanceSheet.liabilities.loans,
    "Proveedores": r.balanceSheet.liabilities.payables,
  }));

  const MetricCard = ({ title, value, subtitle, color = "blue", staggerClass = "", status }: any) => {
    const colorClasses: Record<string, string> = {
      blue: 'border-blue-500 text-blue-600 shadow-blue-500/5',
      emerald: 'border-emerald-500 text-emerald-600 shadow-emerald-500/5',
      indigo: 'border-indigo-500 text-indigo-600 shadow-indigo-500/5',
      rose: 'border-rose-500 text-rose-600 shadow-rose-500/5',
    };
    return (
      <div className={`p-5 rounded-xl shadow-md border-l-4 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl cursor-default opacity-0 animate-slide-up ${staggerClass} ${colorClasses[color] || colorClasses.blue} bg-white dark:bg-slate-900 flex flex-col justify-between`}>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">{title}</span>
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-slate-800 dark:text-white font-montserrat block">{value}</span>
            {status && status !== 'neutral' && (
              <div className={`w-2 h-2 rounded-full ${statusColors[status as keyof typeof statusColors]} animate-pulse`}></div>
            )}
          </div>
          {subtitle && <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tighter">{subtitle}</p>}
        </div>
      </div>
    );
  };

  const BalanceRow = ({ label, value, indent = false, isTotal = false }: { label: string, value: number, indent?: boolean, isTotal?: boolean }) => (
    <div className={`flex justify-between items-center py-2 ${indent ? 'pl-6 text-slate-500' : 'text-slate-800 dark:text-slate-200'} ${isTotal ? 'border-t-2 border-slate-200 dark:border-slate-700 mt-2 pt-3 font-black text-lg' : 'font-medium text-sm'}`}>
      <span>{label}</span>
      <span className="font-mono">{formatCurrency(value)}</span>
    </div>
  );

  return (
    <div className="space-y-8 font-poppins">
      {/* 1. KPIs Superiores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Beneficio Neto" value={formatCurrency(result.netIncome)} subtitle="Excedente del ejercicio" color="emerald" staggerClass="stagger-1" />
        <MetricCard title="Rent. Económica" value={formatPercent(result.roa)} subtitle="BAII / Activo Total" color="blue" staggerClass="stagger-2" status={getStatus('ROA', result.roa)} />
        <MetricCard title="Rent. Financiera" value={formatPercent(result.roe)} subtitle="BN / Patrimonio Neto" color="indigo" staggerClass="stagger-3" status={getStatus('ROE', result.roe)} />
        <MetricCard title="Apalancamiento" value={result.leverage.toFixed(2)} subtitle="ROE / ROA" color={result.leverage > 1 ? "emerald" : "rose"} staggerClass="stagger-4" />
      </div>

      {/* 2. ANÁLISIS DE EQUILIBRIO (Breakeven) - Posición Prominente */}
      <BreakEvenAnalysis result={result} unitPrice={currentInput.unitPrice} unitVariableCost={currentInput.unitVariableCost} />

      {/* 3. BALANCE DE SITUACIÓN */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden opacity-0 animate-slide-up stagger-5">
        <div className="bg-slate-900 px-8 py-5 flex justify-between items-center border-b border-slate-800">
          <h3 className="text-white text-xl font-black flex items-center gap-3 font-montserrat uppercase tracking-tight">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
            </svg>
            Balance de Situación
          </h3>
          <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-1.5 rounded-full border border-blue-500/30">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            <span className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Balance Cuadrado</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          {/* ACTIVO */}
          <div className="p-8 space-y-6">
            <h4 className="text-blue-600 font-black text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-blue-600"></span>
              Estructura Económica (Activo)
            </h4>
            
            <div className="space-y-1">
              <h5 className="text-[10px] font-black text-slate-400 uppercase mb-2">Activo No Corriente</h5>
              <BalanceRow label="Inmovilizado Material (Fijo)" value={result.balanceSheet.assets.fixed} indent />
            </div>

            <div className="space-y-1 pt-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase mb-2">Activo Corriente</h5>
              <BalanceRow label="Clientes y Deudores" value={result.balanceSheet.assets.receivables} indent />
              <BalanceRow label="Efectivo y Tesorería" value={result.balanceSheet.assets.cash} indent />
            </div>

            <BalanceRow label="TOTAL ACTIVO" value={result.balanceSheet.assets.total} isTotal />
          </div>

          {/* PASIVO Y PN */}
          <div className="p-8 space-y-6 bg-slate-50/50 dark:bg-slate-800/20">
            <h4 className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-emerald-600"></span>
              Estructura Financiera (Pasivo + PN)
            </h4>

            <div className="space-y-1">
              <h5 className="text-[10px] font-black text-slate-400 uppercase mb-2">Patrimonio Neto</h5>
              <BalanceRow label="Capital Social" value={result.balanceSheet.equity.socialCapital} indent />
              <BalanceRow label="Reservas y Resultados" value={result.balanceSheet.equity.reserves} indent />
            </div>

            <div className="space-y-1 pt-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase mb-2">Pasivo No Corriente</h5>
              <BalanceRow label="Préstamos a Largo Plazo" value={result.balanceSheet.liabilities.loans} indent />
            </div>

            <div className="space-y-1 pt-4">
              <h5 className="text-[10px] font-black text-slate-400 uppercase mb-2">Pasivo Corriente</h5>
              <BalanceRow label="Proveedores y Acreedores" value={result.balanceSheet.liabilities.payables} indent />
            </div>

            <BalanceRow label="TOTAL PASIVO + PN" value={result.balanceSheet.liabilities.total + result.balanceSheet.equity.total} isTotal />
          </div>
        </div>
      </div>

      {/* 4. OPERACIONES Y RATIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-800 opacity-0 animate-slide-up stagger-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 font-montserrat">
            <div className="w-1 h-4 bg-blue-500 rounded"></div>
            Operaciones y Productividad
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Productividad Global:</span>
              <span className="font-bold text-blue-600">{result.productivity.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400 font-medium">PMM Total:</span>
              <span className="font-bold text-blue-600">{result.pmm.total} días</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow border border-slate-200 dark:border-slate-800 opacity-0 animate-slide-up stagger-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 font-montserrat">
            <div className="w-1 h-4 bg-emerald-500 rounded"></div>
            Ratios de Estructura
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Ratio Liquidez (AC/PC):</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${result.liquidityRatio >= 1.5 ? 'text-emerald-600' : result.liquidityRatio < 1.0 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                  {result.liquidityRatio.toFixed(2)}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full ${statusColors[getStatus('Liquidity', result.liquidityRatio) as keyof typeof statusColors]}`}></div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Ratio Solvencia (A/P):</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${result.solvencyRatio >= 1.5 ? 'text-emerald-600' : result.solvencyRatio < 1.0 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                  {result.solvencyRatio.toFixed(2)}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full ${statusColors[getStatus('Solvency', result.solvencyRatio) as keyof typeof statusColors]}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. EVOLUCIÓN TEMPORAL (PMM y Tesorería) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 opacity-0 animate-fade-in stagger-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 font-montserrat">
            <div className="w-1 h-4 bg-indigo-500 rounded"></div>
            Evolución del PMM (Días)
          </h3>
          <div className="h-[250px] w-full font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pmmData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" tickFormatter={(v) => `Año ${v}`} tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc', opacity: 0.1 }} contentStyle={tooltipStyle} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
                <Bar name="Aprov." dataKey="Aprovisionamiento" stackId="a" fill="#94a3b8" />
                <Bar name="Fabr." dataKey="Fabricación" stackId="a" fill="#64748b" />
                <Bar name="Venta" dataKey="Venta" stackId="a" fill="#475569" />
                <Bar name="Cobro" dataKey="Cobro" stackId="a" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 opacity-0 animate-fade-in stagger-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 font-montserrat">
            <div className="w-1 h-4 bg-emerald-500 rounded"></div>
            Evolución de Tesorería (€)
          </h3>
          <div className="h-[250px] w-full font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" tickFormatter={(v) => `Año ${v}`} tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="Tesorería" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6. NUEVA FILA: COMPOSICIÓN DEL PASIVO Y CAPITAL SOCIAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 opacity-0 animate-fade-in stagger-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 font-montserrat">
            <div className="w-1 h-4 bg-rose-500 rounded"></div>
            Composición del Pasivo (Deuda Total)
          </h3>
          <div className="h-[250px] w-full font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" tickFormatter={(v) => `Año ${v}`} tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip cursor={{ fill: '#f8fafc', opacity: 0.1 }} contentStyle={tooltipStyle} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
                <Bar name="Préstamos (L/P)" dataKey="Préstamos" stackId="b" fill="#6366f1" />
                <Bar name="Proveedores (C/P)" dataKey="Proveedores" stackId="b" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 opacity-0 animate-fade-in stagger-6">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 font-montserrat">
            <div className="w-1 h-4 bg-indigo-600 rounded"></div>
            Evolución del Capital Social (€)
          </h3>
          <div className="h-[250px] w-full font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" stroke="#64748b" tickFormatter={(v) => `Año ${v}`} tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="stepAfter" dataKey="Capital Social" stroke="#4f46e5" strokeWidth={4} dot={{ r: 6, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
