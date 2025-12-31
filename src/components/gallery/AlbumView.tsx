'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, ArrowLeft } from 'lucide-react';
import { analyzeImageAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import Masonry from 'react-masonry-css';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export interface Photo {
    id: string;
    url: string;
    title: string;
    location?: string;
    iso?: string;
    aperture?: string;
    shutter?: string;
    className?: string;
    width?: number;
    height?: number;
}

interface AlbumViewProps {
  album: string;
  description?: string;
  images: Photo[];
  onBack?: () => void;
}

export const AlbumView: React.FC<AlbumViewProps> = ({ album, description, images, onBack }) => {
  const router = useRouter();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleBack = () => {
      if (onBack) onBack();
      else router.push('/photos');
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAnalyze = async (url: string, id: string) => {
    setSelectedPhoto(id);
    setLoading(true);
    setAnalysis(null);
    
    try {
        const result = await analyzeImageAction(url);
        setAnalysis(result);
    } catch (e) {
        setAnalysis("Failed to analyze image.");
    }
    setLoading(false);
  };

  const closeAnalysis = () => {
    setSelectedPhoto(null);
    setAnalysis(null);
  };
  
  const openLightbox = (index: number) => {
    // Prevent lightbox opening if analysis is active for this photo
    // or if we want to strictly separate modes.
    // For now, if we are viewing analysis, maybe don't open lightbox?
    // The click is on the container, the analysis overlay is on top.
    // If analysis is open, the overlay covers the click area, so this function
    // technically won't fire if clicked on the overlay (unless overlay bubbles).
    
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const breakpointColumnsObj = {
    default: 3,
    1024: 3,
    640: 2,
    500: 1,
  };

  return (
    <div className="bg-stone-50 min-h-screen animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-stone-200 z-40 px-4 h-16 flex items-center justify-between">
         <button 
           onClick={handleBack}
           className="flex items-center gap-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 px-3 py-1.5 rounded-full transition-all group"
         >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Close Album</span>
         </button>
         <div className="hidden md:block font-mono font-bold text-stone-400 uppercase tracking-widest">
            {album}
         </div>
         <div className="w-24"></div> 
      </div>

      <div className="pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-32">
        {/* Album Header */}
        <div className="mb-12">
            <button 
               onClick={handleBack}
               className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-10 transition-colors"
             >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium text-sm font-mono uppercase tracking-wider">Back to Albums</span>
             </button>

            <h1 className="text-6xl sm:text-8xl font-black text-stone-900 tracking-tighter uppercase leading-[0.8] mb-8">
                {album}
            </h1>
            <p className="max-w-xl text-xl text-stone-600 font-serif italic">
               {description || `A visual exploration of ${album}, captured through the lens of data and light.`}
            </p>
        </div>

        {/* Masonry Grid */}
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
            {images.map((photo, index) => (
            <div 
                key={photo.id} 
                onClick={() => !selectedPhoto && openLightbox(index)}
                className="mb-8 group relative overflow-hidden rounded-[16px] bg-stone-200 cursor-pointer transition-all duration-500 hover:shadow-2xl"
            >
                <img 
                  src={photo.url} 
                  alt={photo.title} 
                  width={photo.width}
                  height={photo.height}
                  className="h-auto w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                />
                
                {/* Grain Overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" 
                    style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}></div>

                {/* Hover Info Card */}
                <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                    <div className="flex justify-end items-start w-full">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAnalyze(photo.url, photo.id);
                            }}
                            className="bg-[var(--color-yellow)] text-stone-900 p-2 rounded-full hover:scale-110 transition-transform shadow-lg"
                            title="Analyze with Gemini"
                        >
                            <Sparkles className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white text-2xl font-bold leading-tight mb-2">{photo.title}</h3>
                    </div>
                </div>

                {/* Analysis Popover (In-place) */}
                {selectedPhoto === photo.id && (
                    <div 
                        className="absolute inset-0 z-20 bg-stone-900/95 p-6 md:p-8 flex flex-col justify-center animate-in fade-in duration-300"
                        onClick={(e) => e.stopPropagation()} // Prevent lightbox open when clicking analysis background
                    >
                        <button onClick={closeAnalysis} className="absolute top-6 right-6 text-stone-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[var(--color-yellow)] font-mono text-xs uppercase tracking-widest">
                                <Sparkles className="w-4 h-4 animate-spin-slow" /> AI Analysis
                            </div>
                            
                            {loading ? (
                                <div className="space-y-3">
                                    <div className="h-4 w-3/4 bg-stone-800 rounded animate-pulse"></div>
                                    <div className="h-4 w-1/2 bg-stone-800 rounded animate-pulse"></div>
                                    <div className="h-4 w-5/6 bg-stone-800 rounded animate-pulse"></div>
                                </div>
                            ) : (
                                <p className="text-lg md:text-xl font-serif text-stone-200 leading-relaxed italic">
                                    "{analysis}"
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            ))}
        </Masonry>
      </div>
      
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={images.map((img) => ({ src: img.url, title: img.title }))}
      />
    </div>
  );
};
