'use client';

import Image from 'next/image';

interface RoomMockupProps {
  imageSrc: string;
  alt: string;
  sizeLabel: string;
  /** Width of the framed print in px (relative to the room) */
  frameWidth: number;
  /** Height of the framed print in px */
  frameHeight: number;
}

const SIZE_PRESETS: Record<string, { w: number; h: number }> = {
  '30x40cm': { w: 100, h: 133 },
  '40x50cm': { w: 120, h: 150 },
  '40x60cm': { w: 140, h: 210 },
  '50x70cm': { w: 170, h: 238 },
};

export function getSizePreset(size: string): { w: number; h: number } {
  return SIZE_PRESETS[size] ?? { w: 140, h: 200 };
}

export function RoomMockup({
  imageSrc,
  alt,
  sizeLabel,
  frameWidth,
  frameHeight,
}: RoomMockupProps) {
  return (
    <div className="prints-room-mockup">
      {/* Wall */}
      <div
        className="prints-room-wall"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--background) 95%, #a0a0a0) 0%, color-mix(in srgb, var(--background) 88%, #a0a0a0) 100%)',
        }}
      />

      {/* Floor */}
      <div
        className="prints-room-floor"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--background) 78%, #808080) 0%, color-mix(in srgb, var(--background) 70%, #808080) 100%)',
        }}
      />

      {/* Sofa */}
      <div
        className="prints-room-sofa"
        style={{
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--foreground) 30%, var(--background)) 0%, color-mix(in srgb, var(--foreground) 25%, var(--background)) 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-28%',
            left: '5%',
            right: '5%',
            height: '32%',
            borderRadius: '6px 6px 0 0',
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--foreground) 28%, var(--background)) 0%, color-mix(in srgb, var(--foreground) 30%, var(--background)) 100%)',
          }}
        />
      </div>

      {/* Framed print */}
      <div
        className="prints-room-frame"
        style={{ width: frameWidth, height: frameHeight }}
      >
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-cover"
          sizes="200px"
        />
      </div>

      {/* Dimension label */}
      <div
        className="absolute font-[family-name:var(--font-mono)] text-[0.5rem] tracking-[0.1em] text-[var(--text-muted)]"
        style={{
          bottom: 'calc(35% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {sizeLabel}
      </div>
    </div>
  );
}
