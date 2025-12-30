
import React from 'react';
import { FinancialResults } from '../types';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot, Label } from 'recharts';

interface Props {
  result: FinancialResults;
  unitPrice: number;
  unitVariableCost: number;
}

const BreakEvenAnalysis: React.FC<Props> = ({ result, unitPrice, unitVariableCost }) => {
  const formatCurrency = (val: number) => val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  
  // Generar puntos para el gráfico
  const currentUnits = result.revenue / unitPrice;
  const beUnits = result.breakEvenUnits;
  
  // El eje X llegará hasta un 40% más del máximo entre unidades actuales y punto muerto
  const maxUnits = Math.max(currentUnits, beUnits) * 1.4;
  const step = maxUnits / 10;
  
  const data = Array.from({ length: 11 }).map((_, i) => {
    const q = i * step;
    const rev = q * unitPrice;
    const tc = result.fixedCosts + (q * unitVariableCost);
    return {
      units: Math.round(q),
      revenue: rev,
      totalCost: tc,
      fixedCost: result.fixedCosts,
      // Solo calculamos el área de beneficio si estamos por encima del punto muerto
      profitArea: rev > tc ? [tc, rev] : [rev, rev],
      lossArea: tc > rev ? [rev, tc] : [rev, rev]
    };
  });

  const safetyMarginPercent = result.revenue > 0 
    ? ((result.revenue - result.breakEvenRevenue) / result.revenue * 100).toFixed(1) 
    : "0";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 mt-8 opacity-0 animate-slide-up stagger-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 font-montserrat">
            <div className="w-1.5 h-5 bg-blue-600 rounded"></div>
            Gráfico de Equilibrio (Coste-Volumen-Beneficio)
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1">Análisis visual del umbral de rentabilidad y zona de seguridad.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl">
            <span className="block text-[10px] font-black text-emerald-600 uppercase tracking-wider">Margen Seguridad</span>
            <span className="text-lg font-black text-emerald-700">{safetyMarginPercent}%</span>
          </div>
          <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl">
            <span className="block text-[10px] font-black text-blue-600 uppercase tracking-wider">Punto Muerto</span>
            <span className="text-lg font-black text-blue-700">{Math.round(beUnits).toLocaleString()} uds.</span>
          </div>
        </div>
      </div>

      <div className="h-[400px] w-full font-medium">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="units" 
              type="number" 
              domain={[0, maxUnits]} 
              stroke="#64748b" 
              tick={{ fontSize: 11, fontWeight: 600 }}
              label={{ value: 'Unidades Vendidas (Q)', position: 'insideBottom', offset: -10, fontSize: 12, fontWeight: 700, fill: '#475569' }}
            />
            <YAxis 
              stroke="#64748b" 
              tick={{ fontSize: 11, fontWeight: 600 }}
              tickFormatter={(v) => `${(v/1000).toFixed(0)}k€`}
              label={{ value: 'Euros (€)', angle: -90, position: 'insideLeft', fontSize: 12, fontWeight: 700, fill: '#475569' }}
            />
            <Tooltip 
              formatter={(value: any, name: string) => [formatCurrency(Number(value)), name === 'revenue' ? 'Ingresos' : 'Costes Totales']}
              labelFormatter={(label) => `Volumen: ${label} unidades`}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            
            {/* Áreas de Beneficio y Pérdida */}
            <Area dataKey="profitArea" fill="#10b981" fillOpacity={0.1} stroke="none" />
            <Area dataKey="lossArea" fill="#f43f5e" fillOpacity={0.05} stroke="none" />

            {/* Líneas Principales */}
            <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={4} dot={false} activeDot={{ r: 6 }} name="Ingresos" />
            <Line type="monotone" dataKey="totalCost" stroke="#475569" strokeWidth={3} dot={false} name="Costes Totales" />
            <Line type="monotone" dataKey="fixedCost" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Costes Fijos" />

            {/* Punto Muerto Intersección */}
            <ReferenceLine x={beUnits} stroke="#64748b" strokeDasharray="3 3">
              <Label value="Punto Muerto" position="top" fill="#64748b" fontSize={10} fontWeight={800} />
            </ReferenceLine>
            <ReferenceLine y={result.breakEvenRevenue} stroke="#64748b" strokeDasharray="3 3" />
            
            {/* Posición Actual */}
            <ReferenceLine x={currentUnits} stroke="#2563eb" strokeOpacity={0.3} strokeWidth={20} />
            <ReferenceDot x={currentUnits} y={result.revenue} r={6} fill="#2563eb" stroke="#fff" strokeWidth={3} />
            
            {/* Anotación Margen de Seguridad */}
            {currentUnits > beUnits && (
               <ReferenceLine 
                x={ (beUnits + currentUnits) / 2 } 
                stroke="none"
              >
                <Label 
                  value="← Margen de Seguridad →" 
                  position="bottom" 
                  fill="#10b981" 
                  fontSize={11} 
                  fontWeight={900} 
                  offset={15}
                />
              </ReferenceLine>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Interpretación del Punto Muerto
          </h4>
          <p className="text-slate-600 leading-relaxed italic">
            Para no perder dinero, la empresa debe vender al menos <span className="font-black text-slate-900">{Math.round(beUnits).toLocaleString()} unidades</span>. 
            A partir de este volumen, cada unidad adicional vendida contribuye directamente al beneficio con {formatCurrency(unitPrice - unitVariableCost)} (margen de contribución).
          </p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <h4 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Significado del Margen de Seguridad
          </h4>
          <p className="text-emerald-800 leading-relaxed italic">
            Tus ventas actuales están un <span className="font-black">{safetyMarginPercent}%</span> por encima del punto crítico. 
            Esto significa que tus ingresos podrían caer hasta esa proporción antes de que la empresa empiece a incurrir en pérdidas operativas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BreakEvenAnalysis;
