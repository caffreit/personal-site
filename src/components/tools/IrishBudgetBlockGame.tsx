"use client";

import { ArrowRight, GripHorizontal, Minus, Plus, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { LabDetails, LabHeader, LabSection, LabShell } from "@/components/labs/LabChrome";
import {
  labFootnote,
  labMicroLabel,
  labPrimaryButton,
  labQuietButton,
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

/**
 * A block is the only thing on the page you are meant to pick up, so it is
 * drawn as a physical object: a solid fill, a hatched grip, and a cast shadow
 * that lifts on hover. Everything else in the lab stays a hairline rule.
 */
const BLOCK_GRIP =
  "pointer-events-none block h-full w-full bg-[repeating-linear-gradient(135deg,transparent_0_3px,rgba(0,0,0,0.22)_3px_4px)]";

/**
 * The empty bay a block came from. Keeping all twenty slots visible means the
 * bank reads as a fixed budget being emptied rather than a shrinking row.
 */
const EMPTY_SLOT =
  "h-9 w-9 border border-dashed border-[color:color-mix(in_srgb,var(--foreground)_18%,transparent)]";

/**
 * Categories need to look like containers, not headings, so each one draws an
 * enclosure the way form fields do elsewhere in the labs. While a block is in
 * hand every zone brightens, and the one under the cursor fills in.
 */
function dropZoneClasses(state: "idle" | "armed" | "active") {
  const base =
    "relative mt-4 flex min-h-[6.75rem] flex-col gap-2 rounded-none border border-dashed p-3 transition-colors";

  if (state === "active") {
    return `${base} border-solid border-[#F4CA16] bg-[color:color-mix(in_srgb,#F4CA16_16%,transparent)]`;
  }
  if (state === "armed") {
    return `${base} border-[#F4CA16] bg-[color:color-mix(in_srgb,#F4CA16_6%,transparent)]`;
  }
  return `${base} border-[color:color-mix(in_srgb,var(--foreground)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--foreground)_3%,transparent)]`;
}

/**
 * Block-sized steppers sit in the drop-zone footer so touch controls rhyme
 * with the pieces themselves instead of adding another row of wide boxes.
 */
const BLOCK_CONTROL =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center border border-[color:color-mix(in_srgb,var(--foreground)_22%,transparent)] text-[color:var(--foreground)] transition-colors hover:border-[#F4CA16] hover:bg-[color:color-mix(in_srgb,#F4CA16_8%,transparent)] disabled:cursor-not-allowed disabled:opacity-35";

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
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [hoverCategoryId, setHoverCategoryId] = useState<string | null>(null);
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

  /** A block is in hand either because it is mid-drag or because it was tapped. */
  const heldBlockId = draggedBlockId ?? selectedBlockId;

  function assignBlockToCategory(blockId: number, categoryId: string) {
    if (checked) return;
    setAllocations((prev) => ({ ...prev, [blockId]: categoryId }));
    setSelectedBlockId(null);
  }

  function returnBlockToBank(blockId: number) {
    if (checked) return;
    setAllocations((prev) => ({ ...prev, [blockId]: null }));
    setSelectedBlockId(null);
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
    setSelectedBlockId(null);
    setHoverCategoryId(null);
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
        intro="Pick up a block and drop it into one of the seven category boxes below. On a touch screen, tap a block to pick it up and tap a box to drop it in."
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
          className="border border-[color:color-mix(in_srgb,var(--foreground)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--foreground)_3%,transparent)] p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <GripHorizontal
              className="h-3.5 w-3.5 text-[color:var(--text-muted)]"
              aria-hidden="true"
            />
            <span className={labMicroLabel}>
              {remainingBlocks > 0 ? "Drag or tap a block" : "All blocks allocated"}
            </span>
          </div>

          <div className="flex flex-wrap content-start items-start gap-2">
            {BLOCK_IDS.map((blockId) =>
              allocations[blockId] === null ? (
                <button
                  key={blockId}
                  type="button"
                  draggable={!checked}
                  onDragStart={() => setDraggedBlockId(blockId)}
                  onDragEnd={() => {
                    setDraggedBlockId(null);
                    setHoverCategoryId(null);
                  }}
                  onClick={() =>
                    setSelectedBlockId((prev) => (prev === blockId ? null : blockId))
                  }
                  disabled={checked}
                  aria-pressed={selectedBlockId === blockId}
                  aria-label={`Budget block ${blockId + 1}, worth ${BLOCK_PERCENTAGE}% of spending`}
                  className={`h-9 w-9 cursor-grab bg-[#F4CA16] shadow-[2px_2px_0_rgba(0,0,0,0.22)] transition-transform hover:-translate-y-1 active:cursor-grabbing disabled:cursor-not-allowed ${
                    selectedBlockId === blockId
                      ? "-translate-y-1 outline-2 outline-offset-2 outline-[color:var(--foreground)]"
                      : ""
                  }`}
                >
                  <span className={BLOCK_GRIP} />
                </button>
              ) : (
                <span key={blockId} className={EMPTY_SLOT} aria-hidden="true" />
              ),
            )}
          </div>

          <p className={`mt-3 ${labFootnote}`}>
            {selectedBlockId !== null
              ? "Block in hand. Choose a category box below."
              : remainingBlocks === 0
                ? "Check your guess below, or drag a block back up here to change it."
                : `Each block is ${BLOCK_PERCENTAGE}% of all public spending.`}
          </p>
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
          const zoneState =
            hoverCategoryId === category.id && heldBlockId !== null
              ? "active"
              : heldBlockId !== null && !checked
                ? "armed"
                : "idle";

          return (
            <div
              key={category.id}
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

              <div>
                {checked ? (
                  <p className={labMicroLabel}>Your guess</p>
                ) : null}
                <p
                  className={`text-[2.2rem] font-light leading-none tracking-[-0.03em] tabular-nums ${
                    checked && !isCorrect
                      ? "text-[color:var(--text-muted)]"
                      : "text-[color:var(--foreground)]"
                  }`}
                >
                  {userPercentage}%
                </p>
              </div>

              {checked && (
                <div
                  className={`mt-4 border-l-2 pl-4 ${
                    isCorrect
                      ? "border-emerald-600 dark:border-emerald-400"
                      : "border-[#F4CA16]"
                  }`}
                >
                  <p
                    className={`font-mono text-[0.62rem] uppercase tracking-[0.18em] ${
                      isCorrect
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-[color:var(--foreground)]"
                    }`}
                  >
                    {isCorrect ? "Spot on" : "True spend"}
                  </p>
                  <p className="mt-1.5 text-[2.2rem] font-light leading-none tracking-[-0.03em] tabular-nums text-[color:var(--foreground)]">
                    {roundedPercent(category.correctPercentage)}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleInfo(category.id)}
                    className={`mt-4 ${labQuietButton}`}
                  >
                    {isInfoOpen ? "Hide info" : "More info"}
                  </button>
                  {isInfoOpen && (
                    <p className={`mt-3 ${labFootnote}`}>{category.info}</p>
                  )}
                </div>
              )}

              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setHoverCategoryId(category.id);
                }}
                onDragLeave={() =>
                  setHoverCategoryId((prev) => (prev === category.id ? null : prev))
                }
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedBlockId !== null) {
                    assignBlockToCategory(draggedBlockId, category.id);
                  }
                  setDraggedBlockId(null);
                  setHoverCategoryId(null);
                }}
                onClick={() => {
                  if (selectedBlockId !== null) {
                    assignBlockToCategory(selectedBlockId, category.id);
                  }
                }}
                className={dropZoneClasses(zoneState)}
                aria-label={`${category.name} drop zone, ${count} of ${TOTAL_BLOCKS} blocks`}
              >
                <div className="relative flex min-h-[4.25rem] flex-1 flex-wrap content-start gap-2">
                  {count === 0 && (
                    <span
                      className={`pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-center ${labMicroLabel}`}
                    >
                      {zoneState === "idle"
                        ? "Drop blocks here"
                        : `Add to ${category.shortLabel ?? category.name}`}
                    </span>
                  )}
                  {assignedBlockIds.map((blockId) => (
                    <button
                      key={blockId}
                      type="button"
                      draggable={!checked}
                      onDragStart={(event) => {
                        event.stopPropagation();
                        setDraggedBlockId(blockId);
                      }}
                      onDragEnd={() => {
                        setDraggedBlockId(null);
                        setHoverCategoryId(null);
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        returnBlockToBank(blockId);
                      }}
                      disabled={checked}
                      style={{ background: category.color }}
                      className="h-9 w-9 cursor-grab shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-70"
                      aria-label={`Return block ${blockId + 1} from ${category.name} to your blocks`}
                      title="Click to send this block back"
                    >
                      <span className={BLOCK_GRIP} />
                    </button>
                  ))}
                </div>

                {!checked && (
                  <div className="flex items-center gap-2 border-t border-[color:color-mix(in_srgb,var(--foreground)_10%,transparent)] pt-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        addBlockViaButton(category.id);
                      }}
                      disabled={remainingBlocks === 0}
                      className={BLOCK_CONTROL}
                      aria-label={`Add a block to ${category.name}`}
                      title="Add block"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeBlockViaButton(category.id);
                      }}
                      disabled={count === 0}
                      className={BLOCK_CONTROL}
                      aria-label={`Remove a block from ${category.name}`}
                      title="Remove block"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {remainingBlocks === 0 && !checked && (
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t-2 border-[#F4CA16] pt-7">
          <button
            type="button"
            onClick={() => setChecked(true)}
            className={`${labPrimaryButton} w-full sm:w-auto`}
          >
            Check my guess
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <p className={labFootnote}>
            All 20 blocks are allocated. Reveal how your guess compares to the published figures.
          </p>
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
