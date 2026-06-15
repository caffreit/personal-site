"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

type BudgetCategory = {
  id: string;
  name: string;
  color: string;
  correctBlocks: number;
  correctPercentage: number;
  info: string;
  shortLabel?: string;
};

const TOTAL_BLOCKS = 20;
const BLOCK_PERCENTAGE = 5;
const BLOCK_IDS = Array.from({ length: TOTAL_BLOCKS }, (_, index) => index);

const CATEGORIES: BudgetCategory[] = [
  {
    id: "social-protection",
    name: "Social Protection",
    color: "#45B7D1",
    correctBlocks: 8,
    correctPercentage: 40.9,
    info: "This is the largest area of government spending. It covers social welfare payments, including the State Pension, Child Benefit, Jobseeker's payments, and supports for people with disabilities and carers.",
  },
  {
    id: "health",
    name: "Health",
    color: "#FF6B6B",
    correctBlocks: 5,
    correctPercentage: 23.1,
    info: "Funds the public health system, including hospital staffing, medicines, and community-based care services.",
  },
  {
    id: "education",
    name: "Education",
    color: "#4ECDC4",
    correctBlocks: 3,
    correctPercentage: 14.9,
    info: "Covers primary and secondary schools, teacher pay, school building programs, and third-level education supports.",
  },
  {
    id: "housing",
    name: "Housing",
    color: "#F7B801",
    correctBlocks: 1,
    correctPercentage: 5.9,
    info: "Funds social and affordable home delivery, rental supports like HAP, and homelessness services.",
  },
  {
    id: "transport",
    name: "Transport",
    color: "#F18701",
    correctBlocks: 1,
    correctPercentage: 4.3,
    info: "Covers public transport investment, roads maintenance and upgrades, plus active travel infrastructure.",
  },
  {
    id: "debt-eu-budget",
    name: "Debt & EU Budget",
    color: "#5A4D9B",
    correctBlocks: 1,
    correctPercentage: 4.5,
    info: "A non-discretionary cost covering interest on national debt and Ireland's annual EU budget contribution.",
  },
  {
    id: "other",
    name: "Other*",
    shortLabel: "Other",
    color: "#9A9A9A",
    correctBlocks: 1,
    correctPercentage: 6.3,
    info: "A broad category that includes justice, defence, agriculture, foreign affairs, and core government administration.",
  },
];

function roundedPercent(value: number) {
  return `${Math.round(value)}%`;
}

export default function IrishBudgetBlockGame() {
  const [allocations, setAllocations] = useState<Record<number, string | null>>(
    () =>
      BLOCK_IDS.reduce(
        (acc, blockId) => {
          acc[blockId] = null;
          return acc;
        },
        {} as Record<number, string | null>,
      ),
  );
  const [draggedBlockId, setDraggedBlockId] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [expandedInfoIds, setExpandedInfoIds] = useState<string[]>([]);

  const categoryCounts = useMemo(() => {
    const counts = CATEGORIES.reduce(
      (acc, category) => {
        acc[category.id] = 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    BLOCK_IDS.forEach((blockId) => {
      const assigned = allocations[blockId];
      if (assigned) counts[assigned] += 1;
    });

    return counts;
  }, [allocations]);

  const unallocatedBlockIds = useMemo(
    () => BLOCK_IDS.filter((blockId) => allocations[blockId] === null),
    [allocations],
  );
  const remainingBlocks = unallocatedBlockIds.length;

  function assignBlockToCategory(blockId: number, categoryId: string) {
    if (checked) return;
    setAllocations((prev) => ({ ...prev, [blockId]: categoryId }));
  }

  function returnBlockToBank(blockId: number) {
    if (checked) return;
    setAllocations((prev) => ({ ...prev, [blockId]: null }));
  }

  function addBlockViaButton(categoryId: string) {
    if (checked) return;
    const blockId = BLOCK_IDS.find((id) => allocations[id] === null);
    if (blockId === undefined) return;
    assignBlockToCategory(blockId, categoryId);
  }

  function removeBlockViaButton(categoryId: string) {
    if (checked) return;
    const blockId = BLOCK_IDS.find((id) => allocations[id] === categoryId);
    if (blockId === undefined) return;
    returnBlockToBank(blockId);
  }

  function handleReset() {
    setAllocations(
      BLOCK_IDS.reduce(
        (acc, blockId) => {
          acc[blockId] = null;
          return acc;
        },
        {} as Record<number, string | null>,
      ),
    );
    setDraggedBlockId(null);
    setChecked(false);
    setExpandedInfoIds([]);
  }

  function toggleInfo(categoryId: string) {
    setExpandedInfoIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 lg:px-8">
      <Link
        href="/labs"
        className="mb-8 inline-flex items-center gap-2 text-stone-500 transition-colors hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="font-mono text-sm font-medium uppercase tracking-[0.2em]">
          Back to Labs
        </span>
      </Link>

      <header className="mb-10 space-y-4">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
          Public Spending • Ireland 2024
        </p>
        <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-stone-900 sm:text-7xl">
          Irish Budget Block Game
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-stone-600 sm:text-xl">
          Drag each block into the category you think gets the money. Every
          block is 5% of expenditure, so your full set of 20 blocks represents
          the whole budget.
        </p>
      </header>

      <section className="mb-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
        <div className="mb-6">
          <h2 className="text-center text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
            Your Budget Blocks ({remainingBlocks} left)
          </h2>
          <p className="mt-2 text-center text-sm text-stone-600 sm:text-base">
            Drag blocks to categories, or use + / - controls for touch devices.
          </p>
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (draggedBlockId !== null) {
                returnBlockToBank(draggedBlockId);
              }
              setDraggedBlockId(null);
            }}
            className="mx-auto mt-4 flex min-h-[7rem] max-w-3xl flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-100 p-4"
          >
            {unallocatedBlockIds.length === 0 && (
              <p className="text-sm text-stone-500">
                All blocks allocated. Check your guess below.
              </p>
            )}
            {unallocatedBlockIds.map((blockId) => (
              <div
                key={blockId}
                draggable={!checked}
                onDragStart={() => setDraggedBlockId(blockId)}
                onDragEnd={() => setDraggedBlockId(null)}
                className="h-10 w-10 rounded-md border border-amber-500 bg-yellow-400 shadow-sm transition hover:-translate-y-0.5"
                aria-label={`Budget block ${blockId + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => {
            const count = categoryCounts[category.id];
            const assignedBlockIds = BLOCK_IDS.filter(
              (blockId) => allocations[blockId] === category.id,
            );
            const isInfoOpen = expandedInfoIds.includes(category.id);
            const userPercentage = count * BLOCK_PERCENTAGE;
            const isCorrect = count === category.correctBlocks;

            return (
              <div
                key={category.id}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedBlockId !== null) {
                    assignBlockToCategory(draggedBlockId, category.id);
                  }
                  setDraggedBlockId(null);
                }}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
              >
                <h3
                  className="text-center text-lg font-black"
                  style={{ color: category.color }}
                >
                  {category.name}
                </h3>
                {category.id === "other" && (
                  <p className="text-center text-xs text-stone-500">
                    *Justice, Defence, etc.
                  </p>
                )}
                <p className="my-2 text-center text-3xl font-black text-stone-900">
                  {userPercentage}%
                </p>

                <div className="min-h-[4rem] rounded-xl bg-stone-200 p-2">
                  <div className="flex flex-wrap gap-2">
                    {assignedBlockIds.map((blockId) => (
                      <button
                        key={blockId}
                        type="button"
                        draggable={!checked}
                        onDragStart={() => setDraggedBlockId(blockId)}
                        onDragEnd={() => setDraggedBlockId(null)}
                        onClick={() => returnBlockToBank(blockId)}
                        disabled={checked}
                        className="h-8 w-8 rounded border border-amber-500 bg-yellow-400 shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
                        aria-label={`Remove block ${blockId + 1} from ${category.name}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => addBlockViaButton(category.id)}
                    disabled={checked || remainingBlocks === 0}
                    className="pill-control rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-800 transition hover:border-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="pill-label">+ Add</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlockViaButton(category.id)}
                    disabled={checked || count === 0}
                    className="pill-control rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-800 transition hover:border-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="pill-label">- Remove</span>
                  </button>
                </div>

                {checked && (
                  <div className="mt-3">
                    <p
                      className={`text-sm font-semibold ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}
                    >
                      {isCorrect
                        ? `Spot On! (${roundedPercent(category.correctPercentage)})`
                        : `True Spend: ${roundedPercent(category.correctPercentage)}`}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleInfo(category.id)}
                      className="mt-2 w-full rounded-md border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-200"
                    >
                      {isInfoOpen ? "Hide Info" : "More Info"}
                    </button>
                    {isInfoOpen && (
                      <p className="mt-2 rounded-md bg-stone-200 px-3 py-2 text-sm leading-relaxed text-stone-700">
                        {category.info}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {remainingBlocks === 0 && !checked && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setChecked(true)}
              className="pill-control rounded-full bg-stone-900 px-8 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-stone-700"
            >
              <span className="pill-label">Check My Guess</span>
            </button>
          </div>
        )}

        {checked && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="pill-control gap-2 rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="pill-label">Play Again</span>
            </button>
          </div>
        )}
      </section>

      <footer className="text-center text-sm text-stone-500">
        <p>
          Data sourced and aggregated from Department of Public Expenditure and
          Oireachtas Parliamentary Budget Office material for 2024.
        </p>
      </footer>
    </div>
  );
}
