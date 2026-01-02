'use client';

import React, { useState, useMemo } from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { PhotoAlbum } from '@/lib/photos';

import { useRouter } from 'next/navigation';

interface PhotoGalleryProps {
  albums: PhotoAlbum[];
  onAlbumClick?: (albumId: string) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ albums, onAlbumClick }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const router = useRouter();

  // Flatten albums into photos with necessary fields
  const photos = useMemo(() => {
    // First, collect all images from all albums
    let allPhotos = albums.flatMap((album) => 
      album.images.map((img) => ({ 
        id: `${album.id}-${img.filename}`,
        category: album.title,
        albumId: album.id,
        url: `/photos/${encodeURIComponent(album.id)}/${encodeURIComponent(img.filename)}`,
        title: img.caption || album.title,
        location: img.location,
        isFeatured: img.isFeatured,
        // Placeholder for grid span logic, will be set after filtering
        className: '' 
      }))
    );

    // If we're showing 'All', we want to prioritize featured images and limit to 10
    // If we're showing a specific category, we show all (or maybe pagination later)
    
    // Sort by featured first
    allPhotos.sort((a, b) => {
       if (a.isFeatured && !b.isFeatured) return -1;
       if (!a.isFeatured && b.isFeatured) return 1;
       return 0;
    });

    return allPhotos;
  }, [albums]);

  // Helper function to shuffle array (Fisher-Yates shuffle)
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const filteredPhotos = useMemo(() => {
    let currentPhotos = [];
    
    if (activeCategory !== 'All') {
        const categoryPhotos = photos.filter(p => p.category === activeCategory);
        // Randomly select up to 12 photos from the category
        currentPhotos = shuffleArray(categoryPhotos).slice(0, 12);
    } else {
        // Pick one photo from each album to represent the theme
        currentPhotos = albums.map(album => {
            // Use the cover image if specified, otherwise find a featured image, or just the first one
            const coverFilename = album.cover;
            const coverImage = album.images.find(img => img.filename === coverFilename) 
                || album.images.find(img => img.isFeatured) 
                || album.images[0];

            return {
                id: `${album.id}-${coverImage.filename}`,
                category: album.title,
                albumId: album.id,
                url: `/photos/${encodeURIComponent(album.id)}/${encodeURIComponent(coverImage.filename)}`,
                title: album.title, // Show the theme name as the title
                location: coverImage.location,
                isFeatured: coverImage.isFeatured,
                className: ''
            };
        });
    }

    // Define a layout pattern to mix up sizes
    // Sequence: Big, Small, Small, Tall, Small, Wide, Small, Small
    const pattern = [
      { col: 2, row: 2 }, 
      { col: 1, row: 1 }, 
      { col: 1, row: 1 }, 
      { col: 1, row: 2 }, 
      { col: 1, row: 1 }, 
      { col: 2, row: 1 }, 
      { col: 1, row: 1 }, 
      { col: 1, row: 1 }, 
    ];

    // Apply grid classes after filtering so layout is consistent
    return currentPhotos.map((photo, idx) => {
        const layout = pattern[idx % pattern.length];
        return {
            ...photo,
            className: `md:col-span-${layout.col} md:row-span-${layout.row}`
        };
    });
  }, [activeCategory, photos, albums]);

  const categories = useMemo(() => {
    // We only want categories that actually have photos
    const cats = Array.from(new Set(photos.map(p => p.category)));
    return ['All', ...cats];
  }, [photos]);

  const handleAlbumClick = (categoryName: string) => {
     const album = albums.find(a => a.title === categoryName);
     if (album) {
         if (onAlbumClick) {
            onAlbumClick(album.id);
         } else {
            router.push(`/photos/${encodeURIComponent(album.id)}`);
         }
     }
  };

  return (
    <section id="work" className="pt-8 pb-24 sm:pt-12 sm:pb-32 w-full">
      
      {/* Header & Controls */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-stone-200 pb-8">
        <div>
            <span className="block text-sm font-mono font-bold text-yellow-600 mb-2 tracking-widest uppercase">
            Visual Log
            </span>
            <h2 className="text-5xl sm:text-7xl font-black text-stone-900 tracking-tighter">
            Photography
            </h2>
        </div>
        
        <div className="flex flex-col items-end gap-4">
            {/* Pill Navigation */}
            <div className="flex flex-wrap justify-end gap-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300
                            ${activeCategory === cat 
                                ? 'bg-stone-900 text-[var(--color-yellow)] shadow-md scale-105' 
                                : 'bg-stone-100 text-stone-500 hover:bg-white hover:text-stone-900 hover:shadow-sm'
                            }
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            
            {activeCategory !== 'All' && (
                <button 
                    onClick={() => handleAlbumClick(activeCategory)}
                    className="hidden md:flex items-center gap-2 text-stone-900 font-bold hover:text-yellow-600 transition-colors animate-in fade-in slide-in-from-right-4"
                >
                    <span>Enter {activeCategory} Album</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[250px] gap-4 grid-flow-dense">
        {filteredPhotos.map((photo) => (
          <div 
            key={photo.id} 
            onClick={() => {
                if (onAlbumClick) {
                    onAlbumClick(photo.albumId);
                } else {
                    router.push(`/photos/${encodeURIComponent(photo.albumId)}`);
                }
            }}
            className={`group relative overflow-hidden rounded-[2rem] bg-stone-200 shadow-sm transition-all duration-500 hover:shadow-xl cursor-pointer ${photo.className}`}
          >
            <img 
              src={photo.url} 
              alt={photo.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Grain Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" 
                 style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}></div>

            {/* Hover Info */}
            <div className="absolute inset-0 bg-gradient-to-tr from-stone-900/80 via-stone-900/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-[var(--color-yellow)] font-serif italic text-lg mb-1">{photo.location ? photo.location.charAt(0).toUpperCase() + photo.location.slice(1).toLowerCase() : ''}</span>
                <h3 className="text-white text-4xl font-black leading-tight tracking-tight">{photo.title}</h3>
            </div>
          </div>
        ))}

        {/* Call to Action Card (Shows up in grid when filtered) */}
        {activeCategory !== 'All' && (
            <div 
                onClick={() => handleAlbumClick(activeCategory)}
                className="md:col-span-1 md:row-span-1 rounded-[2rem] bg-[var(--color-yellow)] flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-yellow-400 transition-colors group"
            >
                <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center text-[var(--color-yellow)] mb-4 group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6" />
                </div>
                <span className="text-stone-900 font-black text-center leading-tight">
                    View Full<br/>Collection
                </span>
                <ArrowRight className="w-5 h-5 text-stone-900 mt-4 group-hover:translate-x-1 transition-transform" />
            </div>
        )}
      </div>

      {/* Mobile-only Link */}
      {activeCategory !== 'All' && (
         <div className="mt-8 flex md:hidden justify-center">
             <button 
                onClick={() => handleAlbumClick(activeCategory)}
                className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-transform"
             >
                 <span>Open {activeCategory} Album</span>
                 <ArrowRight className="w-4 h-4" />
             </button>
         </div>
      )}
    </section>
  );
};
