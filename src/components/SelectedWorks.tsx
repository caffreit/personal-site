import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Camera, FileText, Code } from 'lucide-react';

export const SelectedWorks = () => {
  // Manually curating a mix of interesting content
  const selectedItems = [
    {
      type: 'ALBUM',
      href: '/photos/Faves',
      title: 'Favorites',
      subtitle: 'Photo Album',
      image: '/photos/Faves/DSCF3535.jpg',
      colSpan: 'md:col-span-2'
    },
    {
      type: 'ARTICLE',
      href: '/blog/dunbars-number',
      title: "Dunbar's Number",
      subtitle: 'Data Visualization',
      image: '/blog/dunbars-number/header.png',
      colSpan: 'md:col-span-1'
    },
    {
      type: 'LAB',
      href: '/three-stations',
      title: 'Three Stations',
      subtitle: 'Interactive Tool',
      image: null, // Will use gradient background
      colSpan: 'md:col-span-1'
    },
    {
      type: 'ALBUM',
      href: '/photos/BnW',
      title: 'Black & White',
      subtitle: 'Photo Album',
      image: '/photos/BnW/000226840017.jpg',
      colSpan: 'md:col-span-1'
    },
    {
      type: 'ALBUM',
      href: '/photos/Portraits',
      title: 'Portraits',
      subtitle: 'Photo Album',
      image: '/photos/Portraits/000160980007.jpg',
      colSpan: 'md:col-span-1'
    },
  ];

  return (
    <section className="pt-2 pb-24 sm:pt-6 sm:pb-32 w-full">
      <div className="mb-12 flex items-end justify-between border-b border-stone-200 pb-6">
        <div>
          <span className="block text-sm font-mono font-bold text-yellow-600 mb-2 tracking-widest uppercase">
            Curated
          </span>
          <h2 className="text-5xl sm:text-7xl font-black text-stone-900 tracking-tighter">
            Selected Works
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px]">
        {selectedItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`
              group relative overflow-hidden rounded-[2.5rem] cursor-pointer bg-stone-900
              ${item.colSpan}
            `}
          >
            {/* Background Image or Gradient */}
            {item.image ? (
              <img 
                src={item.image} 
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            ) : (
              <div 
                className="absolute inset-0 w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                style={{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)' }}
              />
            )}

            {/* Grain Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay z-10" 
                 style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}></div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent z-20"></div>

            {/* Content */}
            <div className="absolute inset-0 z-30 p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                 <div className={`
                   px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest flex items-center gap-2
                   ${item.type === 'ARTICLE' ? 'bg-[var(--color-yellow)]/90 text-stone-900' : item.type === 'LAB' ? 'bg-blue-500/90 text-white' : 'bg-white/20 text-white'}
                 `}>
                   {item.type === 'ARTICLE' ? <FileText className="w-3 h-3"/> : item.type === 'LAB' ? <Code className="w-3 h-3"/> : <Camera className="w-3 h-3"/>}
                   {item.type === 'ARTICLE' ? 'Article' : item.type === 'LAB' ? 'Lab' : 'Album'}
                 </div>
                 
                 <div className="w-10 h-10 rounded-full bg-white text-stone-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 group-hover:rotate-45">
                    <ArrowUpRight className="w-5 h-5" />
                 </div>
              </div>

              <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <span className="block text-[var(--color-yellow)] font-serif italic text-lg mb-1">{item.subtitle}</span>
                <h3 className="text-white text-4xl font-black leading-tight tracking-tight">{item.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

