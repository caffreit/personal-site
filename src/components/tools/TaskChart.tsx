'use client';

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: number;
  initialCost: number;
  finalCost: number;
  reward: number;
  size: number;
}

interface ChartDimensions {
  width: number;
  height: number;
  padding: number;
  maxValue: number;
}

const defaultTasks: Task[] = [
  { id: 1, initialCost: 80, finalCost: 40, reward: 70, size: 4 },
  { id: 2, initialCost: 65, finalCost: 32, reward: 55, size: 5 },
  { id: 3, initialCost: 50, finalCost: 28, reward: 60, size: 6 },
  { id: 4, initialCost: 45, finalCost: 22, reward: 48, size: 5 },
  { id: 5, initialCost: 40, finalCost: 18, reward: 52, size: 6 },
  { id: 6, initialCost: 55, finalCost: 36, reward: 46, size: 4 },
  { id: 7, initialCost: 70, finalCost: 30, reward: 68, size: 6 },
  { id: 8, initialCost: 30, finalCost: 15, reward: 40, size: 5 },
  { id: 9, initialCost: 60, finalCost: 26, reward: 62, size: 6 },
  { id: 10, initialCost: 25, finalCost: 12, reward: 30, size: 4 },
  { id: 11, initialCost: 85, finalCost: 42, reward: 78, size: 7 },
  { id: 12, initialCost: 48, finalCost: 20, reward: 58, size: 5 },
  { id: 13, initialCost: 35, finalCost: 14, reward: 45, size: 4 },
];

const chartDimensions: ChartDimensions = {
  width: 720,
  height: 480,
  padding: 60,
  maxValue: 100,
};

const TaskChart: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const tasks = useMemo(() => defaultTasks, []);
  const { width, height, padding, maxValue } = chartDimensions;

  const scaleX = (x: number) => (x / maxValue) * (width - 2 * padding) + padding;
  const scaleY = (y: number) => height - ((y / maxValue) * (height - 2 * padding) + padding);

  const ticks = [0, 20, 40, 60, 80, 100];

  return (
    <div className="my-12 space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setIsAnimating(true)}
          disabled={isAnimating}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            isAnimating
              ? "bg-[#FCEFC0] text-stone-500 cursor-not-allowed"
              : "bg-stone-900 text-[#F4CA16] hover:bg-stone-800"
          }`}
        >
          Automate Tasks
        </button>
        <button
          type="button"
          onClick={() => setIsAnimating(false)}
          disabled={!isAnimating}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            !isAnimating
              ? "border-stone-200 text-stone-400 cursor-not-allowed dark:border-zinc-700 dark:text-zinc-500"
              : "border-[#F4CA16] text-stone-900 hover:bg-[#F4CA16] hover:text-stone-950 dark:border-[#F4CA16] dark:text-white dark:hover:text-stone-950"
          }`}
        >
          Reset Workload
        </button>
      </div>

      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="pointer-events-none absolute left-8 top-6 z-10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">
            Cost vs Value Map
          </h3>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto h-auto w-full max-w-4xl select-none"
          style={{ maxHeight: "520px" }}
        >
          <defs>
            <pattern id="chart-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
            </pattern>
            <filter id="profit-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect
            x={padding}
            y={padding}
            width={width - 2 * padding}
            height={height - 2 * padding}
            fill="url(#chart-grid)"
          />

          {ticks.map((value) => (
            <React.Fragment key={value}>
              <line
                x1={scaleX(value)}
                y1={height - padding}
                x2={scaleX(value)}
                y2={padding}
                stroke={value === 0 ? "#94a3b8" : "#e2e8f0"}
                strokeWidth={value === 0 ? 2 : 1}
                strokeDasharray={value === 0 ? "0" : "4"}
              />
              <line
                x1={padding}
                y1={scaleY(value)}
                x2={width - padding}
                y2={scaleY(value)}
                stroke={value === 0 ? "#94a3b8" : "#e2e8f0"}
                strokeWidth={value === 0 ? 2 : 1}
                strokeDasharray={value === 0 ? "0" : "4"}
              />
              <text
                x={scaleX(value)}
                y={height - padding + 24}
                textAnchor="middle"
                className="fill-stone-400 text-[11px] font-medium"
              >
                ${value}
              </text>
              <text
                x={padding - 12}
                y={scaleY(value) + 4}
                textAnchor="end"
                className="fill-stone-400 text-[11px] font-medium"
              >
                ${value}
              </text>
            </React.Fragment>
          ))}

          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            className="fill-stone-600 text-sm font-semibold"
          >
            Operational Cost
          </text>
          <text
            x={15}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90 15 ${height / 2})`}
            className="fill-stone-600 text-sm font-semibold"
          >
            Business Reward
          </text>

          <line
            x1={scaleX(0)}
            y1={scaleY(0)}
            x2={scaleX(maxValue)}
            y2={scaleY(maxValue)}
            stroke="#cbd5e1"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          <text
            x={scaleX(85)}
            y={scaleY(15)}
            textAnchor="middle"
            className="pointer-events-none select-none text-xs font-semibold text-rose-300"
          >
            UNPROFITABLE ZONE
          </text>
          <text
            x={scaleX(20)}
            y={scaleY(90)}
            textAnchor="middle"
            className="pointer-events-none select-none text-xs font-semibold text-emerald-300"
          >
            PROFITABLE ZONE
          </text>

          <AnimatePresence>
            {tasks.map((task) => {
              const currentCost = isAnimating ? task.finalCost : task.initialCost;
              const isProfitable = task.reward > currentCost;

              return (
                <g key={task.id}>
                  {isAnimating && (
                    <motion.line
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.4 }}
                      x1={scaleX(task.initialCost)}
                      y1={scaleY(task.reward)}
                      x2={scaleX(task.finalCost)}
                      y2={scaleY(task.reward)}
                      stroke={isProfitable ? "#10b981" : "#94a3b8"}
                      strokeWidth="1"
                      strokeLinecap="round"
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  )}

                  <motion.circle
                    r={task.size}
                    initial={false}
                    animate={{
                      cx: scaleX(currentCost),
                      cy: scaleY(task.reward),
                      fill: isProfitable ? "#10b981" : "#f43f5e",
                      stroke: isProfitable ? "#059669" : "#e11d48",
                      strokeWidth: 1.5,
                      fillOpacity: isProfitable ? 0.9 : 0.6,
                      filter: isProfitable ? "url(#profit-glow)" : "none",
                    }}
                    transition={{
                      duration: 2,
                      delay: task.id * 0.02,
                      type: "spring",
                      stiffness: 40,
                      damping: 15,
                    }}
                    whileHover={{ scale: 2, zIndex: 50 }}
                  />
                </g>
              );
            })}
          </AnimatePresence>
        </svg>

        <div className="absolute bottom-6 right-8 flex flex-col gap-2 rounded-lg border border-stone-200 bg-white/90 p-3 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border border-emerald-600 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            <span className="font-medium text-stone-600">Profitable (ROI &gt; 1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border border-rose-600 bg-rose-500 opacity-80" />
            <span className="font-medium text-stone-600">Unprofitable (ROI &lt; 1)</span>
          </div>
          <div className="mt-1 flex items-center gap-2 border-t border-stone-100 pt-2">
            <div className="h-0.5 w-6 border border-dashed border-stone-300" />
            <span className="text-stone-400">Break-even</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskChart;

