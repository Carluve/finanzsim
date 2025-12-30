
import { YearInput, FinancialResults } from '../types';
import { 
  TAX_RATE, 
  INTEREST_RATE, 
  INITIAL_CASH, 
  DEFAULT_STORAGE_DAYS, 
  DEFAULT_MFG_DAYS, 
  DEFAULT_SALES_DAYS,
  DISCOUNT_RATE
} from '../constants';

export const calculateYearResults = (
  input: YearInput, 
  year: number, 
  previousResults: FinancialResults | null
): FinancialResults => {
  const { 
    unitsSold, 
    unitPrice, 
    unitVariableCost, 
    fixedCosts, 
    newInvestment, 
    newLoans, 
    newEquity,
    collectionDays, 
    paymentDays 
  } = input;

  // 1. Income Statement (PyG)
  const revenue = unitsSold * unitPrice;
  const totalVariableCosts = unitsSold * unitVariableCost;
  const ebit = revenue - totalVariableCosts - fixedCosts;
  
  const prevLoans = previousResults?.balanceSheet.liabilities.loans || 0;
  const currentTotalLoans = prevLoans + newLoans;
  const interest = currentTotalLoans * INTEREST_RATE;
  
  const ebt = ebit - interest;
  const tax = ebt > 0 ? ebt * TAX_RATE : 0;
  const netIncome = ebt - tax;

  // 2. Break Even (Punto Muerto)
  const marginPerUnit = unitPrice - unitVariableCost;
  const breakEvenUnits = marginPerUnit > 0 ? fixedCosts / marginPerUnit : Infinity;
  const breakEvenRevenue = breakEvenUnits * unitPrice;

  // 3. PMM
  const pmm = {
    storage: DEFAULT_STORAGE_DAYS,
    mfg: DEFAULT_MFG_DAYS,
    sales: DEFAULT_SALES_DAYS,
    collection: collectionDays,
    total: DEFAULT_STORAGE_DAYS + DEFAULT_MFG_DAYS + DEFAULT_SALES_DAYS + collectionDays
  };

  // 4. Balance Sheet
  const prevFixedAssets = previousResults?.balanceSheet.assets.fixed || 0;
  const fixedAssets = prevFixedAssets + newInvestment;
  
  const receivables = (revenue / 365) * collectionDays;
  const payables = ((totalVariableCosts + fixedCosts) / 365) * paymentDays;
  
  // Capital Social acumulativo
  const prevSocialCapital = previousResults?.balanceSheet.equity.socialCapital || INITIAL_CASH;
  const socialCapital = prevSocialCapital + newEquity;

  const prevReserves = previousResults?.balanceSheet.equity.reserves || 0;
  const newReserves = prevReserves + netIncome;
  
  const equityTotal = socialCapital + newReserves;
  const liabilitiesTotal = currentTotalLoans + payables;
  
  // Cash balance logic
  const cash = Math.max(0, (equityTotal + liabilitiesTotal) - (fixedAssets + receivables));
  const totalAssets = fixedAssets + receivables + cash;

  // 5. Ratios
  const productivity = revenue / (totalVariableCosts + fixedCosts || 1);
  const roa = ebit / (totalAssets || 1);
  const roe = netIncome / (equityTotal || 1);
  const leverage = roe / (roa || 1);
  
  const currentAssets = receivables + cash;
  const currentLiabilities = payables;
  const liquidityRatio = currentAssets / (currentLiabilities || 1);
  const solvencyRatio = totalAssets / (liabilitiesTotal || 1);

  // 6. Cash Flow for NPV
  const cashFlow = netIncome + newInvestment;

  return {
    year,
    revenue,
    totalVariableCosts,
    fixedCosts,
    ebit,
    interest,
    ebt,
    tax,
    netIncome,
    breakEvenUnits,
    breakEvenRevenue,
    productivity,
    roa,
    roe,
    leverage,
    liquidityRatio,
    solvencyRatio,
    pmm,
    balanceSheet: {
      assets: { fixed: fixedAssets, receivables, cash, total: totalAssets },
      liabilities: { payables, loans: currentTotalLoans, total: liabilitiesTotal },
      equity: { socialCapital, reserves: newReserves, total: equityTotal }
    },
    cashFlow
  };
};

export const calculateNPV = (results: FinancialResults[]): number => {
  let npv = -INITIAL_CASH;
  results.forEach((r, index) => {
    npv += r.cashFlow / Math.pow(1 + DISCOUNT_RATE, index + 1);
  });
  return npv;
};
