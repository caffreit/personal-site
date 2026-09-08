"use client";

import React, { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { LabDetails, LabHeader, LabSection, LabShell } from "@/components/labs/LabChrome";
import {
  LabTooltip,
  labAxisProps,
  labGridProps,
  useLabChartTheme,
} from "@/components/labs/labChartTheme";
import {
  labFootnote,
  labMicroLabel,
  labSlider,
} from "@/components/labs/labTokens";

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

type BurdenTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: ChartRow }>;
};

const CustomTooltipBurden = ({ active, payload }: BurdenTooltipProps) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <LabTooltip
      label={String(data.year)}
      rows={[
        {
          key: "burden",
          name: "Mortgage burden",
          value: `${data.mortgageAsPercentOfEarningsNum.toFixed(1)}%`,
          color: getYearColor(data.year),
        },
        { key: "ratio", name: "Price/wage", value: `${data.priceToWageRatio}x` },
        { key: "inflation", name: "Inflation", value: `${data.inflationNum.toFixed(1)}%` },
      ]}
    />
  );
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

const HousingMarketAnalysis = () => {
  const [depositMethod, setDepositMethod] = useState<"annual-wage" | "percentage">(
    "annual-wage",
  );
  const [loanToValue, setLoanToValue] = useState(90);
  const [mortgageTerm, setMortgageTerm] = useState(25);
  const chartTheme = useLabChartTheme();

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

  return (
    <LabShell>
      <LabHeader
        eyebrow="Irish Housing - Historical model"
        title="Ireland Housing Market Analysis"
        lede="Mortgage payments as a fraction of lifetime earnings, under historical variable rates."
      />

      <LabSection heading="Mortgage parameters">
        <div className="grid gap-10 md:grid-cols-2 md:gap-0">
          <fieldset className="border-[color:var(--rule-color)] md:border-r md:pr-10">
            <legend className={labMicroLabel}>Deposit method</legend>
            <div className="mt-3 border-t border-[color:var(--rule-color)]">
              {(
                [
                  { value: "annual-wage", label: "Deposit = 1x annual wage" },
                  { value: "percentage", label: "Fixed percentage LTV" },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 border-b border-l-2 border-b-[color:var(--rule-color)] border-l-transparent py-3.5 pl-3.5 transition-colors has-[:checked]:border-l-[#F4CA16]"
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={depositMethod === option.value}
                    onChange={(event) =>
                      setDepositMethod(event.target.value as typeof depositMethod)
                    }
                    className="h-3.5 w-3.5 accent-[color:var(--foreground)]"
                  />
                  <span className="text-[0.98rem] text-[color:var(--foreground)]">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="md:pl-10">
            {depositMethod === "percentage" && (
              <label className="mb-7 block border-t border-[color:var(--rule-color)] pt-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className={labMicroLabel}>Loan-to-value ratio</span>
                  <span className="text-[1.15rem] font-light tabular-nums text-[color:var(--foreground)]">
                    {loanToValue}%
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={loanToValue}
                  onChange={(event) => setLoanToValue(Number(event.target.value))}
                  className={`mt-3 ${labSlider}`}
                />
              </label>
            )}

            <label className="block border-t border-[color:var(--rule-color)] pt-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className={labMicroLabel}>Mortgage term</span>
                <span className="text-[1.15rem] font-light tabular-nums text-[color:var(--foreground)]">
                  {mortgageTerm} years
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={35}
                value={mortgageTerm}
                onChange={(event) => setMortgageTerm(Number(event.target.value))}
                className={`mt-3 ${labSlider}`}
              />
            </label>
          </div>
        </div>
      </LabSection>

      <LabSection heading="Key comparison: share of earnings to mortgage">
        <div className="grid grid-cols-1 gap-x-8 gap-y-9 md:grid-cols-3">
          {[1980, 2000, 2020].map((keyYear) => {
            const data = chartData.find((row) => row.year === keyYear);

            return (
              <div key={keyYear} className="border-t border-[color:var(--rule-color)] pt-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: getYearColor(keyYear) }}
                    aria-hidden="true"
                  />
                  <p className={labMicroLabel}>{keyYear} mortgage</p>
                </div>
                <p className="mt-3 text-[2.6rem] font-light leading-none tracking-[-0.04em] tabular-nums text-[color:var(--foreground)]">
                  {data?.mortgageAsPercentOfEarnings ?? "—"}%
                </p>
                <dl className="mt-5">
                  <div className="flex items-baseline justify-between gap-3 border-b border-[color:var(--rule-color)] py-2">
                    <dt className="text-[0.9rem] text-[color:var(--text-muted)]">
                      Total payments
                    </dt>
                    <dd className="text-[0.95rem] tabular-nums text-[color:var(--foreground)]">
                      €
                      {data?.totalMortgagePayments.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      }) ?? "—"}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 border-b border-[color:var(--rule-color)] py-2">
                    <dt className="text-[0.9rem] text-[color:var(--text-muted)]">
                      Total earnings ({mortgageTerm}yr)
                    </dt>
                    <dd className="text-[0.95rem] tabular-nums text-[color:var(--foreground)]">
                      €
                      {data?.totalEarningsOverTerm.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      }) ?? "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </LabSection>

      <LabSection
        heading="Total mortgage burden over time"
        intro={`Shows the total mortgage payments as a percentage of total earnings over the ${mortgageTerm}-year term.`}
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
            <CartesianGrid {...labGridProps(chartTheme)} />
            <XAxis
              type="number"
              dataKey="year"
              domain={["dataMin", "dataMax"]}
              allowDecimals={false}
              {...labAxisProps(chartTheme)}
              label={{
                value: "Mortgage start year",
                position: "insideBottom",
                offset: -15,
                fill: chartTheme.muted,
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="mortgageAsPercentOfEarningsNum"
              unit="%"
              {...labAxisProps(chartTheme)}
              label={{
                value: "Mortgage as % of earnings",
                angle: -90,
                position: "insideLeft",
                offset: -5,
                fill: chartTheme.muted,
                fontSize: 11,
              }}
            />
            <Tooltip
              content={<CustomTooltipBurden />}
              cursor={{ stroke: chartTheme.muted, strokeDasharray: "3 3" }}
            />
            <Line
              name="Mortgage as % of Earnings"
              type="monotone"
              dataKey="mortgageAsPercentOfEarningsNum"
              stroke="#dc2626"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </LabSection>

      <LabSection heading="Detailed data table">
        <div className="max-h-96 overflow-auto">
          <table className="min-w-full border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[color:var(--background)]">
              <tr>
                {[
                  "Year",
                  "House price",
                  "House Δ%",
                  "Annual wage",
                  "Wage Δ%",
                  "Inflation %",
                  "Price/wage",
                  "Deposit",
                  "Loan amount",
                  "LTV %",
                  "Initial rate %",
                  "Initial monthly payment",
                  `Total payments (${mortgageTerm}yr)`,
                  "Total interest",
                  `Total earnings (${mortgageTerm}yr)`,
                  "Mortgage as % of earnings",
                ].map((header) => (
                  <th
                    key={header}
                    className={`border-b border-[color:var(--rule-color)] px-3 pt-1 pb-2.5 align-bottom whitespace-nowrap ${labMicroLabel}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={row.year}>
                  <td className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap tabular-nums text-[color:var(--foreground)]">
                    {row.year}
                  </td>
                  <td className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[0.92rem] tabular-nums text-[color:var(--text-muted)]">
                    €{row.housePrice.toLocaleString()}
                  </td>
                  <td
                    className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[0.92rem] tabular-nums"
                    style={{
                      color:
                        row.housePriceYoY !== "N/A" && parseFloat(row.housePriceYoY) > 5
                          ? "#16a34a"
                          : row.housePriceYoY !== "N/A" && parseFloat(row.housePriceYoY) < 0
                            ? "#dc2626"
                            : "var(--text-muted)",
                    }}
                  >
                    {row.housePriceYoY !== "N/A" ? `${row.housePriceYoY}%` : "N/A"}
                  </td>
                  <td className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[0.92rem] tabular-nums text-[color:var(--text-muted)]">
                    €{row.annualWage.toLocaleString()}
                  </td>
                  <td
                    className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[0.92rem] tabular-nums"
                    style={{
                      color:
                        row.wageYoY !== "N/A" && parseFloat(row.wageYoY) > 5
                          ? "#16a34a"
                          : "var(--text-muted)",
                    }}
                  >
                    {row.wageYoY !== "N/A" ? `${row.wageYoY}%` : "N/A"}
                  </td>
                  <td className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[0.92rem] tabular-nums text-[color:var(--text-muted)]">
                    {row.inflation}%
                  </td>
                  <td className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[0.92rem] tabular-nums text-[color:var(--text-muted)]">
                    {row.priceToWageRatio}x
                  </td>
                  <td className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[0.92rem] tabular-nums text-[color:var(--text-muted)]">
                    €{row.deposit.toLocaleString()}
                  </td>
                  <td className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[0.92rem] tabular-nums text-[color:var(--text-muted)]">
                    €{row.loanAmount.toLocaleString()}
                  </td>
                  <td className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[0.92rem] tabular-nums text-[color:var(--text-muted)]">
                    {row.actualLTV}%
                  </td>
                  <td className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[0.92rem] tabular-nums text-[color:var(--text-muted)]">
                    {row.initialRate}%
                  </td>
                  <td className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[0.92rem] tabular-nums text-[color:var(--text-muted)]">
                    €{row.initialMonthlyPayment.toLocaleString()}
                  </td>
                  <td className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[0.92rem] tabular-nums text-[color:var(--text-muted)]">
                    €{row.totalMortgagePayments.toLocaleString()}
                  </td>
                  <td
                    className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[0.92rem] tabular-nums"
                    style={{ color: "#dc2626" }}
                  >
                    €{row.totalInterestPaid.toLocaleString()}
                  </td>
                  <td className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[0.92rem] tabular-nums text-[color:var(--text-muted)]">
                    €{row.totalEarningsOverTerm.toLocaleString()}
                  </td>
                  <td
                    className="border-b border-[color:var(--rule-color)] px-3 py-2.5 whitespace-nowrap text-[1.05rem] font-medium tabular-nums"
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
      </LabSection>

      <LabDetails
        heading="Calculation methodology"
        summary="How the variable-rate model is built."
      >
        <ul className={`max-w-[760px] space-y-3 ${labFootnote}`}>
          <li>
            <span className="text-[color:var(--foreground)]">Variable rate mortgage:</span>{" "}
            interest rate changes each year to match historical rates for the duration of the
            loan.
          </li>
          <li>
            <span className="text-[color:var(--foreground)]">Payment recalculation:</span> each
            year, the monthly payment recalculates based on remaining principal, remaining term,
            and the current year&apos;s interest rate.
          </li>
          <li>
            <span className="text-[color:var(--foreground)]">Total payments:</span> sum of all
            annual mortgage payments over the {mortgageTerm}-year term.
          </li>
          <li>
            <span className="text-[color:var(--foreground)]">Total earnings:</span> sum of
            average annual wages over the {mortgageTerm}-year mortgage period, tracking
            historical data.
          </li>
          <li>
            <span className="text-[color:var(--foreground)]">
              Mortgage as % of earnings:
            </span>{" "}
            fraction of total lifetime earnings (during the mortgage term) that went to housing
            payments.
          </li>
          <li>
            <span className="text-[color:var(--foreground)]">Key insight:</span> high initial
            rates with rapid wage growth (1980s) can still result in manageable lifetime burdens
            compared with lower-rate, high-price eras (2020s).
          </li>
          <li>
            <span className="text-[color:var(--foreground)]">Extrapolation:</span> beyond 2024,
            interest rates stay at 2024 levels while wages grow annually at approximately{" "}
            {wageGrowthMultiplier.toFixed(3)}x.
          </li>
        </ul>
      </LabDetails>
    </LabShell>
  );
};

export default HousingMarketAnalysis;


