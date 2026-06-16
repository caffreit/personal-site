"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

type Stage = {
  title: string;
  joke: string;
  problem: string;
  fix: string;
  bbt: string;
  panic: string;
};

const STAGES: Stage[] = [
  {
    title: "We're too early for a QMS.",
    joke:
      "A beautiful stage. The demo works, the roadmap is exciting, and nobody has yet said the words document control out loud.",
    problem:
      "The team is already making design decisions, selecting tools, changing software, and generating evidence - even if nobody is calling it that yet.",
    fix:
      "Start tiny. Define intended use assumptions, decision logs, version control, basic design inputs, and who approves what.",
    bbt:
      "The goal is not a full enterprise QMS on day one. It is enough structure to stop early decisions becoming archaeological mysteries later.",
    panic: "Low",
  },
  {
    title: "It's just research.",
    joke:
      "The second-most dangerous sentence in medical device development, just behind we'll document it later.",
    problem:
      "Research often becomes the foundation for claims, datasets, algorithms, and validation plans. If it is messy, the mess travels downstream.",
    fix:
      "Separate exploratory work from design-controlled work, and clearly mark when evidence starts being used to support product decisions.",
    bbt:
      "BBT can help draw the boundary between useful scientific exploration and evidence that needs to be controlled, traceable, and defensible.",
    panic: "Low-ish",
  },
  {
    title: "We'll clean this up after the pilot.",
    joke:
      "The pilot is now load-bearing. The spreadsheet has 14 tabs. One tab is called final_final_NEW_use_this_one.",
    problem:
      "Pilots create real-world evidence, user feedback, workflow assumptions, and sometimes de facto product requirements.",
    fix:
      "Before the pilot, define what the pilot is meant to prove, what data will be collected, and what decisions it can and cannot support.",
    bbt:
      "A pilot should not just produce anecdotes. It should produce evidence that maps to intended use, risk, performance, and next development steps.",
    panic: "Medium",
  },
  {
    title: "Wait, is this a design input?",
    joke:
      "A hush falls over the room. Somewhere, a traceability matrix opens one eye.",
    problem:
      "User needs, clinical requirements, technical requirements, and marketing wishes get blurred together until nobody knows what must be verified.",
    fix:
      "Create a simple requirements hierarchy: user needs, design inputs, design outputs, verification, validation, and risk controls.",
    bbt:
      "This is where traceability stops being admin and starts being the map of what your device is actually supposed to do.",
    panic: "Medium",
  },
  {
    title: "Which version did we test?",
    joke:
      "Nobody makes eye contact with the software team. Someone whispers GitHub as if that answers the question.",
    problem:
      "If the tested software, dataset, model, and configuration are not identified, the evidence may not support the released product.",
    fix:
      "Version software builds, datasets, model weights, prompts, test scripts, and configurations. Lock what matters before formal testing.",
    bbt:
      "For AI and SaMD, the product is often a bundle: code, model, data processing, thresholds, UI, prompts, and human workflow. Version all of it.",
    panic: "Rising",
  },
  {
    title: "The clinician liked the demo.",
    joke:
      "Wonderful. Unfortunately, this is not the same thing as clinical validation.",
    problem:
      "Positive expert feedback is useful, but it does not automatically establish performance, usability, safety, or clinical benefit.",
    fix:
      "Turn expert feedback into defined user needs, workflow constraints, acceptance criteria, and study questions.",
    bbt:
      "Clinician enthusiasm is a signal. Regulatory evidence requires a structured argument linking the device output to the intended clinical use.",
    panic: "Rising",
  },
  {
    title: "Can we use the training data for validation?",
    joke: "A regulatory person somewhere feels a disturbance in the Force.",
    problem:
      "Validation needs to test generalisation. Reusing training or tuning data can inflate performance and weaken the regulatory argument.",
    fix:
      "Define independent validation data, subgroup plans, lock rules, inclusion/exclusion criteria, and ground truth methods early.",
    bbt:
      "For AI-enabled devices, the dataset strategy is part of the product strategy. It shapes claims, evidence, risk controls, and FDA questions.",
    panic: "High",
  },
  {
    title: "Do we have a risk file?",
    joke:
      "Yes. It is either empty, outdated, or spiritually represented by a slide titled Safety.",
    problem:
      "Risks are often discussed informally but not linked to requirements, mitigations, verification, validation, usability, or post-market monitoring.",
    fix:
      "Build a living risk file. Keep hazards, hazardous situations, harms, controls, verification, and residual risk connected.",
    bbt:
      "Risk management is not a separate document swamp. It is the backbone connecting what could go wrong to how the product is designed and tested.",
    panic: "High",
  },
  {
    title: "The investor asked about FDA clearance.",
    joke:
      "Suddenly, timelines become real. The phrase regulatory pathway enters the board deck wearing a tiny hard hat.",
    problem:
      "Commercial timelines often assume regulatory work is a final checkpoint rather than a development strategy.",
    fix:
      "Clarify classification, predicate/novelty questions, claims, evidence gaps, and whether a pre-sub would reduce uncertainty.",
    bbt:
      "The earlier the regulatory path is shaped, the less likely the team is to build evidence for the wrong claim or the wrong device boundary.",
    panic: "Board-level",
  },
  {
    title: "The customer asked about our QMS.",
    joke:
      "Procurement has entered the chat. They are holding a supplier questionnaire and they are not smiling.",
    problem:
      "Customers, partners, and enterprise buyers may need assurance long before formal clearance, especially for clinical pilots and data access.",
    fix:
      "Prepare lightweight but credible quality, security, supplier, data governance, and change control materials.",
    bbt:
      "A right-sized QMS can support sales as well as compliance: it gives partners confidence that the team is not improvising with patient data and clinical workflows.",
    panic: "Commercial",
  },
  {
    title: "We should probably talk to FDA.",
    joke:
      "Correct. Ideally before the validation study, not after it has become a historical artefact.",
    problem:
      "Teams often seek feedback after major decisions are already locked, making FDA questions more expensive to answer.",
    fix:
      "Use pre-sub strategically: ask focused questions about intended use, validation design, ground truth, subgroups, and performance endpoints.",
    bbt:
      "A good pre-sub package is not just a meeting request. It is a structured argument that helps FDA give useful feedback.",
    panic: "Useful panic",
  },
  {
    title: "Okay, we need a right-sized QMS.",
    joke:
      "Acceptance. Growth. A controlled template appears. Someone says traceability and nobody leaves the room.",
    problem:
      "The danger is overcorrecting into heavy bureaucracy that slows the team without improving evidence quality.",
    fix:
      "Build the minimum effective system: clear roles, controlled documents, design controls, risk management, software lifecycle, suppliers, change control, and evidence traceability.",
    bbt:
      "The point is not paperwork. The point is making the product defensible: the right claim, the right evidence, the right controls, at the right time.",
    panic: "Constructive",
  },
];

export default function SamdQmsStages() {
  const [current, setCurrent] = useState(0);
  const activeStage = STAGES[current];

  const progressPercent = useMemo(
    () => ((current + 1) / STAGES.length) * 100,
    [current],
  );

  const onPrevious = () => {
    setCurrent((prev) => Math.max(0, prev - 1));
  };

  const onNext = () => {
    setCurrent((prev) => (prev === STAGES.length - 1 ? 0 : prev + 1));
  };

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

      <header className="mb-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white/90 p-8 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)]">
          <p className="pill-control mb-4 rounded-full bg-indigo-50 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
            <span className="pill-label">BBT demo concept - interactive listicle</span>
          </p>
          <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-tight text-stone-900 sm:text-6xl">
            The 12 Stages of Realising You Need a QMS
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-stone-600">
            A lightly painful journey from we are too early for process to maybe
            our evidence, decisions, risks, and software versions should survive
            contact with reality.
          </p>
        </div>

        <aside className="rounded-[2rem] border border-stone-200 bg-white/90 p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)]">
          <h2 className="text-2xl font-black tracking-tight text-stone-900">
            Progress through the regulatory grief cycle
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Click through each stage to see the joke, the actual issue, and the
            saner move.
          </p>

          <div className="mt-6">
            <div
              className="h-3 overflow-hidden rounded-full border border-stone-200 bg-stone-100"
              aria-label="progress"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-400 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-2xl font-black tracking-tight text-stone-900">
                  {current + 1}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Current stage
                </p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-2xl font-black tracking-tight text-stone-900">
                  {activeStage.panic}
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Panic level
                </p>
              </div>
            </div>
          </div>
        </aside>
      </header>

      <section className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <nav
          className="h-fit rounded-[2rem] border border-stone-200 bg-white p-4 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] lg:sticky lg:top-6"
          aria-label="Stages"
        >
          <h3 className="mb-3 px-2 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
            Stages
          </h3>
          <div className="space-y-1">
            {STAGES.map((stage, idx) => (
              <button
                key={stage.title}
                type="button"
                onClick={() => setCurrent(idx)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left text-sm transition ${
                  idx === current
                    ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                    : "border-transparent text-stone-700 hover:bg-stone-100"
                }`}
              >
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    idx === current
                      ? "bg-indigo-600 text-white"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="line-clamp-2">{stage.title}</span>
              </button>
            ))}
          </div>
        </nav>

        <article className="flex min-h-[54rem] flex-col rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-indigo-700">
            Stage {current + 1} of {STAGES.length}
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-stone-900 sm:text-5xl">
            {activeStage.title}
          </h2>
          <div className="mt-4 flex-1">
            <p className="rounded-2xl border border-stone-200 bg-stone-50 px-5 py-4 text-lg leading-relaxed text-stone-700">
              {activeStage.joke}
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-rose-700">
                  The actual problem
                </h3>
                <p className="mt-2 leading-relaxed text-stone-700">
                  {activeStage.problem}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-700">
                  The saner move
                </h3>
                <p className="mt-2 leading-relaxed text-stone-700">
                  {activeStage.fix}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone-800">
                BBT translation
              </h3>
              <p className="mt-2 leading-relaxed text-stone-700">
                {activeStage.bbt}
              </p>
            </div>

            <div
              className={`mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 ${
                current === STAGES.length - 1 ? "block" : "hidden"
              }`}
            >
              <h3 className="text-2xl font-black tracking-tight text-stone-900">
                You have reached acceptance.
              </h3>
              <p className="mt-2 leading-relaxed text-stone-700">
                A right-sized QMS is not bureaucracy cosplay. It is the operating
                system that keeps intended use, risk, requirements, software,
                evidence, and regulatory claims connected before the expensive
                questions arrive.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-5">
            <button
              type="button"
              onClick={onPrevious}
              disabled={current === 0}
              className="pill-control rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="pill-label">Previous</span>
            </button>

            <button
              type="button"
              onClick={onNext}
              className="pill-control rounded-full bg-stone-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
            >
              <span className="pill-label">
                {current === STAGES.length - 1 ? "Restart" : "Next stage"}
              </span>
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
