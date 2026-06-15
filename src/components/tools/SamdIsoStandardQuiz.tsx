"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, RotateCcw, Share2 } from "lucide-react";

type StandardKey =
  | "qms"
  | "risk"
  | "software"
  | "usability"
  | "clinical"
  | "security";

type StandardResult = {
  code: string;
  title: string;
  subtitle: string;
  description: string;
  strengths: string[];
  risks: string[];
  bbt: string;
  shareHook: string;
  imagePrompt: string;
};

type QuizAnswer = {
  standard: StandardKey;
  label: string;
  note: string;
};

type QuizQuestion = {
  title: string;
  copy: string;
  answers: QuizAnswer[];
};

type ScoreMap = Record<StandardKey, number>;

const CONTACT_EMAIL = "hello@bluebridgetech.ie";
const RESULT_IMAGE_BASE = "/labs/samd-iso-standard-quiz";
const QUIZ_PATH = "/labs/samd-iso-standard-quiz";
const SHARE_PROMPT = 'Take the SaMD "Which ISO Standard Are You?" quiz.';

function resultImageSrc(key: StandardKey) {
  return `${RESULT_IMAGE_BASE}/${key}.png`;
}

const INITIAL_SCORES: ScoreMap = {
  qms: 0,
  risk: 0,
  software: 0,
  usability: 0,
  clinical: 0,
  security: 0,
};

const STANDARDS: Record<StandardKey, StandardResult> = {
  qms: {
    code: "ISO 13485",
    title: "The Process Person",
    subtitle:
      "You believe chaos can be defeated, but only if someone approves the template first.",
    description:
      "You are happiest when responsibilities are clear, documents are controlled, decisions are traceable, and nobody says, 'we will just put it in Slack.' You may not be the loudest person in the room, but you are often the reason the room survives inspection.",
    strengths: [
      "Turns vague activity into repeatable process.",
      "Keeps evidence, approvals, and responsibilities visible.",
      "Knows that 'we did it' is weaker than 'we can prove we did it.'",
    ],
    risks: [
      "Can overbuild process too early.",
      "May accidentally become the blocker if the system is not right-sized.",
      "Occasionally says 'document control' in social settings.",
    ],
    bbt: "Bluebridge gets the person who wants the work to move quickly without turning every future audit into an archaeological dig. If your team needs practical help turning decisions, requirements, and evidence into something defensible, you would be speaking to people who enjoy this stuff more than is strictly normal.",
    shareHook:
      "I got ISO 13485: The Process Person. I do not chase vibes, I chase controlled records.",
    imagePrompt:
      "A calm document-control cathedral, folders glowing like stained glass, medical device startup desk, editorial vector style.",
  },
  risk: {
    code: "ISO 14971",
    title: "The Risk Mystic",
    subtitle:
      "You cannot look at a kettle without identifying three hazards and one reasonably foreseeable misuse.",
    description:
      "You see failure modes hiding in the walls. While others ask whether the product works, you ask what happens when it works incorrectly, too slowly, too confidently, or in the wrong hands. People call this pessimism. You call it risk management.",
    strengths: [
      "Connects hazards, harms, risk controls, and evidence.",
      "Prevents 'the clinician will notice' from becoming the entire safety strategy.",
      "Makes teams think before validation, not after.",
    ],
    risks: [
      "Can make every meeting feel like a haunted house.",
      "May struggle to stop identifying edge cases.",
      "Has strong opinions about residual risk acceptability.",
    ],
    bbt: "Bluebridge gets the person who hears a confident product claim and immediately wants to know how it could hurt someone. If your team needs help making the risk story coherent before customers, auditors, or regulators start pulling at loose threads, you would be among like-minded hazard spotters.",
    shareHook:
      "I got ISO 14971: The Risk Mystic. Emotionally prepared for every hazard except this quiz result.",
    imagePrompt:
      "A cheerful risk goblin mapping hazards with red string, clinical AI dashboard in background, playful regulatory poster style.",
  },
  software: {
    code: "IEC 62304",
    title: "The Software Realist",
    subtitle:
      "You know the tested thing and the released thing are not automatically the same thing.",
    description:
      "You care about lifecycle, architecture, versioning, SOUP, traceability, change control, and the terrifying phrase 'small model update.' You do not believe software is safe because the demo looked smooth.",
    strengths: [
      "Links requirements to architecture, implementation, testing, and release.",
      "Spots undocumented software dependencies.",
      "Understands why AI updates need controls, not vibes.",
    ],
    risks: [
      "Can become allergic to hand-wavy architecture diagrams.",
      "May say 'configuration management' before coffee.",
      "Will ask which version was validated at the worst possible moment.",
    ],
    bbt: "Bluebridge gets the person quietly asking whether the demo version, validated version, deployed version, and remembered-by-engineering version are actually the same thing. If your software evidence chain is starting to sprawl, we can help untangle it with people who speak fluent lifecycle.",
    shareHook:
      "I got IEC 62304: The Software Realist. If it is not versioned, it did not happen.",
    imagePrompt:
      "A software lifecycle control room with version tags, model weights, test reports, and release gates, clean sci-fi editorial style.",
  },
  usability: {
    code: "IEC 62366",
    title: "The Human Factors Empath",
    subtitle:
      "You know users will not read the manual, will click the wrong button, and will be right to blame the product.",
    description:
      "You care about real use, not ideal use. While others design for a calm expert in a perfect room, you design for interruptions, fatigue, confusing labels, bad defaults, and the eternal mystery of what humans actually do.",
    strengths: [
      "Keeps the intended user and use environment in view.",
      "Finds use errors before they become field complaints.",
      "Makes design safer without pretending training fixes everything.",
    ],
    risks: [
      "May ruin beautiful UI mockups with reality.",
      "Can be difficult to impress with 'intuitive' designs.",
      "Often says 'show me the workflow.'",
    ],
    bbt: "Bluebridge gets the person who knows a technically correct output can still fail in the hands of a tired, interrupted, very real user. If your team needs help making AI outputs safer and clearer inside the actual clinical workflow, you will not have to explain why human factors matter.",
    shareHook:
      "I got IEC 62366: The Human Factors Empath. The user journey is my chosen battlefield.",
    imagePrompt:
      "A human factors lab where tired clinicians interact with a confusing AI UI, warm comic editorial style.",
  },
  clinical: {
    code: "ISO 14155",
    title: "The Clinical Evidence Person",
    subtitle:
      "You enjoy endpoints, protocols, study populations, and asking whether the evidence actually supports the claim.",
    description:
      "You are less interested in the demo and more interested in whether the evidence is valid, representative, clinically meaningful, and collected under a plan that can survive scrutiny. Your superpower is making clinical validation mean something specific.",
    strengths: [
      "Connects claims to endpoints and study design.",
      "Cares about representative populations and subgroup performance.",
      "Asks whether evidence is clinically meaningful, not just statistically attractive.",
    ],
    risks: [
      "Can turn a quick pilot conversation into a protocol discussion.",
      "May use the phrase 'intended use population' repeatedly.",
      "Will not accept 'the clinician liked it' as validation.",
    ],
    bbt: "Bluebridge gets the person who wants the claim, protocol, endpoints, population, and evidence package to line up before anyone starts celebrating the demo. If your team needs help making clinical validation mean something specific, we are very happy to get into the weeds.",
    shareHook:
      "I got ISO 14155: The Clinical Evidence Person. Show me the endpoint table or do not show me anything.",
    imagePrompt:
      "A clinical evidence detective board with endpoints, cohorts, subgroup charts, and protocol notes, polished magazine illustration.",
  },
  security: {
    code: "ISO 27001",
    title: "The Security Goblin",
    subtitle:
      "You ask where the data lives, who has access, what is logged, and why that link is public.",
    description:
      "You trust no shared folder. You want access controls, audit logs, encryption, supplier controls, incident response, and a straight answer on whether patient data ever touched an uncontrolled system. Frankly, you are correct to be suspicious.",
    strengths: [
      "Sees data governance as part of product trust.",
      "Finds access and retention issues early.",
      "Makes AI and LLM use less terrifying to customers.",
    ],
    risks: [
      "Can make casual collaboration feel like a heist movie.",
      "May over-index on controls before data flow is understood.",
      "Has nightmares about copied datasets.",
    ],
    bbt: "Bluebridge gets the person asking where the data lives before the sales deck gets too excited. If your team needs help making AI tooling, data flows, suppliers, and access controls explainable, you would be talking to people who also lose sleep over shared folders.",
    shareHook:
      "I got ISO 27001: The Security Goblin. I lock doors other people did not know existed.",
    imagePrompt:
      "A security goblin guarding patient datasets in a glowing vault, access logs and supplier contracts floating nearby, modern editorial vector style.",
  },
};

const QUESTIONS: QuizQuestion[] = [
  {
    title: "A founder says: 'We are too early for process.'",
    copy: "What do you instinctively say next?",
    answers: [
      {
        standard: "qms",
        label: "Define the lightest process that still leaves evidence.",
        note: "ISO 13485 has entered the chat, carrying a controlled template.",
      },
      {
        standard: "risk",
        label: "What risk does that create later?",
        note: "Classic risk brain. You heard 'too early' and translated it to 'future CAPA seed.'",
      },
      {
        standard: "software",
        label: "Fine, but which version is being tested?",
        note: "You are not against speed. You are against mystery builds.",
      },
      {
        standard: "clinical",
        label: "What evidence is this early work supposed to generate?",
        note: "You are already thinking about whether the pilot will support anything useful.",
      },
    ],
  },
  {
    title: "Your favourite meeting question is...",
    copy: "Pick the one that feels most spiritually correct.",
    answers: [
      {
        standard: "qms",
        label: "Where is that documented?",
        note: "A simple question. A devastating question. A lifestyle.",
      },
      {
        standard: "risk",
        label: "What happens if that assumption is wrong?",
        note: "You brought a torch into the cave of hidden hazards.",
      },
      {
        standard: "usability",
        label: "What does the user actually see?",
        note: "Good. The workflow goblins are usually hiding in the UI.",
      },
      {
        standard: "security",
        label: "Who has access to that data?",
        note: "Everyone was having fun until the permissions audit arrived.",
      },
    ],
  },
  {
    title: "The team says the AI is 'clinician-in-the-loop.'",
    copy: "You immediately want to know...",
    answers: [
      {
        standard: "usability",
        label: "What exactly is shown to the clinician, and when?",
        note: "You know a loop is not a loop unless the human can actually understand and act.",
      },
      {
        standard: "risk",
        label: "Which risks does the clinician control, and which remain?",
        note: "Correct. Clinician-in-the-loop is not a magic spell.",
      },
      {
        standard: "clinical",
        label: "Does the evidence show the clinician performs better with it?",
        note: "You are allergic to unsupported clinical claims. Sensible.",
      },
      {
        standard: "software",
        label: "What part is model output versus deterministic logic?",
        note: "You want the software boundary drawn before it draws blood.",
      },
    ],
  },
  {
    title: "You discover an uncontrolled spreadsheet called final_FINAL_v7_real.xlsx.",
    copy: "Your reaction?",
    answers: [
      {
        standard: "qms",
        label: "This is how civilisations fall.",
        note: "Document control grief is real.",
      },
      {
        standard: "software",
        label: "Was this used as an input to testing or release?",
        note: "You know the spreadsheet may secretly be software. Awkward.",
      },
      {
        standard: "risk",
        label: "What decisions depend on this?",
        note: "You went straight to impact. Excellent and upsetting.",
      },
      {
        standard: "security",
        label: "Where is it stored and who can edit it?",
        note: "You can smell shared-drive chaos from three folders away.",
      },
    ],
  },
  {
    title: "Someone claims the model performs well overall.",
    copy: "What table do you ask for?",
    answers: [
      {
        standard: "clinical",
        label: "Performance by clinically relevant subgroup.",
        note: "Overall performance is where weak subgroup performance goes to hide.",
      },
      {
        standard: "risk",
        label: "Failures mapped to harms and risk controls.",
        note: "You want to know whether errors are merely inaccurate or actually dangerous.",
      },
      {
        standard: "software",
        label: "Performance by model version and configuration.",
        note: "Beautiful. The model is not specific enough for you.",
      },
      {
        standard: "qms",
        label: "The approved validation report.",
        note: "You want the evidence, not the vibes.",
      },
    ],
  },
  {
    title: "A customer asks if you use LLMs internally.",
    copy: "What do you want ready before answering?",
    answers: [
      {
        standard: "security",
        label: "Data flow, retention, access controls, and supplier terms.",
        note: "The Security Goblin is awake, and honestly thank goodness.",
      },
      {
        standard: "qms",
        label: "Approved procedure for when and how AI tools are used.",
        note: "You are not anti-AI. You are pro-controlled-use.",
      },
      {
        standard: "risk",
        label: "A risk assessment by intended use of the AI tool.",
        note: "You know using AI to draft an email is not the same as using it to generate validation evidence.",
      },
      {
        standard: "software",
        label: "Clear boundaries between tooling support and product software.",
        note: "You refuse to let internal automation blur into product claims.",
      },
    ],
  },
  {
    title: "The UI has a warning message that users keep ignoring.",
    copy: "Your instinct is...",
    answers: [
      {
        standard: "usability",
        label: "The design is probably asking the warning to do too much.",
        note: "Exactly. Training and warnings are not duct tape for poor design.",
      },
      {
        standard: "risk",
        label: "Reassess whether the risk control is effective.",
        note: "A control nobody notices is a decorative control.",
      },
      {
        standard: "clinical",
        label: "Check whether this affects clinical decision-making.",
        note: "You want to know whether the ignored warning changes outcomes, not just screenshots.",
      },
      {
        standard: "qms",
        label: "Open an issue and document the investigation.",
        note: "The evidence trail begins before everyone forgets what happened.",
      },
    ],
  },
  {
    title: "Your dream artefact is...",
    copy: "No judgement. Mostly.",
    answers: [
      {
        standard: "qms",
        label: "A clean traceability matrix with no orphan requirements.",
        note: "Some people want yachts. You want rows that reconcile.",
      },
      {
        standard: "risk",
        label: "A risk file where controls actually link to verification evidence.",
        note: "This is the regulatory equivalent of a satisfying click.",
      },
      {
        standard: "software",
        label: "A release package that exactly matches the validated configuration.",
        note: "Version control poetry.",
      },
      {
        standard: "clinical",
        label: "A validation report that supports the claim without overreaching.",
        note: "Rare. Beautiful. Possibly mythical.",
      },
    ],
  },
  {
    title: "The product roadmap says 'platform expansion.'",
    copy: "You are most worried about...",
    answers: [
      {
        standard: "clinical",
        label: "Claims expanding faster than evidence.",
        note: "Platform ambition is fine. Claim sprawl is where things get spicy.",
      },
      {
        standard: "risk",
        label: "New hazards introduced by new uses or users.",
        note: "You know every new workflow comes with new ways to fail.",
      },
      {
        standard: "software",
        label: "Architecture and update controls keeping up.",
        note: "You can already hear the phrase quick patch approaching.",
      },
      {
        standard: "usability",
        label: "Different users interpreting the same output differently.",
        note: "A single UI can become six products if the users and contexts change.",
      },
    ],
  },
];

function rankStandards(scores: ScoreMap, history: StandardKey[]) {
  const entries = Object.entries(scores) as [StandardKey, number][];
  const maxScore = Math.max(...entries.map(([, score]) => score));
  const tiedTop = entries
    .filter(([, score]) => score === maxScore)
    .map(([key]) => key);

  let dominant = tiedTop[0] ?? "qms";
  for (let idx = history.length - 1; idx >= 0; idx -= 1) {
    const key = history[idx];
    if (tiedTop.includes(key)) {
      dominant = key;
      break;
    }
  }

  const sorted = entries
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      for (let idx = history.length - 1; idx >= 0; idx -= 1) {
        if (history[idx] === a[0]) {
          return -1;
        }
        if (history[idx] === b[0]) {
          return 1;
        }
      }
      return 0;
    })
    .map(([key, score]) => ({ key, score }));

  return {
    dominant,
    runnerUp: sorted.find((item) => item.key !== dominant)?.key ?? "risk",
    sorted,
  };
}

function splitBbtCopy(copy: string) {
  const [intro, ...ctaParts] = copy.split(" If your ");
  return {
    intro,
    cta: ctaParts.length > 0 ? `If your ${ctaParts.join(" If your ")}` : copy,
  };
}

export default function SamdIsoStandardQuiz() {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState<ScoreMap>(INITIAL_SCORES);
  const [history, setHistory] = useState<StandardKey[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const activeQuestion = QUESTIONS[current];
  const selectedAnswer =
    selectedIndex === null ? null : activeQuestion.answers[selectedIndex];
  const progressPercent = showResult ? 100 : (current / QUESTIONS.length) * 100;

  const { dominant, sorted } = useMemo(
    () => rankStandards(scores, history),
    [history, scores],
  );

  const dominantResult = STANDARDS[dominant];
  const { intro: bbtIntro, cta: bbtCta } = splitBbtCopy(dominantResult.bbt);
  const totalAnswers = history.length;

  const shareText = useMemo(() => {
    return `${dominantResult.shareHook} ${SHARE_PROMPT}`;
  }, [dominantResult.shareHook]);

  function resetToIntro() {
    setCurrent(0);
    setScores(INITIAL_SCORES);
    setHistory([]);
    setSelectedIndex(null);
    setShowResult(false);
    setShowAllResults(false);
    setShareStatus(null);
    setShowIntro(true);
  }

  function startQuiz() {
    setCurrent(0);
    setScores(INITIAL_SCORES);
    setHistory([]);
    setSelectedIndex(null);
    setShowResult(false);
    setShowAllResults(false);
    setShareStatus(null);
    setShowIntro(false);
  }

  function openAllResults() {
    setShowIntro(false);
    setShowResult(false);
    setShowAllResults(true);
    setShareStatus(null);
  }

  function handleChooseAnswer(answerIndex: number) {
    if (selectedIndex !== null) {
      return;
    }
    const answer = activeQuestion.answers[answerIndex];
    setSelectedIndex(answerIndex);
    setScores((prev) => ({
      ...prev,
      [answer.standard]: prev[answer.standard] + 1,
    }));
    setHistory((prev) => [...prev, answer.standard]);
  }

  function handleNext() {
    if (selectedIndex === null) {
      return;
    }
    if (current < QUESTIONS.length - 1) {
      setCurrent((prev) => prev + 1);
      setSelectedIndex(null);
      setShareStatus(null);
      return;
    }
    setShowResult(true);
  }

  async function handleNativeShare() {
    if (!("share" in navigator)) {
      setShareStatus("Sharing is not available in this browser.");
      return;
    }

    const shareUrl = `${window.location.origin}${QUIZ_PATH}`;
    const shareData: ShareData = {
      title: "Which ISO Standard Are You?",
      text: shareText,
      url: shareUrl,
    };

    try {
      const imageResponse = await fetch(resultImageSrc(dominant));
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], `${dominant}-iso-standard-quiz.png`, {
        type: imageBlob.type || "image/png",
      });

      if (navigator.canShare?.({ files: [imageFile] })) {
        await navigator.share({
          ...shareData,
          files: [imageFile],
        });
      } else {
        await navigator.share(shareData);
      }
      setShareStatus("Shared.");
    } catch {
      setShareStatus("Share was cancelled or unavailable.");
    }
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
          BBT Demo Quiz - SaMD Standards Edition
        </p>
        <h1 className="max-w-5xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-stone-900 sm:text-7xl">
          Which ISO Standard Are You?
        </h1>
        <p className="max-w-4xl text-lg leading-relaxed text-stone-600 sm:text-xl">
          Find out which standard is quietly running your personality, your meetings,
          and probably your Notion workspace.
        </p>
      </header>

      <section
        aria-live="polite"
        className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] sm:p-8"
      >
        {showIntro ? (
          <div>
            <h2 className="text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
              A deeply unserious standards personality quiz.
            </h2>
            <p className="mt-4 max-w-4xl text-lg leading-relaxed text-stone-600">
              Best taken with the colleague who keeps asking where the evidence lives.
              Nine questions. Six standards. One very judgemental result card.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                "ISO 13485",
                "ISO 14971",
                "IEC 62304",
                "IEC 62366",
                "ISO 14155",
                "ISO 27001",
              ].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm leading-relaxed text-amber-800">
                Please do not cite your quiz result in an audit, however tempting.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={startQuiz}
                className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
              >
                Start the quiz
              </button>
              <button
                type="button"
                onClick={openAllResults}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
              >
                Peek at all outcomes
              </button>
            </div>
          </div>
        ) : showAllResults ? (
          <div>
            <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
              Result menu
            </span>
            <h2 className="mt-4 text-4xl font-black uppercase leading-[0.95] tracking-tight text-stone-900 sm:text-6xl">
              Possible quiz outcomes
            </h2>
            <p className="mt-4 max-w-4xl text-lg leading-relaxed text-stone-600">
              These are the six standards personality types in this demo version. The
              final version can swap in other standards depending on audience.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(Object.entries(STANDARDS) as [StandardKey, StandardResult][]).map(
                ([key, value]) => (
                  <article
                    key={key}
                    className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50"
                  >
                    <div className="relative aspect-[2/3] bg-stone-200">
                      <Image
                        src={resultImageSrc(key)}
                        alt={`${value.code}: ${value.title}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                      />
                    </div>
                    <div className="p-5">
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
                        {value.code}
                      </p>
                      <h3 className="mt-2 text-2xl font-black tracking-tight text-stone-900">
                        {value.title}
                      </h3>
                      <p className="mt-2 leading-relaxed text-stone-600">{value.subtitle}</p>
                    </div>
                  </article>
                ),
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={startQuiz}
                className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-stone-700"
              >
                Start the quiz
              </button>
              <button
                type="button"
                onClick={resetToIntro}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
              >
                Back to intro
              </button>
            </div>
          </div>
        ) : !showResult ? (
          <div>
            <div className="mb-8 flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">
                  Question {current + 1} of {QUESTIONS.length}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-stone-100 px-4 py-2 text-sm font-bold text-stone-700">
                {current + 1} of {QUESTIONS.length}
              </div>
            </div>

            <h2 className="mb-3 max-w-5xl text-3xl font-black leading-tight tracking-tight text-stone-900 sm:text-4xl">
              {activeQuestion.title}
            </h2>
            <p className="mb-6 max-w-4xl text-lg leading-relaxed text-stone-600">
              {activeQuestion.copy}
            </p>

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
                    key={answer.label}
                    type="button"
                    disabled={selectedIndex !== null}
                    onClick={() => handleChooseAnswer(answerIndex)}
                    className={`rounded-2xl border border-stone-200 px-4 py-4 text-left text-stone-900 transition ${stateClass}`}
                  >
                    <strong className="block">
                      {String.fromCharCode(65 + answerIndex)}. {answer.label}
                    </strong>
                  </button>
                );
              })}
            </div>

            {selectedAnswer ? (
              <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 px-5 py-6">
                <p className="font-serif text-xl italic leading-relaxed text-stone-800 sm:text-2xl">
                  {selectedAnswer.note}
                </p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetToIntro}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
              >
                <RotateCcw className="h-4 w-4" />
                Restart
              </button>
              <button
                type="button"
                disabled={selectedIndex === null}
                onClick={handleNext}
                className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {current === QUESTIONS.length - 1 ? "See my result" : "Next question"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="max-w-5xl text-4xl font-black uppercase leading-[0.95] tracking-tight text-stone-900 sm:text-6xl">
              You are {dominantResult.code}: {dominantResult.title}
            </h2>
            <p className="mt-4 max-w-4xl text-lg leading-relaxed text-stone-600">
              <span className="font-semibold text-stone-900">{dominantResult.subtitle}</span>
            </p>
            <p className="mt-3 max-w-4xl text-lg leading-relaxed text-stone-600">
              {dominantResult.description} {bbtIntro}
            </p>

            <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start">
                <div className="relative mx-auto aspect-[2/3] w-full max-w-sm overflow-hidden rounded-2xl border border-indigo-200 bg-stone-100">
                  <Image
                    src={resultImageSrc(dominant)}
                    alt={`${dominantResult.code}: ${dominantResult.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 340px"
                    priority
                  />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight text-indigo-900">
                    Your shareable result
                  </h3>
                  <p className="mt-3 leading-relaxed text-indigo-900">{bbtCta}</p>
                  <Link
                    href={`mailto:${CONTACT_EMAIL}?subject=SaMD%20Standards%20Quiz%20Follow-up`}
                    className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold leading-none text-white transition hover:bg-stone-700"
                  >
                    <span className="translate-y-px">Talk to someone who gets it</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0" />
                  </Link>
                  <p className="mt-4 leading-relaxed text-indigo-900">
                    {dominantResult.shareHook}{" "}
                    <Link href={QUIZ_PATH} className="font-semibold underline underline-offset-4">
                      {SHARE_PROMPT}
                    </Link>
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-stone-900 px-5 text-sm font-semibold leading-none text-white transition hover:bg-stone-700"
                    >
                      <Share2 className="h-4 w-4 shrink-0" />
                      <span className="translate-y-px">Share result</span>
                    </button>
                  </div>
                  {shareStatus ? (
                    <p className="mt-3 text-sm font-medium text-indigo-900">{shareStatus}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <h3 className="text-xl font-black tracking-tight text-stone-900">
                  Your strengths
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-stone-600">
                  {dominantResult.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <h3 className="text-xl font-black tracking-tight text-stone-900">
                  Your risks
                </h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-stone-600">
                  {dominantResult.risks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-xl font-black tracking-tight text-stone-900">
                Your standards stack
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sorted.map((item) => {
                  const percentage =
                    totalAnswers > 0 ? Math.round((item.score / totalAnswers) * 100) : 0;
                  return (
                    <div
                      key={item.key}
                      className="rounded-xl border border-stone-200 bg-white p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
                        {STANDARDS[item.key].code}
                      </p>
                      <p className="mt-2 text-xl font-black tracking-tight text-stone-900">
                        {item.score} pts
                      </p>
                      <p className="text-sm text-stone-500">{percentage}% of answers</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-stone-500">
              Educational prototype only, not regulatory or legal advice. Final
              submissions should align intended use, risk controls, validation evidence,
              and quality system documentation.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={openAllResults}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
              >
                Show all result types
              </button>
              <button
                type="button"
                onClick={resetToIntro}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
              >
                <RotateCcw className="h-4 w-4" />
                Take again
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
