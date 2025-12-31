'use client';

export default function ScrollToTop() {
  return (
    <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="text-sm font-medium text-zinc-500 hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
    >
        Scroll to top ↑
    </button>
  );
}

