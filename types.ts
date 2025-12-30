
export interface YearInput {
  unitsSold: number;
  unitPrice: number;
  unitVariableCost: number;
  fixedCosts: number;
  newInvestment: number;
  newLoans: number;
  newEquity: number;      // Nueva ampliación de capital
  collectionDays: number; // PMc
  paymentDays: number;    // PMp
}

export interface FinancialResults {
  year: number;
  revenue: number;
  totalVariableCosts: number;
  fixedCosts: number;
  ebit: number; // BAII
  interest: number;
  ebt: number; // BAI
  tax: number;
  netIncome: number; // BN
  breakEvenUnits: number; // Punto Muerto Q
  breakEvenRevenue: number;
  productivity: number;
  roa: number; // Rentabilidad Económica
  roe: number; // Rentabilidad Financiera
  leverage: number; // Apalancamiento
  liquidityRatio: number;
  solvencyRatio: number;
  pmm: {
    storage: number;
    mfg: number;
    sales: number;
    collection: number;
    total: number;
  };
  balanceSheet: {
    assets: {
      fixed: number;
      receivables: number;
      cash: number;
      total: number;
    };
    liabilities: {
      payables: number;
      loans: number;
      total: number;
    };
    equity: {
      socialCapital: number;
      reserves: number;
      total: number;
    };
  };
  cashFlow: number;
}

export interface SimulationState {
  config: {
    totalYears: number;
    currentYear: number;
    isFinished: boolean;
  };
  results: FinancialResults[];
  aiFeedback: Record<number, string>;
  finalReportFeedback?: string;
}
