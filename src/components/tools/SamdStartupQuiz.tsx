"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, RotateCcw } from "lucide-react";

type ArchetypeKey =
  | "mature"
  | "algorithm"
  | "regulatoryLater"
  | "clinicianLoop"
  | "datasetGoblin"
  | "platform";

type Archetype = {
  title: string;
  summary: string;
  strengths: string[];
  risks: string[];
  blueBridgeHelp: string[];
};

type QuizAnswer = {
  text: string;
  type: ArchetypeKey;
  points: number;
  feedback: string;
};

type QuizQuestion = {
  label: string;
  prompt: string;
  answers: QuizAnswer[];
};

type ScoreMap = Record<ArchetypeKey, number>;

const CONTACT_EMAIL = "hello@bluebridgetech.ie";

const INITIAL_SCORES: ScoreMap = {
  mature: 0,
  algorithm: 0,
  regulatoryLater: 0,
  clinicianLoop: 0,
  datasetGoblin: 0,
  platform: 0,
};

const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  mature: {
    title: "The Actually Pretty Mature Startup",
    summary:
      "Annoyingly impressive. You have a defined intended use, a plausible validation strategy, an emerging QMS, and enough evidence discipline that a regulatory conversation might not become performance art.",
    strengths: [
      "You understand claims, users, and clinical context.",
      "You are thinking about evidence before the pivotal study.",
      "Your risk controls are not just a warning label and good vibes.",
    ],
    risks: [
      "You may still need to right-size the QMS as the product matures.",
      "Subgroup performance, ground truth, and update controls can still trip you up.",
      "Do not confuse prepared with done. FDA has follow-up questions.",
    ],
    blueBridgeHelp: [
      "Stress-test your pre-sub strategy before the questions go to FDA.",
      "Pressure-check validation plans, claims, and risk controls against each other.",
      "Turn a strong evidence base into a clean, reviewer-friendly story.",
    ],
  },
  algorithm: {
    title: "The 'It's Just an Algorithm' Startup",
    summary:
      "You have a clever model, a beautiful demo, and an understandable desire for everyone to stop asking awkward questions about intended use, risk classification, and validation evidence.",
    strengths: [
      "The technical core may be genuinely strong.",
      "You can probably iterate quickly.",
      "You have enough signal to make the product worth formalising.",
    ],
    risks: [
      "The model is not the product. The clinical claim is the product.",
      "An algorithm without a locked use case becomes a regulatory fog machine.",
      "Validation cannot be retrofitted from vibes and a notebook.",
    ],
    blueBridgeHelp: [
      "Translate the model into a defined SaMD product and intended use.",
      "Clarify claim boundaries, risk controls, and requirements.",
      "Build a validation path that supports the product, not just the demo.",
    ],
  },
  regulatoryLater: {
    title: "The 'Regulatory Later' Startup",
    summary:
      "You are moving fast. Unfortunately, some of the things you are moving fast past are design controls, requirements, risk management, and evidence that someone will eventually ask to see.",
    strengths: [
      "You are pragmatic and delivery-focused.",
      "You are not overburdened by bureaucracy yet.",
      "You may still have time to fix the foundations before they fossilise.",
    ],
    risks: [
      "Uncontrolled decisions become expensive memories.",
      "Pilots quietly turn into evidence-generating studies without the right controls.",
      "The phrase 'we'll document it later' has a very poor survival rate.",
    ],
    blueBridgeHelp: [
      "Put a right-sized QMS spine in place without slowing the team down.",
      "Capture decisions, requirements, risks, and changes before they fossilise.",
      "Turn pilots into useful evidence instead of documentation archaeology.",
    ],
  },
  clinicianLoop: {
    title: "The 'Clinician-in-the-Loop' Startup",
    summary:
      "Your regulatory strategy includes the phrase 'the clinician makes the final decision' approximately every 90 seconds. This may be relevant. It is not a magic spell.",
    strengths: [
      "You are aware that human oversight matters.",
      "You may have a safer claim boundary than a fully autonomous product.",
      "You probably have useful clinical advisors.",
    ],
    risks: [
      "The loop needs to be defined, tested, and validated.",
      "Clinicians can misuse, over-trust, ignore, or misunderstand outputs.",
      "Human factors, risk controls, and output interpretation still matter.",
    ],
    blueBridgeHelp: [
      "Map the clinical workflow and define the AI boundary clearly.",
      "Test what clinicians see, understand, trust, ignore, and act on.",
      "Turn clinician-in-the-loop into a real risk control argument.",
    ],
  },
  datasetGoblin: {
    title: "The Dataset Goblin Startup",
    summary:
      "You have data. Lots of data. Some of it is labelled. Some of it is probably useful. Some of it may have been exported by someone called Dave in 2021 and nobody wants to ask too many questions.",
    strengths: [
      "You understand that AI quality depends on data quality.",
      "You may have a meaningful data moat.",
      "There is probably enough raw material to build a strong evidence story.",
    ],
    risks: [
      "Data provenance, consent, subgroup coverage, and label quality need daylight.",
      "Training and validation data need separation, rules, and version control.",
      "Ground truth is not whatever happened in the annotation tool.",
    ],
    blueBridgeHelp: [
      "Clean up data provenance, consent, labelling, and version history.",
      "Define ground truth, subgroup, and dataset lock strategies.",
      "Turn messy data assets into audit-ready validation evidence.",
    ],
  },
  platform: {
    title: "The 'It's a Platform' Startup",
    summary:
      "Your product does triage, diagnosis, workflow optimisation, reporting, prediction, documentation, and possibly coffee. FDA, investors, and customers would all like you to pick a lane.",
    strengths: [
      "You see the broader workflow and commercial opportunity.",
      "You may have multiple future product pathways.",
      "You are not thinking too small.",
    ],
    risks: [
      "A broad platform claim can create a broad regulatory burden.",
      "Validation becomes impossible if the product cannot say what it is.",
      "Every extra use case brings users, risks, data, and evidence needs.",
    ],
    blueBridgeHelp: [
      "Choose the first regulated claim without killing the platform vision.",
      "Separate release boundaries, modules, users, and evidence needs.",
      "Build an evidence path that can expand as the product matures.",
    ],
  },
};

const QUESTIONS: QuizQuestion[] = [
  {
    label: "Question 1",
    prompt: "How would you describe your intended use?",
    answers: [
      {
        text: "It helps clinicians make better decisions.",
        type: "clinicianLoop",
        points: 2,
        feedback:
          "Not wrong, but a bit foggy. FDA will likely want the specific user, patient population, clinical task, and role of the output.",
      },
      {
        text: "We are still exploring use cases because it can do a lot.",
        type: "platform",
        points: 2,
        feedback:
          "Classic platform energy. Useful commercially, dangerous regulatory-wise unless you narrow the first claim.",
      },
      {
        text: "It provides a defined output for a defined user in a defined clinical workflow and population.",
        type: "mature",
        points: 3,
        feedback:
          "Strong. This is the boring-but-powerful answer that makes the rest of the evidence strategy possible.",
      },
      {
        text: "It is mainly an algorithm at this point.",
        type: "algorithm",
        points: 2,
        feedback:
          "The model may be clever, but FDA reviews devices and claims, not just algorithms in the abstract.",
      },
    ],
  },
  {
    label: "Question 2",
    prompt: "What is your current QMS situation?",
    answers: [
      {
        text: "We have a lightweight, right-sized process and are building controls as we mature.",
        type: "mature",
        points: 3,
        feedback:
          "Good. Nobody needs theatre bureaucracy, but you do need decisions, versions, risks, and evidence to survive scrutiny.",
      },
      {
        text: "We'll put that in place after the next pilot.",
        type: "regulatoryLater",
        points: 3,
        feedback:
          "A popular sentence. Also a sentence that often turns one messy pilot into six months of archaeological documentation.",
      },
      {
        text: "We have templates somewhere. I think legal has them.",
        type: "regulatoryLater",
        points: 2,
        feedback:
          "Templates are not a QMS. They are QMS cosplay until people actually use them.",
      },
      {
        text: "We are a software company, so we mostly use Jira and GitHub.",
        type: "algorithm",
        points: 2,
        feedback:
          "Good tools, not automatically design controls. You still need the regulatory spine connecting work to requirements, risks, and evidence.",
      },
    ],
  },
  {
    label: "Question 3",
    prompt: "How was your ground truth established?",
    answers: [
      {
        text: "One expert labelled most of it, then we cleaned obvious issues.",
        type: "datasetGoblin",
        points: 3,
        feedback:
          "Very normal early-stage behaviour. Not necessarily fatal, but you'll need a stronger story for validation.",
      },
      {
        text: "Qualified readers, predefined rules, blinding where relevant, and adjudication for disagreements.",
        type: "mature",
        points: 3,
        feedback:
          "That is the sound of a regulatory reviewer briefly relaxing their shoulders.",
      },
      {
        text: "The clinician users tell us when the output looks right.",
        type: "clinicianLoop",
        points: 2,
        feedback:
          "Clinical input is useful, but 'looks right' is not a reference standard.",
      },
      {
        text: "We are still figuring out whether ground truth is even the right term.",
        type: "datasetGoblin",
        points: 2,
        feedback:
          "Fair. For AI SaMD, though, you need something against which performance can be defended.",
      },
    ],
  },
  {
    label: "Question 4",
    prompt: "Your model performance slide says...",
    answers: [
      {
        text: "Overall accuracy is excellent.",
        type: "algorithm",
        points: 2,
        feedback:
          "Excellent overall performance is great until someone asks what happened in the clinically important subgroup.",
      },
      {
        text: "Performance by subgroup, site, device/vendor, and relevant clinical variables.",
        type: "mature",
        points: 3,
        feedback:
          "Strong. You have moved from demo metrics to evidence metrics.",
      },
      {
        text: "The model performs well, but the dataset is still evolving.",
        type: "datasetGoblin",
        points: 2,
        feedback:
          "Translation: the validation set may still be emotionally available to training. Lock it down.",
      },
      {
        text: "We do not want to overcomplicate the story before fundraising.",
        type: "regulatoryLater",
        points: 2,
        feedback:
          "Understandable. But the complicated story does not vanish; it waits.",
      },
    ],
  },
  {
    label: "Question 5",
    prompt: "What happens when the AI is wrong?",
    answers: [
      {
        text: "The clinician catches it.",
        type: "clinicianLoop",
        points: 3,
        feedback:
          "Maybe. But now you need to show when, how, under what conditions, and with what residual risk.",
      },
      {
        text: "We have mapped failure modes to risk controls and verification/validation evidence.",
        type: "mature",
        points: 3,
        feedback:
          "Excellent. That is exactly where the conversation needs to go.",
      },
      {
        text: "The output is only advisory, so the risk is low.",
        type: "clinicianLoop",
        points: 2,
        feedback:
          "Advisory is not the same as harmless. Bad advice still has a way of being used.",
      },
      {
        text: "We mostly optimise the model until errors become rare.",
        type: "algorithm",
        points: 2,
        feedback:
          "Model improvement helps, but risk management is not just leaderboard climbing.",
      },
    ],
  },
  {
    label: "Question 6",
    prompt: "Your validation dataset is...",
    answers: [
      {
        text: "Locked, versioned, independent, and aligned to the intended use population.",
        type: "mature",
        points: 3,
        feedback: "Beautiful. Slightly suspicious, but beautiful.",
      },
      {
        text: "Mostly separate from training. Apart from the early experiments. And the relabelling. And one emergency fix.",
        type: "datasetGoblin",
        points: 3,
        feedback:
          "The dataset goblin has entered the room. Time for locks, logs, and clean boundaries.",
      },
      {
        text: "Whatever data we can get from the next clinical partner.",
        type: "regulatoryLater",
        points: 2,
        feedback:
          "Useful for exploration, risky for validation unless the plan is defined before the evidence is collected.",
      },
      {
        text: "Not needed yet because we're pre-product.",
        type: "regulatoryLater",
        points: 2,
        feedback:
          "You may not need a pivotal dataset yet, but you do need a validation strategy before the study design hardens.",
      },
    ],
  },
  {
    label: "Question 7",
    prompt: "How do you handle model updates?",
    answers: [
      {
        text: "We retrain when we get better data. That's the whole point of AI.",
        type: "algorithm",
        points: 3,
        feedback:
          "Technically understandable. Regulatorily spicy. Changes need controls, criteria, records, and sometimes fresh validation.",
      },
      {
        text: "We have a change control process, versioning, release criteria, and defined revalidation triggers.",
        type: "mature",
        points: 3,
        feedback:
          "This is the grown-up answer. Not glamorous, but very fundable.",
      },
      {
        text: "The model is part of a broader platform, so updates depend on the module.",
        type: "platform",
        points: 2,
        feedback:
          "That can be reasonable, but each module needs boundaries, impact assessment, and a release story.",
      },
      {
        text: "We avoid talking about updates because it makes the deck longer.",
        type: "regulatoryLater",
        points: 2,
        feedback: "The deck is shorter. The due diligence is not.",
      },
    ],
  },
  {
    label: "Question 8",
    prompt: "Your pitch deck says the product is a platform. What does that mean?",
    answers: [
      {
        text: "A long-term vision, but the first regulated claim is narrow and specific.",
        type: "mature",
        points: 3,
        feedback:
          "Ideal. Big vision, small first claim, expandable evidence path.",
      },
      {
        text: "It can support many clinical workflows depending on the customer.",
        type: "platform",
        points: 3,
        feedback:
          "Commercially tempting. Regulatorily: congratulations, you have created many products in a trench coat.",
      },
      {
        text: "It means the algorithm is general-purpose and adaptable.",
        type: "algorithm",
        points: 2,
        feedback:
          "General-purpose is not automatically a medical device strategy. The claim boundary still matters.",
      },
      {
        text: "It means we have not picked the first use case yet.",
        type: "platform",
        points: 2,
        feedback:
          "Honest. Now pick one before validation becomes interpretive dance.",
      },
    ],
  },
  {
    label: "Question 9",
    prompt:
      "A customer asks for evidence that the product is safe and effective. You send...",
    answers: [
      {
        text: "A polished demo video and three enthusiastic clinician quotes.",
        type: "clinicianLoop",
        points: 2,
        feedback:
          "Good marketing. Not evidence. Although the quotes can live happily in a different folder.",
      },
      {
        text: "A validation report linked to requirements, risks, acceptance criteria, and intended claims.",
        type: "mature",
        points: 3,
        feedback:
          "Lovely. This is how you turn regulatory work into commercial confidence.",
      },
      {
        text: "A performance notebook exported to PDF.",
        type: "algorithm",
        points: 2,
        feedback:
          "A notebook can support the story. It should not be the whole story wearing a lab coat.",
      },
      {
        text: "We say the full evidence pack is under development.",
        type: "regulatoryLater",
        points: 2,
        feedback:
          "Sometimes true. Also sometimes a sign that the evidence strategy started too late.",
      },
    ],
  },
  {
    label: "Question 10",
    prompt: "Your biggest hidden risk is probably...",
    answers: [
      {
        text: "We don't know whether the first claim is narrow enough.",
        type: "platform",
        points: 2,
        feedback:
          "Very plausible. Claim discipline is the startup equivalent of eating vegetables.",
      },
      {
        text: "Our evidence is real but not yet organised into a defensible story.",
        type: "mature",
        points: 2,
        feedback:
          "Common and fixable. This is where traceability, DHF thinking, and pre-sub framing help.",
      },
      {
        text: "Our clinical workflow assumptions are under-tested.",
        type: "clinicianLoop",
        points: 2,
        feedback:
          "Also very plausible. The user does not exist in the slide deck environment.",
      },
      {
        text: "Our data provenance and labelling history are messy.",
        type: "datasetGoblin",
        points: 2,
        feedback:
          "The goblin is honest today. That's good. Now give it a spreadsheet, a lock, and a governance plan.",
      },
    ],
  },
];

function stripThePrefix(title: string) {
  return title.startsWith("The ") ? title.slice(4) : title;
}

export default function SamdStartupQuiz() {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState<ScoreMap>(INITIAL_SCORES);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showResult, setShowResult] = useState(false);

  const activeQuestion = QUESTIONS[current];
  const selectedAnswer =
    selectedIndex === null ? null : activeQuestion.answers[selectedIndex];
  const progressPercent = showResult ? 100 : (current / QUESTIONS.length) * 100;

  const leaderboard = useMemo(
    () =>
      (Object.entries(scores) as [ArchetypeKey, number][]).sort(
        (a, b) => b[1] - a[1],
      ),
    [scores],
  );

  const dominantType = leaderboard[0]?.[0] ?? "mature";
  const runnerUpType = leaderboard[1]?.[0] ?? "algorithm";
  const totalScore = useMemo(
    () => Object.values(scores).reduce((acc, value) => acc + value, 0),
    [scores],
  );
  const dominantPercent =
    totalScore > 0 ? Math.round((scores[dominantType] / totalScore) * 100) : 0;
  const dominantResult = ARCHETYPES[dominantType];

  function handleStart() {
    setCurrent(0);
    setScores(INITIAL_SCORES);
    setSelectedIndex(null);
    setShowResult(false);
    setShowIntro(false);
  }

  function handleRestartToIntro() {
    setCurrent(0);
    setScores(INITIAL_SCORES);
    setSelectedIndex(null);
    setShowResult(false);
    setShowIntro(true);
  }

  function handleSelectAnswer(answerIndex: number) {
    if (selectedIndex !== null) {
      return;
    }

    const answer = activeQuestion.answers[answerIndex];
    setSelectedIndex(answerIndex);
    setScores((prev) => ({
      ...prev,
      [answer.type]: prev[answer.type] + answer.points,
    }));
  }

  function handleNextQuestion() {
    if (selectedIndex === null) {
      return;
    }

    if (current < QUESTIONS.length - 1) {
      setCurrent((prev) => prev + 1);
      setSelectedIndex(null);
      return;
    }

    setShowResult(true);
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
          BBT Demo Quiz - SaMD Edition
        </p>
        <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-stone-900 sm:text-7xl">
          What Kind of SaMD Startup Are You?
        </h1>
        <p className="max-w-4xl text-lg leading-relaxed text-stone-600 sm:text-xl">
          A very scientific personality quiz for AI-enabled medical device teams,
          founders, and anyone who has ever said &quot;we&apos;ll sort regulatory after
          the pilot.&quot;
        </p>
      </header>

      <section
        aria-live="polite"
        className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8"
      >
        {showIntro ? (
          <div>
            <h2 className="text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
              Find your SaMD startup archetype.
            </h2>
            <p className="mt-4 max-w-4xl text-lg leading-relaxed text-stone-600">
              Answer 10 questions about intended use, QMS, ground truth,
              validation, model updates, and claims. The result is only mildly
              offensive and not legally binding.
            </p>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <p className="text-sm leading-relaxed text-stone-600">
                <span className="font-semibold text-stone-900">Internal demo note:</span>{" "}
                This is designed as a prototype for a funny-but-useful BBT article
                or lead-gen quiz. The content can be made sharper, more technical,
                or more founder-friendly later.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {["AI SaMD", "FDA readiness", "QMS maturity", "Ground truth", "Claims strategy"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="pill-control rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600"
                  >
                    <span className="pill-label">{tag}</span>
                  </span>
                ),
              )}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleStart}
                className="pill-control rounded-full bg-stone-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
              >
                <span className="pill-label">Start the quiz</span>
              </button>
            </div>
          </div>
        ) : !showResult ? (
          <div>
            <div className="mb-8 flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
                  {activeQuestion.label}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="pill-control shrink-0 whitespace-nowrap rounded-full bg-stone-100 px-4 py-2 text-sm font-bold text-stone-700">
                <span className="pill-label">{current + 1} of {QUESTIONS.length}</span>
              </div>
            </div>

            <h2 className="mb-6 max-w-5xl text-3xl font-black leading-tight tracking-tight text-stone-900 sm:text-4xl">
              {activeQuestion.prompt}
            </h2>

            <div className="grid gap-3">
              {activeQuestion.answers.map((answer, answerIndex) => {
                const isSelected = selectedIndex === answerIndex;
                const stateClass =
                  selectedIndex === null
                    ? "hover:border-indigo-400"
                    : isSelected
                      ? "border-indigo-300 bg-indigo-50"
                      : "opacity-60";

                return (
                  <button
                    key={answer.text}
                    type="button"
                    disabled={selectedIndex !== null}
                    onClick={() => handleSelectAnswer(answerIndex)}
                    className={`rounded-2xl border border-stone-200 px-4 py-4 text-left text-stone-900 transition ${stateClass}`}
                  >
                    <span className="font-semibold">
                      {String.fromCharCode(65 + answerIndex)}. {answer.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedAnswer ? (
              <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <h3 className="text-lg font-bold tracking-tight text-stone-900">
                  Your answer has been logged by the regulatory goblin.
                </h3>
                <p className="mt-2 leading-relaxed text-stone-600">
                  {selectedAnswer.feedback}
                </p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleRestartToIntro}
                className="pill-control gap-2 rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="pill-label">Restart</span>
              </button>
              <button
                type="button"
                disabled={selectedIndex === null}
                onClick={handleNextQuestion}
                className="pill-control rounded-full bg-stone-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                <span className="pill-label">
                  {current === QUESTIONS.length - 1 ? "See my result" : "Next question"}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
              Your SaMD startup archetype is
            </p>
            <h2 className="mt-3 max-w-5xl text-4xl font-black uppercase leading-[0.95] tracking-tight text-stone-900 sm:text-6xl">
              {dominantResult.title}
            </h2>
            <p className="mt-4 max-w-4xl text-lg leading-relaxed text-stone-600">
              {dominantResult.summary}
            </p>

            <div className="pill-control mt-5 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
              <span className="pill-label">
                Dominant signal: {dominantPercent}% - Runner-up:{" "}
                {stripThePrefix(ARCHETYPES[runnerUpType].title)}
              </span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <h3 className="text-xl font-black tracking-tight text-stone-900">
                  What&apos;s working
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-stone-600">
                  {dominantResult.strengths.map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <h3 className="text-xl font-black tracking-tight text-stone-900">
                  What could bite you later
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-stone-600">
                  {dominantResult.risks.map((risk) => (
                    <li key={risk}>{risk}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-indigo-50 p-5">
                <h3 className="text-xl font-black tracking-tight text-stone-900">
                  What can Blue Bridge do for you?
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-stone-700">
                  {dominantResult.blueBridgeHelp.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                href={`mailto:${CONTACT_EMAIL}?subject=SaMD%20Startup%20Readiness%20Session`}
                className="pill-control gap-2 rounded-full bg-stone-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
              >
                <span className="pill-label">Reach out to BBT</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={handleStart}
                className="pill-control rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
              >
                <span className="pill-label">Take it again</span>
              </button>
              <button
                type="button"
                onClick={handleRestartToIntro}
                className="pill-control gap-2 rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="pill-label">Back to start</span>
              </button>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-stone-500">
              Prototype copy note: for public use, this can be made either more
              founder-friendly and light, or more diagnostic and useful for lead
              capture.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
