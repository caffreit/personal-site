"use client";

import { useEffect, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type YearDatum = {
  year: number;
  salesBn: number;
  savingsBn: number;
  netWealth: number;
  housingWealth: number;
  nonHousing: number;
  gniStar: number;
  spending: number;
  salesPctGni: number;
  salesPctSpend: number;
};

type IndexedDatum = {
  year: number;
  idxSales: number;
  idxNetWealth: number;
  idxGni: number;
  idxSpending: number;
};

const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const salesBn = [5.1, 3.96, 4.91, 6.22, 9.37, 10.82, 12.22, 14.62, 16.88, 18.11, 15.73, 20.23, 23.72, 24.64, 26.27, 27.8];
const savingsBn = [8.2, 8.8, 9.2, 10.5, 11.2, 12.5, 13.9, 15.4, 17.1, 18.6, 31.2, 28.4, 21.3, 22.8, 24.1, 25.5];
const netWealth = [472, 445.6, 441.2, 485.4, 573.1, 635.8, 682, 729.5, 775.1, 824.7, 865.2, 985.4, 1120, 1180.5, 1240.9, 1288.1];
const housingWealth = [315.4, 284.1, 260.5, 292, 364.5, 402.1, 443.2, 495.8, 540.2, 565.4, 598.1, 670.3, 775.4, 812.2, 840.5, 873.9];
const gniStar = [128.9, 126.5, 126.5, 136.7, 145.2, 162.1, 175.4, 186.4, 197.5, 213.7, 198.3, 230.2, 266.7, 291.4, 321.1, 335.5];
const spending = [92.3, 91.2, 90.9, 85.9, 88.9, 92.3, 97.5, 101.6, 107, 112.4, 102.1, 114.3, 135.5, 153.9, 164.7, 170.0];

const baseIndex = {
  sales: salesBn[4],
  netWealth: netWealth[4],
  gni: gniStar[4],
  spending: spending[4],
};

const dataset: YearDatum[] = years.map((year, idx) => {
  const sales = salesBn[idx];
  const savings = savingsBn[idx];
  const wealth = netWealth[idx];
  const housing = housingWealth[idx];

  return {
    year,
    salesBn: sales,
    savingsBn: savings,
    netWealth: wealth,
    housingWealth: housing,
    nonHousing: Number((wealth - housing).toFixed(1)),
    gniStar: gniStar[idx],
    spending: spending[idx],
    salesPctGni: Number(((sales / gniStar[idx]) * 100).toFixed(1)),
    salesPctSpend: Number(((sales / spending[idx]) * 100).toFixed(1)),
  };
});

const indexed: IndexedDatum[] = dataset
  .filter((d) => d.year >= 2014)
  .map((d) => ({
    year: d.year,
    idxSales: Number(((d.salesBn / baseIndex.sales) * 100).toFixed(1)),
    idxNetWealth: Number(((d.netWealth / baseIndex.netWealth) * 100).toFixed(1)),
    idxGni: Number(((d.gniStar / baseIndex.gni) * 100).toFixed(1)),
    idxSpending: Number(((d.spending / baseIndex.spending) * 100).toFixed(1)),
  }));

// Stacked-area layers: base (floor) + transparent band below spending + gradient fill from spending to sales
const indexedV2 = indexed.map((d) => ({
  ...d,
  base: 100,
  spendFloor: Number((d.idxSpending - 100).toFixed(1)),
  shaded: Number((d.idxSales - d.idxSpending).toFixed(1)),
}));

const lastPoint = indexed[indexed.length - 1];

function makeEndDot(label: string, color: string) {
  return function EndDot({ cx, cy, index }: { cx?: number; cy?: number; index?: number }) {
    if (index !== indexed.length - 1) return <g />;
    return (
      <g>
        <circle cx={cx} cy={cy} r={3.5} fill={color} />
        <text x={(cx ?? 0) + 8} y={cy} fill={color} fontSize={11} fontWeight="600" dominantBaseline="middle">
          {label}
        </text>
      </g>
    );
  };
}

const salesEndDot = makeEndDot(`Property (${Math.round(lastPoint.idxSales)})`, "#f97316");
const gniEndDot = makeEndDot(`GNI (${Math.round(lastPoint.idxGni)})`, "#64748b");
const spendEndDot = makeEndDot(`Spending (${Math.round(lastPoint.idxSpending)})`, "#7c3aed");

function makePercentEndDot(label: string, color: string, dataLength: number) {
  return function EndDot({ cx, cy, index, value }: any) {
    if (index !== dataLength - 1) return <g />;
    const numericValue = typeof value === "number" ? value : Number(value);
    const formattedValue = Number.isFinite(numericValue) ? numericValue.toFixed(1) : value;

    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill={color} />
        <text x={(cx ?? 0) + 8} y={cy} fill={color} fontSize={11} fontWeight="700" dominantBaseline="middle">
          {`${label} ${formattedValue}%`}
        </text>
      </g>
    );
  };
}

const spendShareEndDot = makePercentEndDot("Spending", "#d97706", dataset.length);
const gniShareEndDot = makePercentEndDot("GNI*", "#16a34a", dataset.length);

const chartCard =
  "rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 md:p-6";

const headingClass = "mt-2 font-sans text-xl font-bold text-stone-900 dark:text-stone-100";
const noteClass = "mt-4 text-sm text-stone-500 dark:text-stone-400";

const moneyTick = (value: number) => `€${value}bn`;
const percentTick = (value: number) => `${value}%`;
const axisTick = { fill: "#78716c", fontSize: 14 };
const lineChartMargin = { top: 16, right: 20, bottom: 8, left: 6 };
const barChartMargin = { top: 16, right: 20, bottom: 8, left: 18 };
const compactYAxisWidth = 52;
const currencyYAxisWidth = 76;

type IrelandPropertyStoryChartsProps = {
  section?: 1 | 2 | 3;
};

export default function IrelandPropertyStoryCharts({ section }: IrelandPropertyStoryChartsProps) {
  const [isClient, setIsClient] = useState(false);
  const showOne = section === undefined || section === 1;
  const showTwo = section === undefined || section === 2;
  const showThree = section === undefined || section === 3;

  useEffect(() => {
    setIsClient(true);
  }, []);

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
        <div className="grid grid-cols-1 gap-6">
          <section className={`${chartCard} hidden md:block`}>
            <h3 className={headingClass}>Indexed Growth from 2014 Baseline</h3>
            <div className="mt-5 h-[340px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={280}>
                <LineChart data={indexed} margin={lineChartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} />
                  <XAxis dataKey="year" tick={axisTick} />
                  <YAxis tick={axisTick} width={compactYAxisWidth} />
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} (+${(value - 100).toFixed(0)}%)`, name]}
                    labelFormatter={(label) => `Year: ${label}`}
                    contentStyle={{ borderRadius: "12px", borderColor: "#d6d3d1" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine y={100} stroke="#a8a29e" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="idxSales" name="Property Sales Volume" stroke="#d97706" strokeWidth={2.6} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="idxNetWealth" name="Net Wealth" stroke="#16a34a" strokeWidth={2.2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="idxGni" name="GNI* (Real Economy)" stroke="#2563eb" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="idxSpending" name="Consumer Spending" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={noteClass}>
              Sources: CSO Institutional Sector Accounts, CSO National Accounts, Property Price Register. Indexed to 2014 = 100.
            </p>
          </section>

          {/* Static V2 chart — no tooltip, gradient fill between spending and sales lines */}
          <section className={`${chartCard} md:hidden`}>
            <h3 className={headingClass}>Property vs. Real Economy</h3>
            <div className="pointer-events-none mt-5 h-[360px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={280}>
                <ComposedChart data={indexedV2} margin={{ top: 20, right: 120, bottom: 8, left: 6 }}>
                  <defs>
                    <linearGradient id="wealthGap" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.45} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} vertical={false} />
                  <XAxis dataKey="year" tick={axisTick} />
                  <YAxis tick={axisTick} width={compactYAxisWidth} domain={[100, 315]} ticks={[100, 150, 200, 250, 300]} allowDataOverflow={true} />
                  <ReferenceLine y={100} stroke="#a8a29e" strokeDasharray="4 4" />
                  {/* Transparent base anchors the stack at 100; spendFloor is invisible; shaded gets the gradient */}
                  <Area type="monotone" stackId="gap" dataKey="base" fill="transparent" stroke="none" isAnimationActive={false} />
                  <Area type="monotone" stackId="gap" dataKey="spendFloor" fill="transparent" stroke="none" isAnimationActive={false} />
                  <Area type="monotone" stackId="gap" dataKey="shaded" fill="url(#wealthGap)" stroke="none" isAnimationActive={false} />
                  <Line type="monotone" dataKey="idxSales" stroke="#f97316" strokeWidth={2.5} dot={salesEndDot} isAnimationActive={false} />
                  <Line type="monotone" dataKey="idxGni" stroke="#64748b" strokeWidth={2} dot={gniEndDot} isAnimationActive={false} />
                  <Line type="monotone" dataKey="idxSpending" stroke="#7c3aed" strokeWidth={2} dot={spendEndDot} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className={noteClass}>
              Indexed to 2014 = 100. Sources: CSO Institutional Sector Accounts, CSO National Accounts, Property Price Register.
            </p>
          </section>

          <section className={`${chartCard} hidden md:block`}>
            <h3 className={headingClass}>Property Sales as Share of GNI* and Spending</h3>
            <div className="mt-5 h-[340px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={280}>
                <LineChart data={dataset} margin={lineChartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} />
                  <XAxis dataKey="year" tick={axisTick} />
                  <YAxis tick={axisTick} width={compactYAxisWidth} tickFormatter={percentTick} />
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                    labelFormatter={(label) => `Year: ${label}`}
                    contentStyle={{ borderRadius: "12px", borderColor: "#d6d3d1" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine y={8} stroke="#16a34a" strokeDasharray="4 4" label={{ value: "8% structural floor", fill: "#16a34a", position: "insideTopRight", fontSize: 10 }} />
                  <Line type="monotone" dataKey="salesPctSpend" name="Sales as % of Consumer Spending" stroke="#d97706" strokeWidth={2.4} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="salesPctGni" name="Sales as % of GNI*" stroke="#16a34a" strokeWidth={2.2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={noteClass}>
              Sales values are compared against consumer spending and modified GNI* to show transaction scale relative to household activity and domestic output.
            </p>
          </section>

          <section className={`${chartCard} md:hidden`}>
            <h3 className={headingClass}>Property Sales as Share of GNI* and Spending</h3>
            <div className="pointer-events-none mt-5 h-[340px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={280}>
                <LineChart data={dataset} margin={{ top: 20, right: 90, bottom: 8, left: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} />
                  <XAxis dataKey="year" tick={axisTick} />
                  <YAxis tick={axisTick} width={compactYAxisWidth} tickFormatter={percentTick} />
                  <ReferenceLine y={8} stroke="#16a34a" strokeDasharray="4 4" label={{ value: "8% floor", fill: "#16a34a", position: "insideTopRight", fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="salesPctSpend"
                    stroke="#d97706"
                    strokeWidth={2.6}
                    dot={spendShareEndDot}
                    isAnimationActive={false}
                  />
                  <Line type="monotone" dataKey="salesPctGni" stroke="#16a34a" strokeWidth={2.4} dot={gniShareEndDot} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={noteClass}>
              Mobile view is static for readability; desktop keeps full tooltip interaction. Sales values are compared against consumer spending and modified GNI*.
            </p>
          </section>
        </div>
      )}

      {showTwo && (
        <>
          <section className={`${chartCard} hidden md:block`}>
            <h3 className={headingClass}>Total Property Sales vs Annual Household Savings</h3>
            <p className="mt-3 inline-flex rounded-full border border-red-300/70 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
              Crossover begins in 2022
            </p>
            <div className="mt-5 h-[360px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={280}>
                <BarChart data={dataset} margin={barChartMargin} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} />
                  <XAxis dataKey="year" tick={axisTick} />
                  <YAxis tick={axisTick} width={currencyYAxisWidth} tickFormatter={moneyTick} />
                  <Tooltip
                    formatter={(value: number, name: string, item) => {
                      if (name === "Property Sales Value") {
                        const row = item.payload as YearDatum;
                        const pct = ((row.salesBn / row.savingsBn) * 100).toFixed(0);
                        return [`€${value.toFixed(1)}bn (=${pct}% of savings)`, name];
                      }
                      return [`€${value.toFixed(1)}bn`, name];
                    }}
                    labelFormatter={(label) => `Year: ${label}`}
                    contentStyle={{ borderRadius: "12px", borderColor: "#d6d3d1" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine x={2022} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "2022", position: "insideTopRight", fill: "#ef4444", fontSize: 10 }} />
                  <Bar dataKey="salesBn" name="Property Sales Value" radius={[4, 4, 0, 0]}>
                    {dataset.map((d) => (
                      <Cell key={`sales-${d.year}`} fill={d.year >= 2022 ? "#ef4444" : "#16a34a"} />
                    ))}
                  </Bar>
                  <Bar dataKey="savingsBn" name="Annual Household Savings" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className={noteClass}>
              Household savings include the pandemic spike in 2020-2021; despite that, transaction values still move above savings from 2022 onward.
            </p>
          </section>

          <section className={`${chartCard} md:hidden`}>
            <h3 className={headingClass}>Total Property Sales vs Annual Household Savings</h3>
            <p className="mt-3 inline-flex rounded-full border border-red-300/70 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300">
              Mobile static view (no tooltip)
            </p>
            <div className="pointer-events-none mt-5 h-[360px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={280}>
                <BarChart data={dataset} margin={barChartMargin} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} />
                  <XAxis dataKey="year" tick={axisTick} />
                  <YAxis tick={axisTick} width={currencyYAxisWidth} tickFormatter={moneyTick} />
                  <ReferenceLine x={2022} stroke="#ef4444" strokeDasharray="4 4" label={{ value: "2022 crossover", position: "insideTopRight", fill: "#ef4444", fontSize: 11 }} />
                  <Bar dataKey="salesBn" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                    {dataset.map((d) => (
                      <Cell key={`sales-mobile-${d.year}`} fill={d.year >= 2022 ? "#ef4444" : "#16a34a"} />
                    ))}
                  </Bar>
                  <Bar dataKey="savingsBn" fill="#94a3b8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className={noteClass}>
              Green/red bars show property sales, grey bars show annual savings. Crossover starts in 2022 and persists through the latest data.
            </p>
          </section>
        </>
      )}

      {showThree && (
        <>
          <section className={`${chartCard} hidden md:block`}>
            <h3 className={headingClass}>Housing vs Non-Housing Net Wealth</h3>
            <div className="mt-5 h-[360px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={280}>
                <BarChart data={dataset} margin={barChartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} />
                  <XAxis dataKey="year" tick={axisTick} />
                  <YAxis tick={axisTick} width={currencyYAxisWidth} tickFormatter={moneyTick} />
                  <Tooltip
                    formatter={(value: number, name: string, item) => {
                      if (name === "Housing Wealth") {
                        const row = item.payload as YearDatum;
                        const share = ((row.housingWealth / row.netWealth) * 100).toFixed(1);
                        return [`€${value.toFixed(1)}bn (${share}% share)`, name];
                      }
                      return [`€${value.toFixed(1)}bn`, name];
                    }}
                    labelFormatter={(label) => `Year: ${label}`}
                    contentStyle={{ borderRadius: "12px", borderColor: "#d6d3d1" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="housingWealth" name="Housing Wealth" stackId="wealth" fill="#16a34a" />
                  <Bar dataKey="nonHousing" name="Other Wealth" stackId="wealth" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className={noteClass}>
              Housing share stays near two-thirds across the period, even as total household net wealth rises strongly.
            </p>
          </section>

          <section className={`${chartCard} md:hidden`}>
            <h3 className={headingClass}>Housing vs Non-Housing Net Wealth</h3>
            <div className="pointer-events-none mt-5 h-[360px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={280}>
                <BarChart data={dataset} margin={barChartMargin}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" opacity={0.45} />
                  <XAxis dataKey="year" tick={axisTick} />
                  <YAxis tick={axisTick} width={currencyYAxisWidth} tickFormatter={moneyTick} />
                  <Bar dataKey="housingWealth" stackId="wealth" fill="#16a34a" isAnimationActive={false} />
                  <Bar dataKey="nonHousing" stackId="wealth" fill="#60a5fa" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className={noteClass}>
              Mobile static view (no tooltip): green is housing wealth and blue is non-housing wealth. Housing remains near two-thirds of net wealth.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
