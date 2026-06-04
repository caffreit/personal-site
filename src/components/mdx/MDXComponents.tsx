import { ReactNode } from "react";
import DemoCounter from "../tools/DemoCounter";
import HousingMarketAnalysis from "../tools/HousingMarketAnalysis";
import HousingMarketAnalysisLegacy from "../tools/HousingMarketAnalysisLegacy";
import IrelandPropertyStoryCharts from "../tools/IrelandPropertyStoryCharts";
import LongTailChart from "../tools/LongTailChart";
import MortgageAffordabilityCharts from "../tools/MortgageAffordabilityCharts";
import TaskChart from "../tools/TaskChart";

const Blockquote = ({ children }: { children: ReactNode }) => {
  return (
    <div className="my-10 p-8 bg-stone-100 rounded-3xl border-l-4 border-[var(--color-yellow)]">
      <div className="font-sans font-bold text-xl text-stone-900 italic [&>p]:m-0">
        {children}
      </div>
    </div>
  );
};

const MathBlock = ({ children }: { children: ReactNode }) => {
  return (
    <div className="my-8 overflow-x-auto rounded-2xl border border-stone-200 bg-stone-50 px-5 py-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
      <div className="inline-flex min-w-max items-center justify-center gap-2 font-serif text-2xl text-stone-950 dark:text-stone-50 md:text-3xl">
        {children}
      </div>
    </div>
  );
};

const MathFraction = ({
  numerator,
  denominator,
}: {
  numerator: ReactNode;
  denominator: ReactNode;
}) => {
  return (
    <span className="inline-flex translate-y-1 flex-col items-center px-1 align-middle leading-none">
      <span className="border-b border-current px-2 pb-1">{numerator}</span>
      <span className="px-2 pt-1">{denominator}</span>
    </span>
  );
};

const DunbarLayers = () => {
  const layers = [
    { number: "5", text: "Closest relationships (immediate family, best friends)" },
    { number: "15", text: "Close friends and relatives" },
    { number: "50", text: "Good friends and extended family" },
    { number: "150", text: "All meaningful relationships" },
  ];

  return (
    <div className="my-8 flex flex-col gap-6">
      {layers.map((layer) => (
        <div key={layer.number} className="flex items-baseline gap-4">
          <span className="w-12 shrink-0 text-right font-sans text-3xl font-bold text-[var(--color-yellow)]">
            {layer.number}
          </span>
          <span className="text-lg font-medium text-stone-800 dark:text-stone-200">
            {layer.text}
          </span>
        </div>
      ))}
    </div>
  );
};

const components = {
  DemoCounter,
  HousingMarketAnalysis,
  HousingMarketAnalysisLegacy,
  IrelandPropertyStoryCharts,
  IrelandPropertyStoryChartsOne: () => <IrelandPropertyStoryCharts section={1} />,
  IrelandPropertyStoryChartsTwo: () => <IrelandPropertyStoryCharts section={2} />,
  IrelandPropertyStoryChartsThree: () => <IrelandPropertyStoryCharts section={3} />,
  MortgageAffordabilityCharts,
  MortgageAffordabilityChartsOne: () => <MortgageAffordabilityCharts section={1} />,
  MortgageAffordabilityChartsTwo: () => <MortgageAffordabilityCharts section={2} />,
  MortgageAffordabilityChartsThree: () => <MortgageAffordabilityCharts section={3} />,
  MortgageAffordabilityChartsFour: () => <MortgageAffordabilityCharts section={4} />,
  MortgageAffordabilityChartsFive: () => <MortgageAffordabilityCharts section={5} />,
  LongTailChart,
  TaskChart,
  blockquote: Blockquote,
  DunbarLayers,
  MathBlock,
  MathFraction,
};

export default components;


