"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, RotateCcw } from "lucide-react";

type QuizAnswer = {
  text: string;
  score: number;
  feedback: string;
};

type QuizQuestion = {
  scenario: string;
  prompt: string;
  answers: QuizAnswer[];
};

type QuizResult = {
  badge: string;
  title: string;
  text: string;
  risk: string;
  intervention: string;
  takeaways: string[];
};

const CONTACT_EMAIL = "hello@bluebridgetech.ie";

const QUESTIONS: QuizQuestion[] = [
  {
    scenario: "The meeting opens politely. Too politely.",
    prompt: "FDA asks: what exactly does your AI output do in the clinical workflow?",
    answers: [
      {
        text: "It assists clinicians and improves decision-making.",
        score: 0,
        feedback:
          "Not wrong, but too foggy. FDA will likely ask what task, what user, what population, and what decision the output supports.",
      },
      {
        text: "It provides a segmentation used by radiologists to support measurement of X in population Y.",
        score: 1,
        feedback:
          "Good. Specific output, specific user, specific clinical task. Everyone exhales slightly.",
      },
      {
        text: "It depends on the customer configuration.",
        score: 0,
        feedback:
          "A brave choice. Also a dangerous one. Configurable claims still need clear boundaries.",
      },
      {
        text: "It is an end-to-end clinical intelligence platform.",
        score: -1,
        feedback: "FDA has now opened a second notebook.",
      },
    ],
  },
  {
    scenario:
      "The written feedback mentioned ground truth. You hoped they had forgotten. They had not.",
    prompt: "FDA asks how your reference standard was established. You say:",
    answers: [
      {
        text: "An expert labelled the data.",
        score: 0,
        feedback:
          "A start, but not enough. Who was the expert? Were they independent? Blinded? What happened when readers disagreed?",
      },
      {
        text: "Qualified independent readers, blinded to AI output, using predefined adjudication rules.",
        score: 1,
        feedback:
          "Strong answer. This sounds like a reference standard, not just someone clicking things in a hurry.",
      },
      {
        text: "The labels came from routine clinical practice.",
        score: 0,
        feedback:
          "Possibly usable, but you need to explain variability, quality control, missingness, and whether routine labels support your claim.",
      },
      {
        text: "The model agreed with itself on repeat runs.",
        score: -1,
        feedback: "Philosophically bold. Regulatorily tragic.",
      },
    ],
  },
  {
    scenario:
      "Someone says the word 'subgroups'. The data scientist looks at the table they had hoped not to share.",
    prompt: "FDA asks whether performance holds across relevant patient subgroups. Best answer?",
    answers: [
      {
        text: "Overall performance was excellent.",
        score: 0,
        feedback:
          "Overall performance is good news, but it does not answer the subgroup question.",
      },
      {
        text: "We do not expect subgroup differences because the model is general.",
        score: -1,
        feedback: "This is more of a wish than an analysis.",
      },
      {
        text: "We predefined clinically relevant subgroups and assessed performance against acceptance criteria.",
        score: 1,
        feedback:
          "Exactly. Define the subgroups before the meeting, not during the meeting.",
      },
      {
        text: "The dataset is pretty diverse.",
        score: 0,
        feedback:
          "Possibly true, but FDA will want to know how diverse, by what variables, and whether performance changes.",
      },
    ],
  },
  {
    scenario:
      "The model was updated last week. This information has reached regulatory via vibes.",
    prompt: "FDA asks which software/model version was validated. You respond:",
    answers: [
      {
        text: "The current version, more or less.",
        score: -1,
        feedback: "The phrase 'more or less' has just injured the validation report.",
      },
      {
        text: "The locked release candidate, with code, model weights, data version, and test environment controlled.",
        score: 1,
        feedback:
          "Yes. Validation evidence needs to point to a controlled thing, not a moving target.",
      },
      {
        text: "The latest model is better, so we used that.",
        score: 0,
        feedback:
          "Better may be true, but changed models require controlled change assessment and updated evidence.",
      },
      {
        text: "Engineering has the details.",
        score: 0,
        feedback:
          "They may. But the pre-sub team should also know the version story.",
      },
    ],
  },
  {
    scenario:
      "FDA asks what happens when the AI is wrong. Someone starts to say 'the clinician will catch it'. Time slows down.",
    prompt: "What is the best answer?",
    answers: [
      {
        text: "The clinician remains responsible for the final decision.",
        score: 0,
        feedback:
          "Often relevant, but not a complete risk control by itself.",
      },
      {
        text: "We mapped foreseeable failure modes to harms, risk controls, user information, and validation evidence.",
        score: 1,
        feedback:
          "Good. This turns 'clinician-in-the-loop' from a magic phrase into an actual risk argument.",
      },
      {
        text: "The AI is advisory only, so the risk is low.",
        score: 0,
        feedback:
          "Advisory is not the same as harmless. Bad advice can still influence clinical decisions.",
      },
      {
        text: "The model is highly accurate.",
        score: 0,
        feedback:
          "Accuracy helps, but risk management still needs failure modes, severity, detectability, and controls.",
      },
    ],
  },
  {
    scenario:
      "The validation plan appears on screen. It has confidence intervals. Everyone is pleased for seven seconds.",
    prompt: "FDA asks why your acceptance criteria are clinically meaningful. You say:",
    answers: [
      {
        text: "They are based on what our model can currently achieve.",
        score: -1,
        feedback:
          "This is a performance description, not a clinical justification.",
      },
      {
        text: "They were derived from clinical use, comparator performance, reader variability, and the risk analysis.",
        score: 1,
        feedback:
          "Good. Acceptance criteria should connect to use, not just model ambition.",
      },
      {
        text: "They are similar to another paper we found.",
        score: 0,
        feedback:
          "A useful input maybe, but not sufficient unless the context and claim really match.",
      },
      {
        text: "We chose round numbers for clarity.",
        score: -1,
        feedback: "Clean. Memorable. Deeply alarming.",
      },
    ],
  },
  {
    scenario:
      "FDA notices your product includes AI, deterministic logic, UI rules, and a clinician decision. They ask where the device claim starts and ends.",
    prompt: "Best answer?",
    answers: [
      {
        text: "The whole workflow is improved by AI.",
        score: 0,
        feedback:
          "Too broad. FDA will want to know what part is AI, what part is software logic, and what part is user judgment.",
      },
      {
        text: "We have a workflow diagram showing AI output, downstream logic, user actions, and claim boundaries.",
        score: 1,
        feedback:
          "Excellent. Boundaries make the claim, validation, and risk argument much easier to discuss.",
      },
      {
        text: "The clinician makes the diagnosis, so the device does not really make a claim.",
        score: -1,
        feedback:
          "If the product output influences care, you still need to define and support the claim.",
      },
      {
        text: "We avoid the word diagnosis in marketing.",
        score: 0,
        feedback:
          "Helpful, but wording alone does not define intended use.",
      },
    ],
  },
  {
    scenario:
      "Final question. Everyone can see the end of the meeting. FDA asks what you want feedback on.",
    prompt: "What is the strongest pre-sub question?",
    answers: [
      {
        text: "Do you agree our device is safe and effective?",
        score: -1,
        feedback:
          "Too broad. Also not really how pre-sub feedback works.",
      },
      {
        text: "Do you agree that our proposed validation design, including population, reference standard, endpoints, and subgroup plan, is appropriate to support the intended use?",
        score: 1,
        feedback:
          "Strong. Specific enough to get useful feedback, broad enough to cover the core evidence strategy.",
      },
      {
        text: "What should we do?",
        score: 0,
        feedback:
          "Understandable, but too open-ended. Pre-sub questions work best when they ask FDA to react to a concrete proposal.",
      },
      {
        text: "Can we reduce the validation study size?",
        score: 0,
        feedback:
          "Maybe, but you need a rationale. FDA is unlikely to reward vibes-based sample size reduction.",
      },
    ],
  },
];

const REFERENCE_LINKS = [
  {
    label: "FDA Q-Submission Program",
    href: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/requests-feedback-and-meetings-medical-device-submissions-q-submission-program",
  },
  {
    label: "FDA SaMD Clinical Evaluation",
    href: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/software-device-samd-clinical-evaluation",
  },
];

function getResult(score: number): QuizResult {
  if (score >= 7) {
    return {
      badge: "Pre-sub survivor",
      title: "You survived the meeting.",
      text: "You brought a defined intended use, a defensible reference standard, controlled validation evidence, and actual questions. Suspiciously competent.",
      risk: "Low",
      intervention: "Targeted review",
      takeaways: [
        "Polish the written questions so FDA can give actionable feedback.",
        "Make sure the validation plan, risk file, and claims all tell the same story.",
        "Keep versioning and dataset locks painfully clear.",
      ],
    };
  }

  if (score >= 4) {
    return {
      badge: "Meeting survived, plan wounded",
      title: "You made it out, but your validation plan needs a lie-down.",
      text: "You have the right instincts, but a few answers are still too broad, too hopeful, or too dependent on the phrase 'clinician-in-the-loop.'",
      risk: "Medium",
      intervention: "Readiness sprint",
      takeaways: [
        "Tighten intended use, claim boundaries, and AI workflow diagrams.",
        "Predefine subgroup analysis and acceptance criteria.",
        "Turn ground truth from 'expert labels' into a documented reference standard.",
      ],
    };
  }

  if (score >= 2) {
    return {
      badge: "Traceability goblin alert",
      title: "You need a traceability matrix and a quiet room.",
      text: "There is probably a good product in here, but the regulatory story is still scattered across slides, chat threads, and someone's memory.",
      risk: "High",
      intervention: "Structured rescue",
      takeaways: [
        "Define intended use before expanding features or claims.",
        "Map risks to controls, validation endpoints, and user information.",
        "Lock down the version/data story before pivotal validation.",
      ],
    };
  }

  return {
    badge: "Pre-sub chaos mode",
    title: "FDA has requested a second notebook.",
    text: "The meeting may still be useful, but mostly as a diagnostic experience. The current story is too vague to support meaningful feedback.",
    risk: "Very high",
    intervention: "Full regulatory reset",
    takeaways: [
      "Pick a narrow intended use and define the device boundary.",
      "Build a reference standard strategy before collecting validation data.",
      "Create a right-sized QMS spine so decisions, evidence, and changes are controlled.",
    ],
  };
}

export default function SamdFdaPreSubQuiz() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const activeQuestion = QUESTIONS[index];
  const isAnswered = selectedIndex !== null;
  const selectedAnswer = selectedIndex === null ? null : activeQuestion.answers[selectedIndex];
  const result = useMemo(() => getResult(score), [score]);
  const maxScore = QUESTIONS.length;

  const progressPercent = showResult
    ? 100
    : (index / QUESTIONS.length) * 100;

  const feedbackTitle = (() => {
    if (!selectedAnswer) {
      return "";
    }
    if (selectedAnswer.score === 1) {
      return "You may proceed. FDA has not yet deployed the eyebrow.";
    }
    if (selectedAnswer.score === 0) {
      return "Survivable, but expect follow-up questions.";
    }
    return "A regulatory person just aged three months.";
  })();

  function handleChooseAnswer(answerIndex: number) {
    if (isAnswered) {
      return;
    }
    setSelectedIndex(answerIndex);
    setScore((prev) => prev + activeQuestion.answers[answerIndex].score);
  }

  function handleNext() {
    if (!isAnswered) {
      return;
    }
    if (index < QUESTIONS.length - 1) {
      setIndex((prev) => prev + 1);
      setSelectedIndex(null);
      return;
    }
    setShowResult(true);
  }

  function handleRestart() {
    setIndex(0);
    setScore(0);
    setSelectedIndex(null);
    setShowResult(false);
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
          BBT Demo Concept • Interactive Article
        </p>
        <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-stone-900 sm:text-7xl">
          BBT: Can You Survive an FDA Pre-Sub Meeting?
        </h1>
        <p className="max-w-4xl text-lg leading-relaxed text-stone-600 sm:text-xl">
          You have an AI-enabled SaMD product, one hour with FDA, and a validation
          plan held together by optimism. Choose wisely.
        </p>
      </header>

      <section
        aria-live="polite"
        className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8"
      >
        <div className="mb-8 flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
              {showResult
                ? "Quiz Complete"
                : `Question ${index + 1} of ${QUESTIONS.length}`}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-emerald-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="pill-control shrink-0 whitespace-nowrap rounded-full bg-stone-100 px-4 py-2 text-sm font-bold text-stone-700">
            <span className="pill-label">Score: {score}</span>
          </div>
        </div>

        {!showResult ? (
          <div>
            <p className="mb-5 max-w-3xl rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 font-serif text-lg italic leading-relaxed text-stone-700 sm:text-xl">
              {activeQuestion.scenario}
            </p>
            <h2 className="mb-6 text-3xl font-black leading-tight tracking-tight text-stone-900 sm:text-4xl">
              {activeQuestion.prompt}
            </h2>

            <div className="grid gap-3">
              {activeQuestion.answers.map((answer, answerIndex) => {
                const isSelected = selectedIndex === answerIndex;
                const stateClass = !isAnswered
                  ? "hover:border-yellow-500"
                  : answer.score === 1
                    ? "border-emerald-300 bg-emerald-50"
                    : isSelected
                      ? "border-rose-300 bg-rose-50"
                      : "opacity-60";

                return (
                  <button
                    key={answer.text}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleChooseAnswer(answerIndex)}
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
                  {feedbackTitle}
                </h3>
                <p className="mt-2 leading-relaxed text-stone-600">
                  {selectedAnswer.feedback}
                </p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleRestart}
                className="pill-control gap-2 rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="pill-label">Restart</span>
              </button>
              <button
                type="button"
                disabled={!isAnswered}
                onClick={handleNext}
                className="pill-control rounded-full bg-stone-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                <span className="pill-label">
                  {index === QUESTIONS.length - 1 ? "See Result" : "Next"}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <span className="pill-control rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
              <span className="pill-label">{result.badge}</span>
            </span>
            <h2 className="mt-4 text-4xl font-black uppercase leading-[0.95] tracking-tight text-stone-900 sm:text-6xl">
              {result.title}
            </h2>
            <p className="mt-4 max-w-4xl text-lg leading-relaxed text-stone-600">
              {result.text}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 p-4">
                <p className="text-3xl font-black tracking-tight text-stone-900">
                  {score}/{maxScore}
                </p>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Final Score
                </p>
              </div>
              <div className="rounded-2xl border border-stone-200 p-4">
                <p className="text-3xl font-black tracking-tight text-stone-900">
                  {result.risk}
                </p>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Meeting Risk
                </p>
              </div>
              <div className="rounded-2xl border border-stone-200 p-4">
                <p className="text-3xl font-black tracking-tight text-stone-900">
                  {result.intervention}
                </p>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                  BBT Intervention
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-xl font-black tracking-tight text-stone-900">
                Your pre-sub survival kit
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-stone-600">
                {result.takeaways.map((takeaway) => (
                  <li key={takeaway}>{takeaway}</li>
                ))}
              </ul>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-stone-500">
              Educational prototype only, not regulatory or legal advice. Final
              submissions should align intended use, risk controls, validation evidence,
              and quality system documentation.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                href={`mailto:${CONTACT_EMAIL}?subject=FDA%20Pre-Sub%20Readiness%20Session`}
                className="pill-control gap-2 rounded-full bg-stone-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
              >
                <span className="pill-label">Book a readiness session</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={handleRestart}
                className="pill-control gap-2 rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="pill-label">Try Again</span>
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8">
        <h2 className="text-xl font-black uppercase tracking-tight text-stone-900">
          Notes and Sources
        </h2>
        <p className="mt-3 max-w-4xl leading-relaxed text-stone-600">
          This quiz is intentionally lightweight and satirical in tone, but rooted in
          common FDA pre-submission themes for software medical devices.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {REFERENCE_LINKS.map((source) => (
            <Link
              key={source.href}
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="pill-control gap-2 rounded-full border border-stone-300 bg-stone-50 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-600 hover:text-stone-900"
            >
              <span className="pill-label">{source.label}</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
