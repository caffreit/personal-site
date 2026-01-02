"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Masonry from "react-masonry-css";
import { MapPin, Grid3X3 } from "lucide-react";
import { PhotoAlbum, LocationAlbum } from "@/lib/photos";

type ViewMode = "themes" | "locations";

interface PhotoGalleryViewProps {
  albums: PhotoAlbum[];
  locations: LocationAlbum[];
}

export function PhotoGalleryView({ albums, locations }: PhotoGalleryViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("themes");

  const breakpointColumnsObj = {
    default: 3,
    1024: 3,
    640: 2,
    500: 1,
  };

  return (
    <div>
      {/* View Mode Toggle */}
      {locations.length > 0 && (
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setViewMode("themes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              viewMode === "themes"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            By Theme
          </button>
          <button
            onClick={() => setViewMode("locations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              viewMode === "locations"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <MapPin className="w-4 h-4" />
            By Location
          </button>
        </div>
      )}

      {/* Theme Albums Grid */}
      {viewMode === "themes" && (
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
                <div className="absolute inset-0 bg-gradient-to-tr from-stone-900/80 via-stone-900/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <div className="translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white text-2xl font-bold leading-tight mb-1">{a.title}</h3>
                        <p className="text-stone-300 text-sm font-mono uppercase tracking-widest">{a.images.length} Photos</p>
                    </div>
                </div>
              </Link>
            </div>
          ))}
        </Masonry>
      )}

      {/* Location Albums Grid */}
      {viewMode === "locations" && (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {locations.map((loc) => (
            <div key={loc.id} className="mb-8">
              <Link
                href={`/photos/location/${encodeURIComponent(loc.id)}`}
                className="group relative block overflow-hidden rounded-[16px] bg-stone-200 transition-all duration-500 hover:shadow-2xl"
              >
                <Image
                  src={`/photos/${encodeURIComponent(loc.coverAlbum)}/${encodeURIComponent(loc.cover)}`}
                  alt={loc.name}
                  width={500}
                  height={500}
                  className="h-auto w-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                />
                
                {/* Grain Overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" 
                    style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}></div>

                {/* Location Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-stone-700">
                    <MapPin className="w-3 h-3" />
                    Location
                  </span>
                </div>

                {/* Hover Info Card */}
                <div className="absolute inset-0 bg-gradient-to-tr from-stone-900/80 via-stone-900/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <div className="translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white text-2xl font-bold leading-tight mb-1">{loc.name}</h3>
                        <p className="text-stone-300 text-sm font-mono uppercase tracking-widest">{loc.photoCount} Photos</p>
                    </div>
                </div>
              </Link>
            </div>
          ))}
        </Masonry>
      )}
    </div>
  );
}

