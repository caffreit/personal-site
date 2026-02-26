import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-32 sm:px-6 lg:px-8">
      <div className="mb-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-mono text-sm font-medium uppercase tracking-[0.2em]">Back to Home</span>
        </Link>

        <h1 className="text-6xl sm:text-8xl font-black text-stone-900 tracking-tighter uppercase leading-[0.8] mb-8 dark:text-white">
          About Me
        </h1>
        <p className="max-w-2xl text-xl leading-relaxed text-stone-600 font-serif italic dark:text-stone-300">
          Portraits, Pattrens, Opinions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
        {/* Left Column: Bio */}
        <div className="lg:col-span-7 flex flex-col gap-8">

          <div className="prose prose-zinc dark:prose-invert text-zinc-600 dark:text-zinc-400 leading-loose text-lg">
            <p className="mb-6">
              I write articles and build interactive tools about economics and finance — clear explanations, useful takeaways, and charts you don't need an economics degree to read. Neither incomprehensible nor dry — just allergic to jargon and fond of charts.
            </p>
            <p className="mb-6">
              The photos are a hobby. People are the main subject, though I also photograph the dogs I look after (every dog deserves a portrait session).
            </p>
            <p>
              By day I do AI in medtech. On the side I'm building fintech for the people banks ignore. This site is just for fun stuff.
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
              Connect
            </h3>
            <div className="flex gap-6 text-zinc-500 dark:text-zinc-400">
              <Link 
                href="mailto:ivan.caffrey@gmail.com" 
                className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors border-b border-transparent hover:border-current"
              >
                Email
              </Link>
              <Link 
                href="https://github.com/caffreit" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors border-b border-transparent hover:border-current"
              >
                GitHub
              </Link>
              <Link 
                href="https://www.linkedin.com/in/ivan-caffrey/" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors border-b border-transparent hover:border-current"
              >
                LinkedIn
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Image & Details */}
        <div className="lg:col-span-5 flex flex-col gap-12">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-zinc-100 dark:bg-zinc-800">
            {/* Placeholder for profile image - using a solid color or generic pattern for now */}
            {/* <div className="absolute inset-0 flex items-center justify-center text-zinc-300 dark:text-zinc-600">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div> */}
            <Image
              src="/me.jpg"
              alt="Portrait"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Toolkit
            </h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-zinc-600 dark:text-zinc-400">
              <span>Fujifilm X100F</span>
              <span>Nikon FL2</span>
              <span>Python</span>
              <span>Cursor</span>
              <span>LLM omnivore — tries them all</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

