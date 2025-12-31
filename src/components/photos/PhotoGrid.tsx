"use client";

import Image from "next/image";
import Link from "next/link";
import Masonry from "react-masonry-css";
import { PhotoAlbum } from "@/lib/photos";

export function PhotoGrid({ albums }: { albums: PhotoAlbum[] }) {
  const breakpointColumnsObj = {
    default: 3,
    1024: 3,
    640: 2,
    500: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {albums.map((a) => (
        <div key={a.id} className="mb-8">
          <Link
            href={`/photos/${encodeURIComponent(a.id)}`}
            className="group relative block overflow-hidden rounded-[16px] bg-stone-200 transition-all duration-500 hover:shadow-2xl"
          >
            <Image
              src={`/photos/${encodeURIComponent(a.id)}/${encodeURIComponent(a.cover)}`}
              alt={a.title}
              width={500}
              height={500}
              className="h-auto w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
            />
            
             {/* Grain Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" 
                style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}></div>

            {/* Hover Info Card */}
            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white text-2xl font-bold leading-tight mb-1">{a.title}</h3>
                    <p className="text-stone-300 text-sm font-mono uppercase tracking-widest">{a.images.length} Photos</p>
                </div>
            </div>
          </Link>
        </div>
      ))}
    </Masonry>
  );
}
