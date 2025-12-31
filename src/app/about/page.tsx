import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto pt-12 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
        {/* Left Column: Header & Bio */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <header>
            <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50 mb-6">
              About Me
            </h1>
            <p className="text-xl sm:text-2xl font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
              I explore the intersection of visual storytelling, data analytics, and creative technology.
            </p>
          </header>

          <div className="prose prose-zinc dark:prose-invert text-zinc-600 dark:text-zinc-400 leading-loose text-lg">
            <p>
              Hello! I'm a creative technologist and photographer with a passion for making complex information accessible and beautiful.
            </p>
            <p>
              This site serves as a digital garden where I cultivate my interests in photography, interactive data visualization, and web development. Whether I'm capturing street scenes or building tools to analyze housing markets, my goal is always to find the signal in the noise.
            </p>
            <p>
              When I'm not coding or behind the camera, you can find me exploring new cities, reading about urban planning, or experimenting with generative art.
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50">
              Connect
            </h3>
            <div className="flex gap-6 text-zinc-500 dark:text-zinc-400">
              <Link 
                href="mailto:hello@example.com" 
                className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors border-b border-transparent hover:border-current"
              >
                Email
              </Link>
              <Link 
                href="https://twitter.com" 
                target="_blank"
                className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors border-b border-transparent hover:border-current"
              >
                Twitter
              </Link>
              <Link 
                href="https://github.com" 
                target="_blank"
                className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors border-b border-transparent hover:border-current"
              >
                GitHub
              </Link>
              <Link 
                href="https://linkedin.com" 
                target="_blank"
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
            <div className="absolute inset-0 flex items-center justify-center text-zinc-300 dark:text-zinc-600">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
             {/* Uncomment when you have an image */}
            {/* <Image
              src="/me.jpg" 
              alt="Portrait"
              fill
              className="object-cover"
            /> */}
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              Toolkit
            </h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-zinc-600 dark:text-zinc-400">
              <span>TypeScript / React</span>
              <span>Next.js</span>
              <span>Tailwind CSS</span>
              <span>D3.js / Recharts</span>
              <span>Python</span>
              <span>Photography</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

