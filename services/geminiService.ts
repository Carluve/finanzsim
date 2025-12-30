import { FinancialResults } from "../types";

const API_ENDPOINT = '/api/chat';

export const getAnnualFeedback = async (results: FinancialResults): Promise<string> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'annual',
        data: {
          year: results.year,
          revenue: results.revenue,
          netIncome: results.netIncome,
          breakEvenUnits: results.breakEvenUnits,
          roa: results.roa,
          roe: results.roe,
          leverage: results.leverage,
          liquidityRatio: results.liquidityRatio,
        }
      })
    });

    const data = await response.json();
    return data.feedback || "No se pudo generar el análisis en este momento.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Error al conectar con la IA de análisis financiero.";
  }
};

export const getFinalReportFeedback = async (results: FinancialResults[]): Promise<string> => {
  try {
    const summary = results.map(r => `Año ${r.year}: BN=${r.netIncome}, ROE=${r.roe}`).join(", ");

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'final',
        data: { summary }
      })
    });

    const data = await response.json();
    return data.feedback || "Informe final no disponible.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Error al generar el informe final.";
  }
};
