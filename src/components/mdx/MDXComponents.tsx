import { ReactNode } from "react";
import DemoCounter from "../tools/DemoCounter";
import HousingMarketAnalysis from "../tools/HousingMarketAnalysis";
import LongTailChart from "../tools/LongTailChart";
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
  LongTailChart,
  TaskChart,
  blockquote: Blockquote,
  DunbarLayers,
};

export default components;


