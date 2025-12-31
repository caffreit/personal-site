"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Share2, ThumbsUp } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface BlogPostLayoutProps {
  title: string;
  category?: string;
  date: string;
  readTime: string;
  excerpt?: string;
  children: React.ReactNode;
}

export default function BlogPostLayout({
  title,
  category,
  date,
  readTime,
  excerpt,
  children,
}: BlogPostLayoutProps) {
  
  // Scroll to top on mount handled by Next.js usually, but we can ensure it.
  // Next.js app router handles scroll on navigation.

  const [scrolled, setScrolled] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeStatus, setLikeStatus] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const likeStatusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareStatusTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const slug = useMemo(() => pathname?.split('/').filter(Boolean).pop() ?? null, [pathname]);

  const buildShareUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${pathname ?? ''}`;
    }
    const fallbackOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? '';
    return `${fallbackOrigin}${pathname ?? ''}`;
  }, [pathname]);

  const scheduleStatusReset = useCallback((
    setter: React.Dispatch<React.SetStateAction<string | null>>,
    ref: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  ) => {
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(() => setter(null), 2500);
  }, []);

  const persistLikeState = useCallback((liked: boolean) => {
    if (typeof window === 'undefined' || !slug) return;
    try {
      const raw = window.localStorage.getItem('personal-site-liked-posts');
      const parsed = raw ? JSON.parse(raw) : {};
      if (liked) {
        parsed[slug] = true;
      } else {
        delete parsed[slug];
      }
      window.localStorage.setItem('personal-site-liked-posts', JSON.stringify(parsed));
    } catch (error) {
      console.error('Unable to persist like state', error);
    }
  }, [slug]);

  const handleLikeClick = useCallback(() => {
    if (!slug) return;
    setIsLiked((prev) => {
      const next = !prev;
      persistLikeState(next);
      setLikeStatus(next ? 'Saved to likes' : 'Removed from likes');
      scheduleStatusReset(setLikeStatus, likeStatusTimeout);
      return next;
    });
  }, [persistLikeState, scheduleStatusReset, slug]);

  const handleShareClick = useCallback(async () => {
    const url = buildShareUrl();
    const shareData = {
      title,
      text: excerpt ?? title,
      url,
    };
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
        setShareStatus('Shared!');
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareStatus('Link copied');
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setShareStatus('Link copied');
      }
    } catch (error) {
      console.error('Share failed', error);
      setShareStatus('Unable to share');
    } finally {
      scheduleStatusReset(setShareStatus, shareStatusTimeout);
    }
  }, [buildShareUrl, excerpt, scheduleStatusReset, title]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !slug) return;
    try {
      const raw = window.localStorage.getItem('personal-site-liked-posts');
      const parsed = raw ? JSON.parse(raw) : {};
      setIsLiked(Boolean(parsed[slug]));
    } catch (error) {
      console.error('Unable to read like state', error);
    }
  }, [slug]);

  useEffect(() => {
    return () => {
      if (likeStatusTimeout.current) clearTimeout(likeStatusTimeout.current);
      if (shareStatusTimeout.current) clearTimeout(shareStatusTimeout.current);
    };
  }, []);

  return (
    <div className="bg-stone-50 dark:bg-[#0A0A0A] min-h-screen pb-32 pt-24 animate-in fade-in slide-in-from-bottom-8 duration-500 relative">
      {/* Noise Texture */}
      <div className="bg-noise"></div>

      {/* Top Navigation Bar for Reading Mode */}
      <div className={`fixed top-0 left-0 w-full z-50 px-4 h-16 flex items-center justify-between transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-stone-200 dark:border-zinc-800' : 'bg-transparent'}`}>
         <Link 
           href="/blog"
           className="flex items-center gap-2 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-full transition-all"
         >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium text-sm font-sans">Back to Blog</span>
         </Link>
         
         <div className={`hidden md:block font-serif italic text-stone-400 dark:text-stone-500 truncate max-w-md transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`}>
            {title}
         </div>
         
         <div className="w-24"></div> {/* Spacer for balance */}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative flex flex-col md:flex-row gap-12 mt-8">
        
        {/* Sidebar (Desktop) */}
        <div className="hidden md:block w-48 relative shrink-0">
           <div className="sticky top-32 flex flex-col gap-6 items-start">
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest font-sans">Published</span>
                 <span className="text-stone-900 dark:text-stone-200 font-mono text-sm">{date}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest font-sans">Read Time</span>
                 <div className="flex items-center gap-2 text-stone-900 dark:text-stone-200 font-mono text-sm">
                    <Clock className="w-3 h-3" /> {readTime}
                 </div>
              </div>
              <div className="w-full h-px bg-stone-200 dark:bg-zinc-800 my-2"></div>
              <button
                type="button"
                onClick={handleLikeClick}
                aria-pressed={isLiked}
                className={`flex items-center gap-3 transition-colors group ${isLiked ? 'text-[var(--color-yellow)]' : 'text-stone-500 hover:text-[var(--color-yellow)]'}`}
              >
                 <div className={`p-2 rounded-full bg-stone-100 dark:bg-zinc-800 transition-colors group-hover:bg-[#F4CA16]/10 dark:group-hover:bg-[#F4CA16]/10 ${isLiked ? 'bg-[#F4CA16]/10 dark:bg-[#F4CA16]/10' : ''}`}>
                    <ThumbsUp className="w-4 h-4" />
                 </div>
                 <span className="text-sm font-medium font-sans">{isLiked ? 'Liked' : 'Like'}</span>
              </button>
              {likeStatus && (
                <span className="text-xs font-medium text-stone-400 dark:text-stone-500 font-sans" aria-live="polite">
                  {likeStatus}
                </span>
              )}
              
              <button
                type="button"
                onClick={handleShareClick}
                className="flex items-center gap-3 text-stone-500 hover:text-blue-600 transition-colors group"
              >
                 <div className="p-2 rounded-full bg-stone-100 dark:bg-zinc-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <Share2 className="w-4 h-4" />
                 </div>
                 <span className="text-sm font-medium font-sans">Share</span>
              </button>
              {shareStatus && (
                <span className="text-xs font-medium text-stone-400 dark:text-stone-500 font-sans" aria-live="polite">
                  {shareStatus}
                </span>
              )}
           </div>
        </div>

        {/* Main Content */}
        <article className="flex-1 max-w-2xl mx-auto md:mx-0 min-w-0">
          
          {/* Header */}
          <header className="mb-12">
            {category && (
              <div className="inline-block px-3 py-1 mb-6 rounded-full border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-[var(--color-yellow)] dark:text-[var(--color-yellow)] uppercase tracking-widest shadow-sm font-sans">
                  {category}
              </div>
            )}
            <h1 className="text-4xl sm:text-6xl font-black text-stone-900 dark:text-white tracking-tight leading-[1.1] mb-6 font-sans">
                {title}
            </h1>
            {excerpt && (
              <p className="text-xl sm:text-2xl text-stone-500 dark:text-stone-400 font-serif italic leading-relaxed">
                  {excerpt}
              </p>
            )}
          </header>

          {/* Body Content */}
          <div className="blog-post-body prose prose-xl prose-stone dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-stone-900 dark:prose-headings:text-white prose-headings:font-sans
            prose-h2:text-3xl prose-h2:mt-20 prose-h2:mb-10 prose-h2:pt-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-stone-100 dark:prose-h2:border-zinc-800
            prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6
            prose-p:leading-relaxed prose-p:text-stone-700 dark:prose-p:text-stone-300 prose-p:mb-8 prose-p:font-serif prose-p:text-3xl
            prose-li:text-stone-700 dark:prose-li:text-stone-300 prose-li:font-serif prose-li:text-3xl
            prose-a:text-stone-900 dark:prose-a:text-white prose-a:no-underline prose-a:border-b prose-a:border-stone-300 dark:prose-a:border-zinc-600 hover:prose-a:border-stone-900 dark:hover:prose-a:border-white prose-a:transition-colors
            prose-strong:font-bold prose-strong:text-[var(--color-yellow)] dark:prose-strong:text-[var(--color-yellow)]
            prose-code:text-stone-900 dark:prose-code:text-white prose-code:bg-stone-100 dark:prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-[''] prose-code:font-mono
            prose-img:rounded-2xl prose-img:shadow-md prose-img:my-12
            prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-yellow)] dark:prose-blockquote:border-[var(--color-yellow)] prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-stone-600 dark:prose-blockquote:text-stone-400 prose-blockquote:my-8 prose-blockquote:font-serif
            
            [&>p:first-of-type]:text-2xl sm:[&>p:first-of-type]:text-3xl [&>p:first-of-type]:leading-relaxed
            [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:text-7xl [&>p:first-of-type]:first-letter:pr-4 [&>p:first-of-type]:first-letter:font-black [&>p:first-of-type]:first-letter:text-stone-900 dark:[&>p:first-of-type]:first-letter:text-white [&>p:first-of-type]:first-letter:leading-[0.8]
          ">
             {children}
          </div>

          {/* Footer of Article */}
          <div className="mt-16 pt-8 border-t border-stone-200 dark:border-zinc-800">
             <div className="bg-stone-100 dark:bg-zinc-800/50 rounded-3xl p-8 flex items-center gap-6">
                <img src="https://picsum.photos/200/200?grayscale" className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-zinc-700 shadow-md" alt="Author" />
                <div>
                    <h4 className="font-bold text-stone-900 dark:text-white font-sans">Written by Alex Sterling</h4>
                    <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 font-sans">Data Scientist & Photographer exploring the intersection of light and logic.</p>
                </div>
             </div>
          </div>
        </article>
      </div>
    </div>
  );
}

