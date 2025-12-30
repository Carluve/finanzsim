
import React, { useState } from 'react';
import { YearInput, FinancialResults, SimulationState } from './types';
import { calculateYearResults, calculateNPV } from './services/financeService';
import { getAnnualFeedback, getFinalReportFeedback } from './services/geminiService';
import { INITIAL_CASH } from './constants';
import YearForm from './components/YearForm';
import FinancialDashboard from './components/FinancialDashboard';
import FinalReport from './components/FinalReport';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'FINISHED'>('START');
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);

  const [simulation, setSimulation] = useState<SimulationState & { lastInput?: YearInput }>({
    config: { totalYears: 1, currentYear: 1, isFinished: false },
    results: [],
    aiFeedback: {}
  });
  const [loading, setLoading] = useState(false);

  const startSimulation = (years: number) => {
    setSimulation({
      config: { totalYears: years, currentYear: 1, isFinished: false },
      results: [],
      aiFeedback: {}
    });
    setGameState('PLAYING');
  };

  const confirmRestart = () => {
    setShowRestartConfirm(true);
  };

  const restartSimulation = () => {
    setSimulation({
      config: { totalYears: 1, currentYear: 1, isFinished: false },
      results: [],
      aiFeedback: {}
    });
    setGameState('START');
    setShowRestartConfirm(false);
  };

  const handleSimulateYear = async (input: YearInput) => {
    setLoading(true);
    const lastResult = simulation.results[simulation.results.length - 1] || null;
    const newResult = calculateYearResults(input, simulation.config.currentYear, lastResult);

    // Get AI Feedback
    const feedback = await getAnnualFeedback(newResult);

    setSimulation(prev => ({
      ...prev,
      results: [...prev.results, newResult],
      lastInput: input,
      aiFeedback: { ...prev.aiFeedback, [newResult.year]: feedback },
      config: {
        ...prev.config,
        currentYear: prev.config.currentYear + 1,
        isFinished: prev.config.currentYear === prev.config.totalYears
      }
    }));
    setLoading(false);
  };

  const finishSimulation = async () => {
    setLoading(true);
    const finalFeedback = await getFinalReportFeedback(simulation.results);
    setSimulation(prev => ({ ...prev, finalReportFeedback: finalFeedback }));
    setGameState('FINISHED');
    setLoading(false);
  };

  if (gameState === 'START') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200 transition-all animate-slide-up">
          <div className="mb-6 bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.5 4.5L21.75 7.5M21.75 7.5V12M21.75 7.5H17.25" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 font-montserrat">FinanzSim</h1>
          <p className="text-slate-600 mb-8 font-poppins">Simulador de gestión financiera para estudiantes de Empresariales.</p>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700 text-left font-semibold">Años de simulación (1-12):</label>
            <input
              type="number"
              min="1"
              max="12"
              defaultValue="3"
              id="yearsInput"
              className="w-full px-4 py-3 border border-slate-300 bg-white text-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium"
            />
            <button
              onClick={() => {
                const val = (document.getElementById('yearsInput') as HTMLInputElement).value;
                startSimulation(parseInt(val));
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              Comenzar Simulación
            </button>
          </div>
          <div className="mt-8 p-4 bg-slate-100 rounded-lg text-sm text-slate-500 italic font-medium">
            Capital Inicial: {INITIAL_CASH.toLocaleString()}€ en Tesorería.
          </div>
        </div>
        <footer className="mt-8 text-center text-xs text-slate-400 max-w-md">
          <p className="mb-2">Pet project de investigación de la <strong>Facultad de Ciencias Económicas, Empresariales y Turismo</strong> de la Universidad de Alcalá (UAH)</p>
          <p className="flex items-center justify-center gap-1">
            Powered by
            <svg className="w-4 h-4 inline" viewBox="0 0 128 128" fill="currentColor"><path d="M64.002 0C28.655 0 0 28.655 0 64c0 35.347 28.655 64 64.002 64C99.347 128 128 99.347 128 64c0-35.345-28.653-64-63.998-64zm17.136 98.028c-.543 1.623-2.085 3.453-3.981 3.453H50.844c-1.896 0-3.439-1.83-3.982-3.453L33.846 58.01c-.542-1.623.372-2.953 2.038-2.953h14.725c1.667 0 3.37 1.33 3.802 2.953l7.589 28.523 7.59-28.523c.432-1.623 2.134-2.953 3.801-2.953h14.726c1.666 0 2.58 1.33 2.037 2.953z" /></svg>
            <strong>Cloudflare</strong>
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 transition-colors duration-300">
      {/* Restart Confirmation Modal */}
      {showRestartConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-sm w-full animate-slide-up">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">¿Reiniciar simulación?</h3>
            <p className="text-slate-500 mb-8 font-medium">Se perderán todos los datos actuales y volverás a la pantalla de inicio. Esta acción no se puede deshacer.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={restartSimulation}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-rose-600/20"
              >
                Sí, reiniciar todo
              </button>
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600 tracking-tight font-montserrat">FinanzSim</span>
          <span className="text-slate-300 font-thin text-xl">/</span>
          <span className="text-slate-600 font-semibold text-sm bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Año {simulation.config.currentYear > simulation.config.totalYears ? simulation.config.totalYears : simulation.config.currentYear} de {simulation.config.totalYears}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={confirmRestart}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Reiniciar
          </button>

          {gameState === 'PLAYING' && (
            <button
              onClick={finishSimulation}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Finalizar e Informe
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {gameState === 'PLAYING' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Side */}
              <div className="lg:col-span-4 space-y-6">
                {!simulation.config.isFinished && simulation.config.currentYear <= simulation.config.totalYears && (
                  <YearForm
                    year={simulation.config.currentYear}
                    onSimulate={handleSimulateYear}
                    loading={loading}
                    lastResult={simulation.results[simulation.results.length - 1]}
                  />
                )}
                {simulation.config.isFinished && (
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-blue-800 shadow-sm animate-pulse">
                    <h3 className="font-bold text-lg mb-2">Simulación Completada</h3>
                    <p className="text-sm font-medium">Has terminado todos los periodos. Pulsa el botón superior para generar tu informe ejecutivo final.</p>
                  </div>
                )}

                {/* Latest AI Feedback Card */}
                {simulation.results.length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 animate-slide-up stagger-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-yellow-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                        </svg>
                      </div>
                      Análisis del Profesor (Año {simulation.results[simulation.results.length - 1].year})
                    </h3>
                    <div className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-lg border border-slate-100 italic">
                      {simulation.aiFeedback[simulation.results[simulation.results.length - 1].year] || "Generando análisis..."}
                    </div>
                  </div>
                )}
              </div>

              {/* Visualization Side */}
              <div className="lg:col-span-8 space-y-8">
                {simulation.results.length > 0 ? (
                  <>
                    <FinancialDashboard
                      result={simulation.results[simulation.results.length - 1]}
                      history={simulation.results}
                      currentInput={simulation.lastInput || { unitPrice: 0, unitVariableCost: 0 }}
                    />

                    {/* Evolution Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 transition-colors">
                      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 font-montserrat">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                        Evolución Temporal del Negocio
                      </h3>
                      <div className="h-[350px] w-full font-medium">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={simulation.results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="barGradientBlue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                              </linearGradient>
                              <linearGradient id="barGradientSlate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#94a3b8" stopOpacity={1} />
                                <stop offset="100%" stopColor="#cbd5e1" stopOpacity={0.8} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                              dataKey="year"
                              stroke="#64748b"
                              tickFormatter={(v) => `Año ${v}`}
                              tick={{ fontSize: 12, fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                              dy={10}
                            />
                            <YAxis
                              stroke="#64748b"
                              tick={{ fontSize: 12, fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                              cursor={{ fill: '#f8fafc' }}
                              contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: '#ffffff',
                                color: '#0f172a',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                                fontFamily: 'Poppins, sans-serif'
                              }}
                            />
                            <Legend
                              verticalAlign="top"
                              align="right"
                              iconType="circle"
                              wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600, color: '#0f172a' }}
                            />
                            <Bar
                              name="Beneficio Neto"
                              dataKey="netIncome"
                              fill="url(#barGradientBlue)"
                              radius={[6, 6, 0, 0]}
                              barSize={32}
                            />
                            <Bar
                              name="Ingresos Totales"
                              dataKey="revenue"
                              fill="url(#barGradientSlate)"
                              radius={[6, 6, 0, 0]}
                              barSize={32}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center transition-colors">
                    <div>
                      <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-slate-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0v11.25m0 0h10.5a2.25 2.25 0 002.25-2.25V3m-10.5 0h10.5m0 0h1.5m-1.5 0v11.25m-2.25 2.25h3m-3 0h.008v.008H18v-.008zm-12 0h.008v.008H6v-.008zm3-4.5h.008v.008H9V12zm3 0h.008v.008H12V12zm3 0h.008v.008H15V12z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-slate-600 mb-2 font-montserrat">Inicia la Gestión</h3>
                      <p className="text-slate-400 font-medium font-poppins">Completa el formulario del Año 1 para ver el análisis estratégico de tu empresa.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {gameState === 'FINISHED' && (
          <FinalReport
            results={simulation.results}
            npv={calculateNPV(simulation.results)}
            aiSummary={simulation.finalReportFeedback || ""}
            onRestart={restartSimulation}
          />
        )}
      </main>
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-400">
          <p className="mb-1">Pet project de investigación de la <strong>Facultad de Ciencias Económicas, Empresariales y Turismo</strong> de la Universidad de Alcalá (UAH)</p>
          <p className="flex items-center justify-center gap-1">
            Powered by
            <svg className="w-4 h-4 inline" viewBox="0 0 128 128" fill="currentColor"><path d="M64.002 0C28.655 0 0 28.655 0 64c0 35.347 28.655 64 64.002 64C99.347 128 128 99.347 128 64c0-35.345-28.653-64-63.998-64zm17.136 98.028c-.543 1.623-2.085 3.453-3.981 3.453H50.844c-1.896 0-3.439-1.83-3.982-3.453L33.846 58.01c-.542-1.623.372-2.953 2.038-2.953h14.725c1.667 0 3.37 1.33 3.802 2.953l7.589 28.523 7.59-28.523c.432-1.623 2.134-2.953 3.801-2.953h14.726c1.666 0 2.58 1.33 2.037 2.953z" /></svg>
            <strong>Cloudflare</strong>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
