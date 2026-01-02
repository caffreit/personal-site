'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, ArrowLeft, MapPin } from 'lucide-react';
import { analyzeImageAction } from '@/app/actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Masonry from 'react-masonry-css';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export interface LocationPhoto {
    id: string;
    url: string;
    title: string;
    albumId: string;
    albumTitle: string;
    width?: number;
    height?: number;
}

interface LocationAlbumViewProps {
  location: string;
  images: LocationPhoto[];
  onBack?: () => void;
}

export const LocationAlbumView: React.FC<LocationAlbumViewProps> = ({ location, images, onBack }) => {
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
    } catch {
        setAnalysis("Failed to analyze image.");
    }
    setLoading(false);
  };

  const closeAnalysis = () => {
    setSelectedPhoto(null);
    setAnalysis(null);
  };
  
  const openLightbox = (index: number) => {
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
            <span className="font-medium text-sm">Close</span>
         </button>
         <div className="hidden md:flex items-center gap-2 font-mono font-bold text-stone-400 uppercase tracking-widest">
            <MapPin className="w-4 h-4" />
            {location}
         </div>
         <div className="w-24"></div> 
      </div>

      <div className="pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-32">
        {/* Location Header */}
        <div className="mb-12">
            <button 
               onClick={handleBack}
               className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-10 transition-colors"
             >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium text-sm font-mono uppercase tracking-wider">Back to Albums</span>
             </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-stone-200 px-3 py-1.5 rounded-full text-xs font-medium text-stone-600">
                <MapPin className="w-3 h-3" />
                Location
              </span>
            </div>

            <h1 className="text-6xl sm:text-8xl font-black text-stone-900 tracking-tighter uppercase leading-[0.8] mb-8">
                {location}
            </h1>
            <p className="max-w-xl text-xl text-stone-600 font-serif italic">
               {images.length} photos from {location}, across multiple albums.
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

                {/* Album Badge */}
                <div className="absolute top-4 left-4">
                  <Link 
                    href={`/photos/${encodeURIComponent(photo.albumId)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-stone-700 hover:bg-white transition-colors"
                  >
                    {photo.albumTitle}
                  </Link>
                </div>

                {/* Hover Info Card */}
                <div className="absolute inset-0 bg-gradient-to-tr from-stone-900/80 via-stone-900/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                    <div className="flex justify-end items-start w-full">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAnalyze(photo.url, photo.id);
                            }}
                            className="bg-stone-900/40 backdrop-blur-sm border border-[var(--color-yellow)]/30 text-[var(--color-yellow)] px-4 py-2 rounded-full hover:bg-stone-900/60 transition-all shadow-lg flex items-center gap-2 group/btn"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="font-serif italic text-lg">Analyse with Gemini</span>
                        </button>
                    </div>

                    <div className="translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white text-2xl font-bold leading-tight mb-2">{photo.title}</h3>
                    </div>
                </div>

                {/* Analysis Popover (In-place) */}
                {selectedPhoto === photo.id && (
                    <div 
                        className="absolute inset-0 z-20 bg-stone-900/95 p-6 md:p-8 flex flex-col justify-center animate-in fade-in duration-300"
                        onClick={(e) => e.stopPropagation()}
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

