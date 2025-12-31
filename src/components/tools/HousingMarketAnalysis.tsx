"use client";

import React, { useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";

type ChartRow = {
  year: number;
  housePrice: number;
  annualWage: number;
  priceToWageRatio: string;
  housePriceYoY: string | "N/A";
  wageYoY: string | "N/A";
  inflation: string;
  deposit: number;
  depositToWageRatio: string;
  loanAmount: number;
  actualLTV: string;
  initialRate: number;
  initialMonthlyPayment: number;
  initialPaymentToIncomeRatio: string;
  totalMortgagePayments: number;
  totalInterestPaid: number;
  totalEarningsOverTerm: number;
  mortgageAsPercentOfEarnings: string;
  priceToWageRatioNum: number;
  inflationNum: number;
  wageYoYNum: number | null;
  mortgageAsPercentOfEarningsNum: number;
};

type MortgageSimulationResult = {
  totalPayments: number;
  totalInterest: number;
  totalEarnings: number;
  fractionOfEarnings: number;
};

type CohortSeries = {
  pivotedData: Array<Record<string, number>>;
  cohortYears: number[];
  colors: string[];
};

const housePrices: Record<number, number> = {
  1970: 6700,
  1971: 7500,
  1972: 8400,
  1973: 9009,
  1974: 10700,
  1975: 13250,
  1976: 14900,
  1977: 17600,
  1978: 20900,
  1979: 25100,
  1980: 29400,
  1981: 32900,
  1982: 36400,
  1983: 38700,
  1984: 40800,
  1985: 41900,
  1986: 42900,
  1987: 42600,
  1988: 44200,
  1989: 51900,
  1990: 63900,
  1991: 67100,
  1992: 67700,
  1993: 70400,
  1994: 74300,
  1995: 78000,
  1996: 88500,
  1997: 102600,
  1998: 126300,
  1999: 151500,
  2000: 179900,
  2001: 198900,
  2002: 213000,
  2003: 234700,
  2004: 263900,
  2005: 277800,
  2006: 311400,
  2007: 322600,
  2008: 308400,
  2009: 265900,
  2010: 232100,
  2011: 224900,
  2012: 213500,
  2013: 221100,
  2014: 238200,
  2015: 253900,
  2016: 273000,
  2017: 285500,
  2018: 296200,
  2019: 295700,
  2020: 301000,
  2021: 326000,
  2022: 357000,
  2023: 370000,
  2024: 380000,
};

const weeklyEarnings: Record<number, number> = {
  1960: 9.83,
  1961: 10.64,
  1962: 11.62,
  1963: 12.22,
  1964: 13.52,
  1965: 14.2,
  1966: 15.43,
  1967: 16.22,
  1968: 17.93,
  1969: 20,
  1970: 23.28,
  1971: 26.77,
  1972: 30.58,
  1973: 38.25,
  1974: 43.31,
  1975: 56.3,
  1976: 67.35,
  1977: 79.06,
  1978: 90.47,
  1979: 104.46,
  1980: 123.43,
  1981: 143.72,
  1982: 166.32,
  1983: 187.97,
  1984: 207.36,
  1985: 223.29,
  1986: 240.33,
  1987: 251.55,
  1988: 264.53,
  1989: 274.77,
  1990: 285.9,
  1991: 298.68,
  1992: 310.16,
  1993: 327.59,
  1994: 336.64,
  1995: 351.48,
  1996: 360.11,
  1997: 371.51,
  1998: 387.56,
  1999: 409.28,
  2000: 436.21,
  2001: 470.97,
  2002: 501.51,
  2003: 535.74,
  2004: 560.77,
  2005: 580.88,
  2006: 601.21,
  2007: 620.75,
  2008: 647.87,
  2009: 640.04,
  2010: 613.84,
  2011: 603.35,
  2012: 615.72,
  2013: 628.31,
  2014: 679.8,
  2015: 685.53,
  2016: 710,
  2017: 730,
  2018: 750,
  2019: 780,
  2020: 800,
  2021: 820,
  2022: 850,
  2023: 870,
  2024: 890,
};

const mortgageRates: Record<number, number> = {
  1970: 10.0,
  1971: 10.5,
  1972: 11.0,
  1973: 11.5,
  1974: 12.0,
  1975: 12.5,
  1976: 13.95,
  1977: 13.96,
  1978: 14.15,
  1979: 14.15,
  1980: 14.15,
  1981: 16.25,
  1982: 16.25,
  1983: 13.0,
  1984: 11.75,
  1985: 13.0,
  1986: 12.5,
  1987: 12.5,
  1988: 9.25,
  1989: 11.4,
  1990: 12.37,
  1991: 11.95,
  1992: 13.99,
  1993: 13.99,
  1994: 7.49,
  1995: 7.0,
  1996: 6.75,
  1997: 6.9,
  1998: 5.85,
  1999: 5.6,
  2000: 6.09,
  2001: 6.9,
  2002: 4.7,
  2003: 4.2,
  2004: 3.49,
  2005: 3.65,
  2006: 4.86,
  2007: 5.46,
  2008: 5.86,
  2009: 4.16,
  2010: 4.02,
  2011: 4.42,
  2012: 4.33,
  2013: 4.38,
  2014: 4.2,
  2015: 4.05,
  2016: 3.61,
  2017: 3.44,
  2018: 3.21,
  2019: 3.02,
  2020: 2.92,
  2021: 2.8,
  2022: 3.5,
  2023: 4.07,
  2024: 4.16,
};

const inflationRates: Record<number, number> = {
  1970: 8.2,
  1971: 8.9,
  1972: 8.7,
  1973: 11.4,
  1974: 17.0,
  1975: 20.9,
  1976: 21.02,
  1977: 10.53,
  1978: 8.1,
  1979: 15.86,
  1980: 18.25,
  1981: 23.15,
  1982: 12.33,
  1983: 10.44,
  1984: 6.59,
  1985: 4.95,
  1986: 3.14,
  1987: 3.05,
  1988: 2.77,
  1989: 4.68,
  1990: 2.58,
  1991: 3.69,
  1992: 2.26,
  1993: 1.58,
  1994: 2.33,
  1995: 2.43,
  1996: 1.95,
  1997: 1.96,
  1998: 1.58,
  1999: 3.45,
  2000: 5.83,
  2001: 4.25,
  2002: 4.98,
  2003: 2.01,
  2004: 2.54,
  2005: 2.48,
  2006: 4.97,
  2007: 4.6,
  2008: 1.1,
  2009: -4.96,
  2010: 1.4,
  2011: 2.38,
  2012: 1.1,
  2013: 0.24,
  2014: -0.24,
  2015: 0.12,
  2016: 0,
  2017: 0.36,
  2018: 0.6,
  2019: 1.32,
  2020: -0.95,
  2021: 5.62,
  2022: 8.14,
  2023: 4.6,
  2024: 1.4,
};

const wageGrowthMultiplier = weeklyEarnings[2024] / weeklyEarnings[2023];

const getYearColor = (year: number) => {
  const minYear = 1970;
  const maxYear = 2024;
  const fraction = (year - minYear) / (maxYear - minYear);
  const hue = 240 - fraction * 240;
  return `hsl(${hue}, 80%, 50%)`;
};

const CustomTooltipScatter = ({
  active,
  payload,
  xLabel,
  yLabel,
}: TooltipProps<number, string> & { xLabel: string; yLabel: string }) => {
  if (active && payload && payload.length) {
    const dataPayload = payload.find((p) => p && p.dataKey !== "y") ?? payload[0];
    const data = dataPayload?.payload as ChartRow | undefined;
    if (!data) return null;

    const yValue =
      yLabel === "Interest Rate" ? data.initialRate : data.wageYoYNum ?? 0;
    const xValue = data.inflationNum;

    return (
      <div className="rounded-lg border border-gray-300 bg-white p-3 shadow-lg">
        <p
          className="text-lg font-bold"
          style={{ color: getYearColor(data.year) }}
        >
          {data.year}
        </p>
        <p className="text-sm font-medium">
          {xLabel}: <span className="font-normal">{xValue.toFixed(1)}%</span>
        </p>
        <p
          className="text-sm font-medium"
          style={{ color: dataPayload?.color }}
        >
          {yLabel}: <span className="font-normal">{yValue.toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const CustomTooltipBurden = ({
  active,
  payload,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload as ChartRow | undefined;
    if (!data) return null;

    return (
      <div className="rounded-lg border border-gray-300 bg-white p-3 shadow-lg">
        <p
          className="text-lg font-bold"
          style={{ color: getYearColor(data.year) }}
        >
          {data.year}
        </p>
        <p className="text-sm font-medium">
          Mortgage Burden:{" "}
          <span className="font-normal">
            {data.mortgageAsPercentOfEarningsNum.toFixed(1)}%
          </span>
        </p>
        <p className="text-sm font-medium">
          Price/Wage:{" "}
          <span className="font-normal">{data.priceToWageRatio}x</span>
        </p>
        <p className="text-sm font-medium">
          Inflation:{" "}
          <span className="font-normal">{data.inflationNum.toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const calculateMonthlyPayment = (
  principal: number,
  annualRate: number,
  years: number,
) => {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = years * 12;
  if (monthlyRate === 0) return principal / numPayments;
  return (
    (principal *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
};

const calculateVariableRateMortgage = (
  startYear: number,
  initialPrincipal: number,
  term: number,
): MortgageSimulationResult => {
  let remainingPrincipal = initialPrincipal;
  let totalPayments = 0;
  let totalInterest = 0;
  let totalEarnings = 0;

  const rateYears = Object.keys(mortgageRates)
    .map(Number)
    .sort((a, b) => a - b);
  const lastKnownRate = mortgageRates[Math.max(...rateYears)];

  const wageYears = Object.keys(weeklyEarnings)
    .map(Number)
    .sort((a, b) => a - b);
  let lastKnownWage = weeklyEarnings[Math.max(...wageYears)];

  for (let yearOffset = 0; yearOffset < term; yearOffset += 1) {
    const year = startYear + yearOffset;
    const yearsRemaining = term - yearOffset;
    const rate =
      mortgageRates[year] !== undefined ? mortgageRates[year] : lastKnownRate;

    let weeklyWage: number;
    if (weeklyEarnings[year] !== undefined) {
      weeklyWage = weeklyEarnings[year];
      if (year === 2024) {
        lastKnownWage = weeklyEarnings[year];
      }
    } else {
      lastKnownWage *= wageGrowthMultiplier;
      weeklyWage = lastKnownWage;
    }

    const annualWage = weeklyWage * 52;
    const monthlyPayment = calculateMonthlyPayment(
      remainingPrincipal,
      rate,
      yearsRemaining,
    );
    const annualPayment = monthlyPayment * 12;
    const annualInterest = remainingPrincipal * (rate / 100);
    const principalPaid = annualPayment - annualInterest;
    remainingPrincipal = Math.max(0, remainingPrincipal - principalPaid);

    totalPayments += annualPayment;
    totalInterest += annualInterest;
    totalEarnings += annualWage;
  }

  return {
    totalPayments,
    totalInterest,
    totalEarnings,
    fractionOfEarnings: totalEarnings > 0 ? totalPayments / totalEarnings : 0,
  };
};

const calculateCohortAnalysis = (
  startYear: number,
  initialPrincipal: number,
  term: number,
) => {
  let remainingPrincipal = initialPrincipal;
  const cohortData: Array<{ yearOfMortgage: number; percentOfWage: string }> =
    [];

  const rateYears = Object.keys(mortgageRates)
    .map(Number)
    .sort((a, b) => a - b);
  const lastKnownRate = mortgageRates[Math.max(...rateYears)];

  const wageYears = Object.keys(weeklyEarnings)
    .map(Number)
    .sort((a, b) => a - b);
  let lastKnownWage = weeklyEarnings[Math.max(...wageYears)];

  for (let yearOffset = 0; yearOffset < term; yearOffset += 1) {
    const year = startYear + yearOffset;
    const yearsRemaining = term - yearOffset;
    const rate =
      mortgageRates[year] !== undefined ? mortgageRates[year] : lastKnownRate;

    let weeklyWage: number;
    if (weeklyEarnings[year] !== undefined) {
      weeklyWage = weeklyEarnings[year];
      if (year === 2024) {
        lastKnownWage = weeklyEarnings[year];
      }
    } else {
      lastKnownWage *= wageGrowthMultiplier;
      weeklyWage = lastKnownWage;
    }

    const annualWage = weeklyWage * 52;
    const monthlyPayment = calculateMonthlyPayment(
      remainingPrincipal,
      rate,
      yearsRemaining,
    );
    const annualPayment = monthlyPayment * 12;
    const percentOfWage = (annualPayment / annualWage) * 100;
    cohortData.push({
      yearOfMortgage: yearOffset,
      percentOfWage: percentOfWage.toFixed(1),
    });

    const annualInterest = remainingPrincipal * (rate / 100);
    const principalPaid = annualPayment - annualInterest;
    remainingPrincipal = Math.max(0, remainingPrincipal - principalPaid);
  }

  return cohortData;
};

const cohortColors = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
];

const HousingMarketAnalysis = () => {
  const [depositMethod, setDepositMethod] = useState<"annual-wage" | "percentage">(
    "annual-wage",
  );
  const [loanToValue, setLoanToValue] = useState(90);
  const [mortgageTerm, setMortgageTerm] = useState(25);

  const chartData = useMemo<ChartRow[]>(() => {
    const years = Object.keys(housePrices)
      .map(Number)
      .filter((y) => y >= 1970);

    return years.map((year) => {
      const price = housePrices[year];
      const weeklyWage = weeklyEarnings[year];
      const annualWage = weeklyWage * 52;
      const rate = mortgageRates[year];
      const inflation = inflationRates[year];

      const prevYear = year - 1;
      const prevPrice = housePrices[prevYear];
      const prevWage = weeklyEarnings[prevYear]
        ? weeklyEarnings[prevYear] * 52
        : null;

      const housePriceYoY =
        prevPrice != null ? ((price - prevPrice) / prevPrice) * 100 : null;
      const wageYoY =
        prevWage != null ? ((annualWage - prevWage) / prevWage) * 100 : null;

      let loanAmount: number;
      let deposit: number;
      let actualLTV: number;

      if (depositMethod === "annual-wage") {
        deposit = annualWage;
        loanAmount = Math.max(0, price - deposit);
        actualLTV = price > 0 ? (loanAmount / price) * 100 : 0;
      } else {
        actualLTV = loanToValue;
        loanAmount = price * (loanToValue / 100);
        deposit = price - loanAmount;
      }

      const depositToWageRatio = deposit / annualWage;
      const mortgageCalcs = calculateVariableRateMortgage(
        year,
        loanAmount,
        mortgageTerm,
      );

      const initialMonthlyPayment = calculateMonthlyPayment(
        loanAmount,
        rate,
        mortgageTerm,
      );
      const monthlyWage = (weeklyWage * 52) / 12;
      const initialPaymentToIncomeRatio =
        (initialMonthlyPayment / monthlyWage) * 100;

      const mortgageAsPercentOfEarningsNum = parseFloat(
        (mortgageCalcs.fractionOfEarnings * 100).toFixed(1),
      );

      return {
        year,
        housePrice: Math.round(price),
        annualWage: Math.round(annualWage),
        priceToWageRatio: (price / annualWage).toFixed(1),
        housePriceYoY:
          housePriceYoY !== null ? housePriceYoY.toFixed(1) : "N/A",
        wageYoY: wageYoY !== null ? wageYoY.toFixed(1) : "N/A",
        inflation: inflation.toFixed(1),
        deposit: Math.round(deposit),
        depositToWageRatio: depositToWageRatio.toFixed(1),
        loanAmount: Math.round(loanAmount),
        actualLTV: actualLTV.toFixed(1),
        initialRate: rate,
        initialMonthlyPayment: Math.round(initialMonthlyPayment),
        initialPaymentToIncomeRatio:
          initialPaymentToIncomeRatio.toFixed(1),
        totalMortgagePayments: Math.round(mortgageCalcs.totalPayments),
        totalInterestPaid: Math.round(mortgageCalcs.totalInterest),
        totalEarningsOverTerm: Math.round(mortgageCalcs.totalEarnings),
        mortgageAsPercentOfEarnings: mortgageAsPercentOfEarningsNum.toFixed(1),
        priceToWageRatioNum: parseFloat((price / annualWage).toFixed(1)),
        inflationNum: inflation,
        wageYoYNum:
          wageYoY !== null ? parseFloat(wageYoY.toFixed(1)) : null,
        mortgageAsPercentOfEarningsNum,
      };
    });
  }, [depositMethod, loanToValue, mortgageTerm]);

  const cohortChartData = useMemo<CohortSeries>(() => {
    const cohortYears = [
      1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020,
    ];

    const analysis: Record<
      number,
      Array<{ yearOfMortgage: number; percentOfWage: string }>
    > = {};

    cohortYears.forEach((cohortYear) => {
      const price = housePrices[cohortYear];
      const annualWage = weeklyEarnings[cohortYear] * 52;

      let loanAmount: number;
      if (depositMethod === "annual-wage") {
        loanAmount = Math.max(0, price - annualWage);
      } else {
        loanAmount = price * (loanToValue / 100);
      }

      analysis[cohortYear] = calculateCohortAnalysis(
        cohortYear,
        loanAmount,
        mortgageTerm,
      );
    });

    const pivotedData: Array<Record<string, number>> = [];
    for (let i = 0; i < mortgageTerm; i += 1) {
      const dataPoint: Record<string, number> = { yearOfMortgage: i };
      cohortYears.forEach((cohortYear) => {
        const cohortEntry = analysis[cohortYear]?.[i];
        if (cohortEntry) {
          dataPoint[cohortYear.toString()] = parseFloat(
            cohortEntry.percentOfWage,
          );
        }
      });
      pivotedData.push(dataPoint);
    }

    return { pivotedData, cohortYears, colors: cohortColors };
  }, [depositMethod, loanToValue, mortgageTerm]);

  const commonDomain = useMemo<[number, number]>(() => {
    const inflations = chartData.map((d) => d.inflationNum);
    const rates = chartData.map((d) => d.initialRate);
    const wages = chartData
      .map((d) => d.wageYoYNum)
      .filter((d): d is number => d !== null);

    const allValues = [...inflations, ...rates, ...wages];
    const min = Math.floor(Math.min(...allValues) / 5) * 5;
    const max = Math.ceil(Math.max(...allValues) / 5) * 5;
    return [min, max];
  }, [chartData]);

  const dashedLineData = [
    { x: commonDomain[0], y: commonDomain[0] },
    { x: commonDomain[1], y: commonDomain[1] },
  ];

  return (
    <div className="min-h-screen max-w-7xl bg-gray-50 p-4 font-sans md:p-6">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Ireland Housing Market Analysis
      </h1>
      <p className="mb-6 text-lg text-gray-600">
        Mortgage Payments as a Fraction of Lifetime Earnings (Variable Rates)
      </p>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">
          Mortgage Parameters
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Deposit Method
            </label>
            <div className="flex flex-col space-y-2">
              <label className="has-[:checked]:border-blue-400 has-[:checked]:bg-blue-100 flex cursor-pointer items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 transition-all">
                <input
                  type="radio"
                  value="annual-wage"
                  checked={depositMethod === "annual-wage"}
                  onChange={(event) =>
                    setDepositMethod(event.target.value as "annual-wage")
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <span className="font-medium text-gray-800">
                  Deposit = 1x Annual Wage
                </span>
              </label>
              <label className="has-[:checked]:border-blue-400 has-[:checked]:bg-blue-100 flex cursor-pointer items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 transition-all">
                <input
                  type="radio"
                  value="percentage"
                  checked={depositMethod === "percentage"}
                  onChange={(event) =>
                    setDepositMethod(event.target.value as "percentage")
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <span className="font-medium text-gray-800">
                  Fixed Percentage LTV
                </span>
              </label>
            </div>
          </div>

          <div>
            {depositMethod === "percentage" && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Loan-to-Value Ratio:{" "}
                  <span className="font-bold text-blue-600">
                    {loanToValue}%
                  </span>
                </label>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={loanToValue}
                  onChange={(event) =>
                    setLoanToValue(Number(event.target.value))
                  }
                  className="w-full accent-blue-600"
                />
              </div>
            )}

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Mortgage Term:{" "}
                <span className="font-bold text-blue-600">
                  {mortgageTerm} years
                </span>
              </label>
              <input
                type="range"
                min={15}
                max={35}
                value={mortgageTerm}
                onChange={(event) =>
                  setMortgageTerm(Number(event.target.value))
                }
                className="w-full accent-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">
          Key Comparison: % of Earnings to Mortgage
        </h3>
        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
          {[1980, 2000, 2020].map((keyYear, idx) => {
            const palette = ["text-purple-700", "text-blue-700", "text-green-700"];
            const largePalette = [
              "text-purple-600",
              "text-blue-600",
              "text-green-600",
            ];
            const borderClasses = [
              "md:border-r border-gray-200 md:pr-4",
              "md:border-r border-gray-200 md:px-4",
              "md:pl-4",
            ];
            const data = chartData.find((d) => d.year === keyYear);
            return (
              <div
                key={keyYear}
                className={`${idx < 2 ? borderClasses[idx] : borderClasses[2]}`}
              >
                <p className={`mb-2 text-lg font-semibold ${palette[idx]}`}>
                  {keyYear} Mortgage
                </p>
                <p className={`mb-2 mt-1 text-4xl font-bold ${largePalette[idx]}`}>
                  {data?.mortgageAsPercentOfEarnings ?? "—"}%
                </p>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Total Payments
                </p>
                <p className="mb-1 text-sm font-medium text-gray-700">
                  €
                  {data?.totalMortgagePayments.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  }) ?? "—"}
                </p>
                <p className="text-xs font-medium uppercase text-gray-500">
                  Total Earnings ({mortgageTerm}yr)
                </p>
                <p className="text-sm font-medium text-gray-700">
                  €
                  {data?.totalEarningsOverTerm.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  }) ?? "—"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6">
        <h3 className="mb-1 text-xl font-semibold text-gray-800">
          Interest Rate vs. Price/Wage Ratio (1970-2024)
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Color scale: <span className="font-bold text-blue-600">1970</span> to{" "}
          <span className="font-bold text-red-600">2024</span>
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="initialRate"
              name="Interest Rate"
              unit="%"
              stroke="#4b5563"
              label={{
                value: "Starting Interest Rate (%)",
                position: "insideBottom",
                offset: -15,
                fill: "#4b5563",
                fontSize: 14,
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="priceToWageRatioNum"
              name="Price/Wage Ratio"
              unit="x"
              stroke="#4b5563"
              label={{
                value: "Price/Wage Ratio",
                angle: -90,
                position: "insideLeft",
                offset: -5,
                fill: "#4b5563",
                fontSize: 14,
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartRow;
                  return (
                    <div className="rounded-lg border border-gray-300 bg-white p-3 shadow-lg">
                      <p
                        className="text-lg font-bold"
                        style={{ color: getYearColor(data.year) }}
                      >
                        {data.year}
                      </p>
                      <p className="text-sm font-medium">
                        Interest Rate:{" "}
                        <span className="font-normal">
                          {data.initialRate}%
                        </span>
                      </p>
                      <p className="text-sm font-medium">
                        Price/Wage:{" "}
                        <span className="font-normal">
                          {data.priceToWageRatio}x
                        </span>
                      </p>
                      <p className="text-sm font-medium">
                        House Price:{" "}
                        <span className="font-normal">
                          €{data.housePrice.toLocaleString()}
                        </span>
                      </p>
                      <p className="text-sm font-medium">
                        Annual Wage:{" "}
                        <span className="font-normal">
                          €{data.annualWage.toLocaleString()}
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={chartData}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.year}
                  fill={getYearColor(entry.year)}
                  fillOpacity={0.7}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6">
        <h3 className="mb-1 text-xl font-semibold text-gray-800">
          Cohort Analysis: Mortgage Payment as % of Annual Wage
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Shows the percentage of a homeowner&apos;s annual wage spent on
          mortgage payments over the {mortgageTerm}-year loan term.
        </p>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart
            data={cohortChartData.pivotedData}
            margin={{ top: 20, right: 40, bottom: 40, left: 30 }}
          >
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
            <XAxis
              dataKey="yearOfMortgage"
              stroke="#4b5563"
              label={{
                value: `Year of Mortgage (0-${mortgageTerm - 1})`,
                position: "insideBottom",
                offset: -15,
                fill: "#4b5563",
                fontSize: 14,
              }}
              tick={{ fontSize: 12 }}
              allowDecimals={false}
            />
            <YAxis
              stroke="#4b5563"
              unit="%"
              label={{
                value: "Payment as % of Wage",
                angle: -90,
                position: "insideLeft",
                offset: -5,
                fill: "#4b5563",
                fontSize: 14,
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number, name) => [`${value}%`, `Started ${name}`]}
              labelFormatter={(label) => `Mortgage Year: ${label}`}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxShadow: "rgba(0,0,0,0.1) 0px 4px 12px",
              }}
              itemStyle={{ fontWeight: 500 }}
            />
            <Legend wrapperStyle={{ paddingTop: 20 }} />
            {cohortChartData.cohortYears.map((year, index) => (
              <Line
                key={year}
                type="monotone"
                dataKey={year.toString()}
                name={`Start ${year}`}
                stroke={cohortChartData.colors[index % cohortChartData.colors.length]}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6 }}
              >
                <LabelList
                  dataKey={year.toString()}
                  content={(props) => {
                    const { x, y, index: pointIndex } = props;
                    if (pointIndex !== cohortChartData.pivotedData.length - 1) {
                      return null;
                    }
                    return (
                      <text
                        x={(x ?? 0) + 6}
                        y={(y ?? 0) + 3}
                        fill={
                          cohortChartData.colors[index % cohortChartData.colors.length]
                        }
                        fontSize={12}
                        fontWeight={500}
                        textAnchor="start"
                      >
                        {year}
                      </text>
                    );
                  }}
                />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6">
        <h3 className="mb-1 text-xl font-semibold text-gray-800">
          Interest Rate vs. Inflation
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Color scale: <span className="font-bold text-blue-600">1970</span> to{" "}
          <span className="font-bold text-red-600">2024</span>. Dashed line is y=x.
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="inflationNum"
              name="Inflation Rate"
              unit="%"
              domain={commonDomain}
              stroke="#4b5563"
              label={{
                value: "Inflation Rate (%)",
                position: "insideBottom",
                offset: -15,
                fill: "#4b5563",
                fontSize: 14,
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="initialRate"
              name="Interest Rate"
              unit="%"
              domain={commonDomain}
              stroke="#4b5563"
              label={{
                value: "Interest Rate (%)",
                angle: -90,
                position: "insideLeft",
                offset: -5,
                fill: "#4b5563",
                fontSize: 14,
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={
                <CustomTooltipScatter xLabel="Inflation" yLabel="Interest Rate" />
              }
            />
            <Scatter name="Interest Rate" data={chartData} dataKey="initialRate">
              {chartData.map((entry) => (
                <Cell
                  key={`cell-rate-${entry.year}`}
                  fill={getYearColor(entry.year)}
                  fillOpacity={0.7}
                />
              ))}
            </Scatter>
            <Line
              type="monotone"
              data={dashedLineData}
              dataKey="y"
              xKey="x"
              stroke="#888"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              legendType="none"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6">
        <h3 className="mb-1 text-xl font-semibold text-gray-800">
          Wage Growth (YoY) vs. Inflation
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Color scale: <span className="font-bold text-blue-600">1970</span> to{" "}
          <span className="font-bold text-red-600">2024</span>. Dashed line is y=x.
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="inflationNum"
              name="Inflation Rate"
              unit="%"
              domain={commonDomain}
              stroke="#4b5563"
              label={{
                value: "Inflation Rate (%)",
                position: "insideBottom",
                offset: -15,
                fill: "#4b5563",
                fontSize: 14,
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="wageYoYNum"
              name="Wage Growth"
              unit="%"
              domain={commonDomain}
              stroke="#4b5563"
              label={{
                value: "Wage Growth (%)",
                angle: -90,
                position: "insideLeft",
                offset: -5,
                fill: "#4b5563",
                fontSize: 14,
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={
                <CustomTooltipScatter xLabel="Inflation" yLabel="Wage Growth" />
              }
            />
            <Scatter
              name="Wage Growth"
              data={chartData.filter((d) => d.wageYoYNum !== null)}
              dataKey="wageYoYNum"
            >
              {chartData
                .filter((d) => d.wageYoYNum !== null)
                .map((entry) => (
                  <Cell
                    key={`cell-wage-${entry.year}`}
                    fill={getYearColor(entry.year)}
                    fillOpacity={0.7}
                  />
                ))}
            </Scatter>
            <Line
              type="monotone"
              data={dashedLineData}
              dataKey="y"
              xKey="x"
              stroke="#888"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              legendType="none"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6">
        <h3 className="mb-4 text-xl font-semibold text-gray-800">
          Total Mortgage Burden Over Time
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Shows the total mortgage payments as a percentage of total earnings over
          the {mortgageTerm}-year term.
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="year"
              domain={["dataMin", "dataMax"]}
              allowDecimals={false}
              stroke="#4b5563"
              label={{
                value: "Mortgage Start Year",
                position: "insideBottom",
                offset: -15,
                fill: "#4b5563",
                fontSize: 14,
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="mortgageAsPercentOfEarningsNum"
              unit="%"
              stroke="#4b5563"
              label={{
                value: "Mortgage as % of Earnings",
                angle: -90,
                position: "insideLeft",
                offset: -5,
                fill: "#4b5563",
                fontSize: 14,
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltipBurden />} cursor={{ strokeDasharray: "3 3" }} />
            <Line
              name="Mortgage as % of Earnings"
              type="monotone"
              dataKey="mortgageAsPercentOfEarningsNum"
              stroke="#dc2626"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6">
        <h3 className="mb-1 text-xl font-semibold text-gray-800">
          Inflation vs. Mortgage Burden
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Color scale: <span className="font-bold text-blue-600">1970</span> to{" "}
          <span className="font-bold text-red-600">2024</span>
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="inflationNum"
              name="Inflation Rate"
              unit="%"
              stroke="#4b5563"
              label={{
                value: "Inflation Rate (%)",
                position: "insideBottom",
                offset: -15,
                fill: "#4b5563",
                fontSize: 14,
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="mortgageAsPercentOfEarningsNum"
              name="Mortgage Burden"
              unit="%"
              stroke="#4b5563"
              label={{
                value: "Mortgage as % of Earnings",
                angle: -90,
                position: "insideLeft",
                offset: -5,
                fill: "#4b5563",
                fontSize: 14,
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltipBurden />} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={chartData}>
              {chartData.map((entry) => (
                <Cell
                  key={`cell-burden-inf-${entry.year}`}
                  fill={getYearColor(entry.year)}
                  fillOpacity={0.7}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6">
        <h3 className="mb-1 text-xl font-semibold text-gray-800">
          Price/Wage Ratio vs. Mortgage Burden
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Color scale: <span className="font-bold text-blue-600">1970</span> to{" "}
          <span className="font-bold text-red-600">2024</span>
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
            <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="priceToWageRatioNum"
              name="Price/Wage Ratio"
              unit="x"
              stroke="#4b5563"
              label={{
                value: "Price/Wage Ratio",
                position: "insideBottom",
                offset: -15,
                fill: "#4b5563",
                fontSize: 14,
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="mortgageAsPercentOfEarningsNum"
              name="Mortgage Burden"
              unit="%"
              stroke="#4b5563"
              label={{
                value: "Mortgage as % of Earnings",
                angle: -90,
                position: "insideLeft",
                offset: -5,
                fill: "#4b5563",
                fontSize: 14,
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltipBurden />} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={chartData}>
              {chartData.map((entry) => (
                <Cell
                  key={`cell-burden-pw-${entry.year}`}
                  fill={getYearColor(entry.year)}
                  fillOpacity={0.7}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-lg">
        <h3 className="border-b border-gray-200 p-4 text-xl font-semibold text-gray-800 md:p-6">
          Detailed Data Table
        </h3>
        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-gray-100">
                <tr>
                  {[
                    "Year",
                    "House Price",
                    "House Δ%",
                    "Annual Wage",
                    "Wage Δ%",
                    "Inflation %",
                    "Price/Wage",
                    "Deposit",
                    "Loan Amount",
                    "LTV %",
                    "Initial Rate %",
                    "Initial Monthly Payment",
                    `Total Payments (${mortgageTerm}yr)`,
                    "Total Interest",
                    `Total Earnings (${mortgageTerm}yr)`,
                    "Mortgage as % of Earnings",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-3 py-3 text-left font-semibold uppercase text-gray-600"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {chartData.map((row) => (
                  <tr key={row.year} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-900">
                      {row.year}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                      €{row.housePrice.toLocaleString()}
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2"
                      style={{
                        color:
                          row.housePriceYoY !== "N/A" &&
                          parseFloat(row.housePriceYoY) > 5
                            ? "#16a34a"
                            : row.housePriceYoY !== "N/A" &&
                                parseFloat(row.housePriceYoY) < 0
                              ? "#dc2626"
                              : "#4b5563",
                      }}
                    >
                      {row.housePriceYoY !== "N/A"
                        ? `${row.housePriceYoY}%`
                        : "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                      €{row.annualWage.toLocaleString()}
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2"
                      style={{
                        color:
                          row.wageYoY !== "N/A" &&
                          parseFloat(row.wageYoY) > 5
                            ? "#16a34a"
                            : "#4b5563",
                      }}
                    >
                      {row.wageYoY !== "N/A" ? `${row.wageYoY}%` : "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                      {row.inflation}%
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                      {row.priceToWageRatio}x
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                      €{row.deposit.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                      €{row.loanAmount.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                      {row.actualLTV}%
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                      {row.initialRate}%
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                      €{row.initialMonthlyPayment.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                      €{row.totalMortgagePayments.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-red-600">
                      €{row.totalInterestPaid.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                      €{row.totalEarningsOverTerm.toLocaleString()}
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-2 text-lg font-bold"
                      style={{
                        color:
                          parseFloat(row.mortgageAsPercentOfEarnings) > 40
                            ? "#dc2626"
                            : parseFloat(row.mortgageAsPercentOfEarnings) > 30
                              ? "#f97316"
                              : "#16a34a",
                      }}
                    >
                      {row.mortgageAsPercentOfEarnings}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-100 p-4 text-xs text-gray-600">
        <p className="mb-2 text-sm font-semibold text-gray-800">
          Calculation Methodology:
        </p>
        <ul className="list-inside list-disc space-y-1.5">
          <li>
            <strong>Variable Rate Mortgage:</strong> Interest rate changes each
            year to match historical rates for the duration of the loan.
          </li>
          <li>
            <strong>Payment Recalculation:</strong> Each year, the monthly
            payment recalculates based on remaining principal, remaining term,
            and the current year&apos;s interest rate.
          </li>
          <li>
            <strong>Total Payments:</strong> Sum of all annual mortgage payments
            over the {mortgageTerm}-year term.
          </li>
          <li>
            <strong>Total Earnings:</strong> Sum of average annual wages over
            the {mortgageTerm}-year mortgage period, tracking historical data.
          </li>
          <li>
            <strong>Mortgage as % of Earnings:</strong> Fraction of total lifetime
            earnings (during the mortgage term) that went to housing payments.
          </li>
          <li>
            <strong>Key Insight:</strong> High initial rates with rapid wage
            growth (1980s) can still result in manageable lifetime burdens compared
            with lower-rate, high-price eras (2020s).
          </li>
          <li>
            <strong>Extrapolation:</strong> Beyond 2024, interest rates stay at
            2024 levels while wages grow annually at approximately{" "}
            {wageGrowthMultiplier.toFixed(3)}x.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HousingMarketAnalysis;


