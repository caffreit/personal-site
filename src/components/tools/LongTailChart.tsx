'use client';

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

interface ChartLabel {
  x: number;
  text: string;
  subtext: string;
}

interface LongTailChartProps {
  isExpanded?: boolean;
}

const LongTailChart: React.FC<LongTailChartProps> = ({ isExpanded = true }) => {
  const [expanded, setExpanded] = useState(isExpanded);

  const width = 800;
  const height = 400;
  const paddingTop = 40;
  const paddingRight = 40;
  const paddingBottom = 60;
  const paddingLeft = 60;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const getY = (normalizedX: number) => {
    return Math.exp(-normalizedX * 3.5);
  };

  const { curvePath, areaPath } = useMemo(() => {
    const points: string[] = [];
    const steps = 100;

    for (let i = 0; i <= steps; i += 1) {
      const normalizedX = i / steps;
      const x = paddingLeft + normalizedX * plotWidth;
      const y = paddingTop + (1 - getY(normalizedX)) * plotHeight;
      points.push(`${x},${y}`);
    }

    const curveD = `M ${points.join(" L ")}`;
    const baselineY = height - paddingBottom;
    const areaD = `${curveD} L ${paddingLeft + plotWidth},${baselineY} L ${paddingLeft},${baselineY} Z`;

    return { curvePath: curveD, areaPath: areaD };
  }, [plotHeight, plotWidth, height, paddingBottom, paddingLeft, paddingTop]);

  const initialThreshold = 0.22;
  const expandedThreshold = 0.7;
  const currentXRatio = expanded ? expandedThreshold : initialThreshold;
  const currentXPx = paddingLeft + currentXRatio * plotWidth;
  const revealRectX = paddingLeft + initialThreshold * plotWidth;
  const revealRectWidth = (expandedThreshold - initialThreshold) * plotWidth;

  const labels: ChartLabel[] = [
    { x: 0.08, text: "Big Tech", subtext: "Google, Meta" },
    { x: 0.28, text: "Enterprise", subtext: "B2B SaaS" },
    { x: 0.55, text: "Niche Tools", subtext: "Vertical SaaS" },
    { x: 0.85, text: "Hyper-Niche", subtext: "Individual scripts" },
  ];

  return (
    <div className="my-12 space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          disabled={expanded}
          aria-pressed={expanded}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            expanded
              ? "bg-[#FCEFC0] text-stone-500 cursor-not-allowed"
              : "bg-stone-900 text-[#F4CA16] hover:bg-stone-800"
          }`}
        >
          Apply AI Efficiency
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          disabled={!expanded}
          aria-pressed={!expanded}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            !expanded
              ? "border-stone-200 text-stone-400 cursor-not-allowed dark:border-zinc-700 dark:text-zinc-500"
              : "border-[#F4CA16] text-stone-900 hover:bg-[#F4CA16] hover:text-stone-950 dark:border-[#F4CA16] dark:text-white dark:hover:text-stone-950"
          }`}
        >
          Reset Model
        </button>
      </div>
      <div className="relative h-full w-full overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full select-none"
        style={{ maxHeight: "500px" }}
      >
        <defs>
          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F4CA16" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F4CA16" stopOpacity="0.08" />
          </linearGradient>

          <mask id="viabilityMask">
            <rect
              x={revealRectX}
              y={paddingTop}
              width={expanded ? revealRectWidth : 0}
              height={plotHeight}
              fill="white"
              className="transition-all duration-[1500ms] ease-in-out"
            />
          </mask>
        </defs>

        {[0, 0.33, 0.66, 1].map((tick) => (
          <line
            key={tick}
            x1={paddingLeft}
            y1={paddingTop + (1 - tick) * plotHeight}
            x2={width - paddingRight}
            y2={paddingTop + (1 - tick) * plotHeight}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}

        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="#cbd5e1"
          strokeWidth="2"
        />

        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={height - paddingBottom}
          stroke="#cbd5e1"
          strokeWidth="2"
        />

        <text
          x={width / 2}
          y={height - 15}
          textAnchor="middle"
          className="fill-stone-500 text-xs font-medium uppercase tracking-wider"
        >
          Market Specificity (Long Tail)
        </text>
        <text
          x={20}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90 20 ${height / 2})`}
          className="fill-stone-500 text-xs font-medium uppercase tracking-wider"
        >
          Revenue Potential
        </text>

        <path d={areaPath} fill="url(#curveGradient)" />

        <path d={areaPath} fill="url(#successGradient)" mask="url(#viabilityMask)" />

        <path
          d={curvePath}
          fill="none"
          stroke="#6366f1"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {labels.map((label) => {
          const labelX = paddingLeft + label.x * plotWidth;
          const isViable = label.x < currentXRatio;

          return (
            <g key={label.text}>
              <line
                x1={labelX}
                y1={height - paddingBottom}
                x2={labelX}
                y2={height - paddingBottom + 8}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <text
                x={labelX}
                y={height - paddingBottom + 24}
                textAnchor="middle"
                className={`text-xs font-semibold transition-colors duration-1000 ${
                  isViable ? "fill-stone-700" : "fill-stone-400"
                }`}
              >
                {label.text}
              </text>
              <text
                x={labelX}
                y={height - paddingBottom + 40}
                textAnchor="middle"
                className={`text-[10px] transition-colors duration-1000 ${
                  isViable ? "fill-stone-500" : "fill-stone-300"
                }`}
              >
                {label.subtext}
              </text>
            </g>
          );
        })}

        <motion.g
          animate={{ x: currentXPx }}
          transition={{ duration: 1.5, type: "spring", bounce: 0.1 }}
        >
          <line
            x1={0}
            y1={paddingTop}
            x2={0}
            y2={height - paddingBottom}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          <circle cx={0} cy={height - paddingBottom} r={4} fill="#ef4444" />

          <g transform={`translate(10, ${paddingTop + 20})`}>
            <rect x={-4} y={-14} width={150} height={24} rx={4} fill="white" fillOpacity="0.9" />
            <text
              className="fill-red-500 text-xs font-bold uppercase tracking-tight"
              dominantBaseline="middle"
            >
              ← Min. Viable Market Size
            </text>
          </g>
        </motion.g>

        <motion.g
          initial={false}
          animate={{
            x: currentXPx,
            opacity: 1,
          }}
          transition={{ duration: 1.5, type: "spring", bounce: 0.1 }}
        >
          <text
            x={-10}
            y={height / 2}
            textAnchor="end"
            className="fill-red-500 text-xs font-medium"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            Development Cost Barrier
          </text>
        </motion.g>
      </svg>
      </div>
    </div>
  );
};

export default LongTailChart;

