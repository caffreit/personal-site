import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const LABS = [
  {
    title: "Three Stations",
    description: "Tap anywhere on the Liffey corridor to compare real-time walking routes from Connolly, Tara Street, and Pearse using the Google Maps Directions API.",
    href: "/three-stations",
    badge: "Google Maps",
    status: "Live",
    meta: "Transit • Experiment",
  },
];

export const metadata = {
  title: "Labs",
  description: "Prototype playgrounds and interactive data experiments.",
};

export default function LabsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 pb-32 sm:px-6 lg:px-8">
      <div className="mb-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-stone-500 transition-colors hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-mono text-sm font-medium uppercase tracking-[0.2em]">
            Back to Home
          </span>
        </Link>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="mb-4 block font-mono text-xs font-bold uppercase tracking-[0.4em] text-yellow-600">
              Labs
            </span>
            <h1 className="text-5xl font-black uppercase leading-[0.9] tracking-tight text-stone-900 sm:text-7xl">
              Experiments &<br className="hidden sm:block" /> Interactive Tools
            </h1>
          </div>
          <p className="max-w-2xl font-serif text-lg italic text-stone-600">
            WIP explorations that lean on APIs, data viz, and playful UI patterns—
            sharing the same editorial feel as the photo and blog archives.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {LABS.map((lab) => (
          <Link
            key={lab.href}
            href={lab.href}
            className="group relative overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white p-8 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.4)] transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.4)]"
          >
            <div className="mb-8 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-stone-400">
              <span className="rounded-full border border-stone-200 px-3 py-1 text-[10px] font-black tracking-widest text-stone-600">
                {lab.status}
              </span>
              <span className="rounded-full bg-lime-100 px-3 py-1 text-lime-700">
                {lab.badge}
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
                {lab.title}
              </h2>
              <p className="text-base leading-relaxed text-stone-600">
                {lab.description}
              </p>
            </div>

            <div className="mt-10 flex items-center justify-between text-sm text-stone-500">
              <span className="font-mono uppercase tracking-[0.3em]">{lab.meta}</span>
              <span className="flex items-center gap-2 font-semibold text-stone-900 transition-colors group-hover:text-yellow-600">
                View Lab
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </span>
            </div>

            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-10" style={{ backgroundImage: "linear-gradient(135deg, #bef264 0%, #0ea5e9 100%)" }} />
          </Link>
        ))}
      </div>
    </div>
  );
}


