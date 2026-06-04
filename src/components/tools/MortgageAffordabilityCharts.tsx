"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { mortgageAffordabilityData } from "./mortgageAffordabilityData";

type Section = 1 | 2 | 3 | 4 | 5;

type MortgageAffordabilityChartsProps = {
  section?: Section;
};

type CohortConfig = {
  year: number;
  key: string;
  color: string;
};

type FitTooltipPayload = {
  name?: string;
  payload?: {
    year?: number;
    ratePct?: number;
    priceToWage?: number;
  };
};

type FitTooltipProps = {
  active?: boolean;
  payload?: FitTooltipPayload[];
};

const mortgageTermYears = 25;

const cohortConfigs: CohortConfig[] = [
  { year: 1970, key: "cohort1970", color: "#b45309" },
  { year: 1985, key: "cohort1985", color: "#7c3aed" },
  { year: 2000, key: "cohort2000", color: "#2563eb" },
  { year: 2007, key: "cohort2007", color: "#dc2626" },
  { year: 2020, key: "cohort2020", color: "#059669" },
];

const chartCard =
  "rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 md:p-6";
const headingClass = "mt-2 font-sans text-xl font-bold text-stone-900 dark:text-stone-100";
const noteClass = "mt-4 text-sm text-stone-500 dark:text-stone-400";
const axisTick = { fill: "#78716c", fontSize: 13 };
const euroFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function pvaf(rateDecimal: number, termYears: number) {
  if (rateDecimal <= 0) return termYears;
  return (1 - Math.pow(1 + rateDecimal, -termYears)) / rateDecimal;
}

function fitPriceWageToPvaf(data: { priceToWage: number; initialRatePct: number }[]) {
  const x = data.map((d) => pvaf(d.initialRatePct / 100, mortgageTermYears));
  const y = data.map((d) => d.priceToWage);
  const xMean = x.reduce((sum, value) => sum + value, 0) / x.length;
  const yMean = y.reduce((sum, value) => sum + value, 0) / y.length;

  let numerator = 0;
  let denominator = 0;
  for (let idx = 0; idx < x.length; idx += 1) {
    const dx = x[idx] - xMean;
    numerator += dx * (y[idx] - yMean);
    denominator += dx * dx;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;
  return { slope, intercept };
}

function InterestRateFitTooltip({ active, payload }: FitTooltipProps) {
  if (!active || !payload?.length) return null;

  const observedPoint = payload.find(
    (entry) =>
      typeof entry.payload?.year === "number" &&
      typeof entry.payload.ratePct === "number" &&
      typeof entry.payload.priceToWage === "number"
  )?.payload;
  if (
    !observedPoint ||
    typeof observedPoint.year !== "number" ||
    typeof observedPoint.ratePct !== "number" ||
    typeof observedPoint.priceToWage !== "number"
  ) {
    return null;
  }

  return (
    <div className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <div className="font-semibold text-stone-900 dark:text-stone-100">Year {observedPoint.year}</div>
      <div className="mt-1 text-stone-600 dark:text-stone-300">
        Rate {observedPoint.ratePct.toFixed(2)}%
      </div>
      <div className="text-stone-600 dark:text-stone-300">
        Price/Wage {observedPoint.priceToWage.toFixed(2)}x
      </div>
    </div>
  );
}

export default function MortgageAffordabilityCharts({ section }: MortgageAffordabilityChartsProps) {
  const isClient = typeof window !== "undefined";

  const series = useMemo(
    () =>
      mortgageAffordabilityData.map((row) => {
        const annualPayment = row.initialMonthlyPayment * 12;
        const initialBurdenPct = (annualPayment / row.annualWage) * 100;
        return {
          ...row,
          annualPayment,
          initialBurdenPct: Number(initialBurdenPct.toFixed(2)),
          rateDecimal: row.initialRatePct / 100,
        };
      }),
    []
  );

  const fit = useMemo(() => fitPriceWageToPvaf(series), [series]);

  const fitScatter = useMemo(
    () =>
      series.map((row) => ({
        year: row.year,
        ratePct: row.initialRatePct,
        priceToWage: row.priceToWage,
      })),
    [series]
  );

  const fitCurve = useMemo(() => {
    const minRate = 2.5;
    const maxRate = 16.5;
    const step = 0.2;
    const points: { ratePct: number; fittedPriceToWage: number }[] = [];
    for (let rate = minRate; rate <= maxRate; rate += step) {
      const fitted = fit.intercept + fit.slope * pvaf(rate / 100, mortgageTermYears);
      points.push({
        ratePct: Number(rate.toFixed(2)),
        fittedPriceToWage: Number(fitted.toFixed(3)),
      });
    }
    return points;
  }, [fit]);

  const cohortSeries = useMemo(() => {
    const byYear = new Map<number, number>(series.map((row, idx) => [row.year, idx]));
    const maxHorizon = mortgageTermYears - 1;
    const output = Array.from({ length: maxHorizon + 1 }, (_, idx) => ({ yearsSincePurchase: idx }));

    for (const cohort of cohortConfigs) {
      const startIdx = byYear.get(cohort.year);
      if (startIdx === undefined) continue;

      const initialAnnualPayment = series[startIdx].annualPayment;
      const availableHorizon = Math.min(maxHorizon, series.length - 1 - startIdx);

      for (let t = 0; t <= availableHorizon; t += 1) {
        const wageNow = series[startIdx + t].annualWage;
        const burden = (initialAnnualPayment / wageNow) * 100;
        (output[t] as Record<string, number>)[cohort.key] = Number(burden.toFixed(2));
      }
    }
    return output;
  }, [series]);

  const lifetimeVsInitial = useMemo(
    () =>
      series.map((row) => ({
        year: row.year,
        lifetimeBurdenPct: row.lifetimeBurdenPct,
        initialBurdenPct: row.initialBurdenPct,
      })),
    [series]
  );

  const housingWealthByCohort = useMemo(() => {
    const latestHousePrice = series[series.length - 1]?.housePrice ?? 0;
    return series.map((row, idx) => {
      const totalEarningsToLatest = series
        .slice(idx)
        .reduce((sum, cohortRow) => sum + cohortRow.annualWage, 0);
      const housingWealthGainPct =
        totalEarningsToLatest === 0
          ? 0
          : ((latestHousePrice - row.housePrice) / totalEarningsToLatest) * 100;

      return {
        year: row.year,
        housingWealthGain: latestHousePrice - row.housePrice,
        housingWealthGainPct: Number(housingWealthGainPct.toFixed(2)),
      };
    });
  }, [series]);

  const showOne = section === undefined || section === 1;
  const showTwo = section === undefined || section === 2;
  const showThree = section === undefined || section === 3;
  const showFour = section === undefined || section === 4;
  const showFive = section === undefined || section === 5;

  if (!isClient) {
    return (
      <div className="my-12 rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-stone-400 md:my-16">
        Loading chart views...
      </div>
    );
  }

  return (
    <div className="my-12 space-y-6 md:my-16 md:space-y-8">
      {showOne && (
        <section className={chartCard}>
          <h3 className={headingClass}>Price-to-Wage vs Initial Mortgage Burden</h3>
          <div className="mt-5 h-[360px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={280}>
              <LineChart data={series} margin={{ top: 14, right: 20, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} />
                <XAxis dataKey="year" tick={axisTick} />
                <YAxis
                  yAxisId="left"
                  tick={axisTick}
                  width={58}
                  domain={["dataMin - 0.3", "dataMax + 0.4"]}
                  tickFormatter={(value: number) => `${value.toFixed(1)}x`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={axisTick}
                  width={64}
                  tickFormatter={(value: number) => `${value.toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", borderColor: "#d6d3d1" }}
                  formatter={(value: number, name: string) => {
                    if (name === "Price / Wage") return [`${value.toFixed(2)}x`, name];
                    return [`${value.toFixed(1)}%`, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="left" type="monotone" dataKey="priceToWage" name="Price / Wage" stroke="#7c3aed" strokeWidth={2.6} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="initialBurdenPct" name="Initial Burden (% wage)" stroke="#f97316" strokeWidth={2.3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className={noteClass}>Initial burden is annualized first-year mortgage payment as a share of annual wage.</p>
        </section>
      )}

      {showTwo && (
        <>
          <section className={chartCard}>
            <h3 className={headingClass}>Price-to-Wage and Interest Rates Over Time</h3>
            <div className="mt-5 h-[360px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={280}>
                <LineChart data={series} margin={{ top: 14, right: 20, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} />
                  <XAxis dataKey="year" tick={axisTick} />
                  <YAxis
                    yAxisId="left"
                    tick={axisTick}
                    width={58}
                    domain={["dataMin - 0.3", "dataMax + 0.4"]}
                    tickFormatter={(value: number) => `${value.toFixed(1)}x`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={axisTick}
                    width={64}
                    tickFormatter={(value: number) => `${value.toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", borderColor: "#d6d3d1" }}
                    formatter={(value: number, name: string) => {
                      if (name === "Price / Wage") return [`${value.toFixed(2)}x`, name];
                      return [`${value.toFixed(1)}%`, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line yAxisId="left" type="monotone" dataKey="priceToWage" name="Price / Wage" stroke="#7c3aed" strokeWidth={2.6} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="initialRatePct" name="Mortgage Rate" stroke="#f97316" strokeWidth={2.3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={noteClass}>Price-to-wage uses the left axis; mortgage interest rates use the right axis.</p>
          </section>

          <section className={chartCard}>
            <h3 className={headingClass}>Interest Rates and the Price-to-Wage Curve</h3>
            <div className="mt-5 h-[360px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={280}>
                <ComposedChart margin={{ top: 12, right: 20, left: 6, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} />
                  <XAxis type="number" dataKey="ratePct" domain={[2.5, 17]} tick={axisTick} tickFormatter={(value: number) => `${value.toFixed(0)}%`} />
                  <YAxis type="number" dataKey="priceToWage" tick={axisTick} width={58} tickFormatter={(value: number) => `${value.toFixed(1)}x`} />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={<InterestRateFitTooltip />}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Scatter data={fitScatter} name="Observed Price/Wage" fill="#dc2626" />
                  <Line type="monotone" data={fitCurve} dataKey="fittedPriceToWage" name="Fitted Q = d + m * PVAF(r, n)" stroke="#2563eb" strokeWidth={2.4} dot={false} legendType="line" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className={noteClass}>
              Fitted coefficients from the data: d (deposit term) = {fit.intercept.toFixed(2)}, m (payment share term) = {fit.slope.toFixed(3)}.
            </p>
          </section>
        </>
      )}

      {showThree && (
        <section className={chartCard}>
          <h3 className={headingClass}>Mortgage Burden by Buyer Cohort</h3>
          <div className="mt-5 h-[360px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={280}>
              <LineChart data={cohortSeries} margin={{ top: 14, right: 20, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} />
                <XAxis dataKey="yearsSincePurchase" tick={axisTick} tickFormatter={(value: number) => `${value}y`} />
                <YAxis tick={axisTick} width={62} tickFormatter={(value: number) => `${value.toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", borderColor: "#d6d3d1" }}
                  formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                  labelFormatter={(label) => `${label} years since purchase`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {cohortConfigs.map((cohort) => (
                  <Line
                    key={cohort.key}
                    type="monotone"
                    dataKey={cohort.key}
                    name={`Bought ${cohort.year}`}
                    stroke={cohort.color}
                    strokeWidth={2.1}
                    connectNulls={false}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className={noteClass}>Each cohort holds its initial annual payment fixed and tracks how that payment ratio changes with later wages.</p>
        </section>
      )}

      {showFour && (
        <section className={chartCard}>
          <h3 className={headingClass}>Initial vs Lifetime Mortgage Burden</h3>
          <div className="mt-5 h-[360px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={280}>
              <LineChart data={lifetimeVsInitial} margin={{ top: 14, right: 20, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} />
                <XAxis dataKey="year" tick={axisTick} />
                <YAxis tick={axisTick} width={62} tickFormatter={(value: number) => `${value.toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", borderColor: "#d6d3d1" }}
                  formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine x={2008} stroke="#a8a29e" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="initialBurdenPct" name="Initial Burden (% wage)" stroke="#f97316" strokeWidth={2.1} dot={false} />
                <Line type="monotone" dataKey="lifetimeBurdenPct" name="Lifetime Burden (% earnings)" stroke="#16a34a" strokeWidth={2.3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className={noteClass}>Lifetime burden uses total mortgage payments divided by total earnings over the 25-year mortgage window.</p>
        </section>
      )}

      {showFive && (
        <section className={chartCard}>
          <h3 className={headingClass}>Housing Wealth Gain by Purchase Year</h3>
          <div className="mt-5 h-[360px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={280}>
              <LineChart data={housingWealthByCohort} margin={{ top: 14, right: 20, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} />
                <XAxis dataKey="year" tick={axisTick} />
                <YAxis
                  yAxisId="left"
                  tick={axisTick}
                  width={62}
                  tickFormatter={(value: number) => `${value.toFixed(0)}%`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={axisTick}
                  width={86}
                  tickFormatter={(value: number) => euroFormatter.format(value)}
                />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", borderColor: "#d6d3d1" }}
                  formatter={(value: number, name: string) => {
                    if (name === "Housing wealth gain / earnings") return [`${value.toFixed(1)}%`, name];
                    return [euroFormatter.format(value), name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine yAxisId="left" y={0} stroke="#a8a29e" strokeDasharray="4 4" />
                <Line yAxisId="left" type="monotone" dataKey="housingWealthGainPct" name="Housing wealth gain / earnings" stroke="#2563eb" strokeWidth={2.4} dot={{ r: 2.3 }} activeDot={{ r: 5 }} />
                <Line yAxisId="right" type="monotone" dataKey="housingWealthGain" name="Housing wealth gain" stroke="#16a34a" strokeWidth={2.4} dot={{ r: 2.3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className={noteClass}>Wealth gain is measured as the 2024 house price minus the purchase-year price, shown both in nominal euros and as a share of cumulative earnings from purchase year to 2024.</p>
        </section>
      )}
    </div>
  );
}
