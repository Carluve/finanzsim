
import React, { useState, useEffect } from 'react';
import { YearInput, FinancialResults } from '../types';

interface Props {
  year: number;
  onSimulate: (input: YearInput) => void;
  loading: boolean;
  lastResult: FinancialResults | null;
}

const YearForm: React.FC<Props> = ({ year, onSimulate, loading, lastResult }) => {
  const [formData, setFormData] = useState<YearInput>({
    unitsSold: 1000,
    unitPrice: 20,
    unitVariableCost: 10,
    fixedCosts: 5000,
    newInvestment: 0,
    newLoans: 0,
    newEquity: 0,
    collectionDays: 30,
    paymentDays: 30,
  });

  // Sync with last result to pre-fill common fields or reset specific investment fields
  useEffect(() => {
    if (lastResult) {
      setFormData(prev => ({
        ...prev,
        newInvestment: 0,
        newLoans: 0,
        newEquity: 0
      }));
    }
  }, [lastResult, year]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSimulate(formData);
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 dark:text-white font-medium";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 space-y-6 transition-colors">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">Datos Operativos - Año {year}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Unidades Vendidas</label>
          <input type="number" name="unitsSold" value={formData.unitsSold} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Precio Unitario (€)</label>
          <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Coste Variable Unit. (€)</label>
          <input type="number" name="unitVariableCost" value={formData.unitVariableCost} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Costes Fijos Totales (€)</label>
          <input type="number" name="fixedCosts" value={formData.fixedCosts} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Inversión y Financiación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nueva Inversión (€)</label>
            <input type="number" name="newInvestment" value={formData.newInvestment} onChange={handleChange} className={inputClass} />
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Nuevos Préstamos (€)</label>
              <input type="number" name="newLoans" value={formData.newLoans} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ampliación Capital (€)</label>
              <input type="number" name="newEquity" value={formData.newEquity} onChange={handleChange} className={`${inputClass} border-indigo-200 dark:border-indigo-900`} />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Gestión de Tesorería</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Días Cobro Clientes</label>
            <input type="number" name="collectionDays" value={formData.collectionDays} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Días Pago Proveedores</label>
            <input type="number" name="paymentDays" value={formData.paymentDays} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${loading ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:transform active:scale-95'}`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando Año...
          </>
        ) : (
          'Simular Año'
        )}
      </button>
    </form>
  );
};

export default YearForm;
