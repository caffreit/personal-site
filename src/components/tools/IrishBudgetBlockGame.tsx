"use client";

import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { LabDetails, LabHeader, LabSection, LabShell } from "@/components/labs/LabChrome";
import {
  labFootnote,
  labMicroLabel,
  labQuietButton,
  labTextButton,
} from "@/components/labs/labTokens";

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
    <LabShell>
      <LabHeader
        eyebrow="Public Spending - Ireland 2024"
        title="Irish Budget Block Game"
        lede="Drag each block into the category you think gets the money. Every block is 5% of expenditure, so your full set of 20 blocks represents the whole budget."
      />

      <LabSection
        heading="Your budget blocks"
        intro="Drag blocks to categories, or use the add and remove controls on touch devices."
        action={
          <span className={labMicroLabel}>
            {remainingBlocks} of {TOTAL_BLOCKS} left
          </span>
        }
      >
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            if (draggedBlockId !== null) {
              returnBlockToBank(draggedBlockId);
            }
            setDraggedBlockId(null);
          }}
          className="flex min-h-[5.5rem] flex-wrap content-start items-start gap-2 border-y border-[color:var(--rule-color)] py-5"
        >
          {unallocatedBlockIds.length === 0 && (
            <p className={labFootnote}>All blocks allocated. Check your guess below.</p>
          )}
          {unallocatedBlockIds.map((blockId) => (
            <div
              key={blockId}
              draggable={!checked}
              onDragStart={() => setDraggedBlockId(blockId)}
              onDragEnd={() => setDraggedBlockId(null)}
              className="h-9 w-9 cursor-grab bg-[#F4CA16] transition-transform hover:-translate-y-0.5"
              aria-label={`Budget block ${blockId + 1}`}
            />
          ))}
        </div>
      </LabSection>

      <section className="mt-9 grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
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
              className="border-t border-[color:var(--rule-color)] pt-4"
            >
              {/* Fixed height so every category's figure sits on one baseline,
                  including the one carrying a footnote. */}
              <div className="min-h-[3.25rem]">
                <div className="flex items-baseline gap-2">
                  <span
                    className="mt-[0.35em] h-2.5 w-2.5 shrink-0 self-start rounded-full"
                    style={{ background: category.color }}
                    aria-hidden="true"
                  />
                  <h3 className="text-[1.05rem] font-normal leading-snug text-[color:var(--foreground)]">
                    {category.name}
                  </h3>
                </div>
                {category.id === "other" && (
                  <p className={`mt-1 pl-[1.125rem] ${labFootnote}`}>
                    *Justice, Defence, etc.
                  </p>
                )}
              </div>

              <p className="text-[2.2rem] font-light leading-none tracking-[-0.03em] tabular-nums text-[color:var(--foreground)]">
                {userPercentage}%
              </p>

              <div className="mt-4 flex min-h-[3.25rem] flex-wrap content-start gap-2 border-t border-[color:var(--rule-color)] pt-3">
                {assignedBlockIds.map((blockId) => (
                  <button
                    key={blockId}
                    type="button"
                    draggable={!checked}
                    onDragStart={() => setDraggedBlockId(blockId)}
                    onDragEnd={() => setDraggedBlockId(null)}
                    onClick={() => returnBlockToBank(blockId)}
                    disabled={checked}
                    className="h-7 w-7 bg-[#F4CA16] disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label={`Remove block ${blockId + 1} from ${category.name}`}
                  />
                ))}
              </div>

              <div className="mt-4 flex gap-5">
                <button
                  type="button"
                  onClick={() => addBlockViaButton(category.id)}
                  disabled={checked || remainingBlocks === 0}
                  className={labQuietButton}
                >
                  + Add
                </button>
                <button
                  type="button"
                  onClick={() => removeBlockViaButton(category.id)}
                  disabled={checked || count === 0}
                  className={labQuietButton}
                >
                  - Remove
                </button>
              </div>

              {checked && (
                <div className="mt-5 border-t border-[color:var(--rule-color)] pt-3">
                  <p
                    className={`font-mono text-[0.58rem] uppercase tracking-[0.16em] ${
                      isCorrect
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-rose-700 dark:text-rose-400"
                    }`}
                  >
                    {isCorrect ? "Spot on" : "True spend"}
                  </p>
                  <p className="mt-1.5 text-[1.3rem] font-light tabular-nums text-[color:var(--foreground)]">
                    {roundedPercent(category.correctPercentage)}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleInfo(category.id)}
                    className={`mt-3 ${labQuietButton}`}
                  >
                    {isInfoOpen ? "Hide info" : "More info"}
                  </button>
                  {isInfoOpen && (
                    <p className={`mt-3 ${labFootnote}`}>{category.info}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {remainingBlocks === 0 && !checked && (
        <div className="mt-10 border-t border-[color:var(--rule-color)] pt-7">
          <button type="button" onClick={() => setChecked(true)} className={labTextButton}>
            Check my guess
          </button>
        </div>
      )}

      {checked && (
        <div className="mt-10 border-t border-[color:var(--rule-color)] pt-7">
          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex items-center gap-2 ${labQuietButton}`}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Play again
          </button>
        </div>
      )}

      <LabDetails heading="Notes and sources" summary="Where these figures come from.">
        <p className="max-w-[720px] text-[1rem] leading-[1.7] text-[color:var(--text-body-rgb)]">
          Data sourced and aggregated from Department of Public Expenditure and Oireachtas
          Parliamentary Budget Office material for 2024.
        </p>
      </LabDetails>
    </LabShell>
  );
}
