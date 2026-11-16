"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { LabRow, LabThumb } from "@/lib/homeLabs";

/** How many rows show before the "show more" button. */
const VISIBLE = 4;

const BAR_HEIGHTS = [18, 26, 34, 46, 60, 74, 86];
const FALL_STEPS = [
  [0, 30],
  [30, 16],
  [46, 12],
  [58, 10],
  [68, 32],
];

/** Stand-in thumbnails for labs without a cover: drawn in CSS, no bespoke artwork. */
function Thumb({ thumb }: { thumb: LabThumb }) {
  switch (thumb.kind) {
    case "img":
      return (
        <span className="th g img">
          <Image src={thumb.src} alt="" fill sizes="200px" />
        </span>
      );
    case "bars":
      return (
        <span className="th g bars">
          {BAR_HEIGHTS.map((h) => (
            <i key={h} style={{ height: `${h}%` }} />
          ))}
        </span>
      );
    case "fall":
      return (
        <span className="th g fall">
          {FALL_STEPS.map(([top, height]) => (
            <i key={top} style={{ top: `${top}%`, height: `${height}%` }} />
          ))}
        </span>
      );
    case "blocks":
      return (
        <span className="th g blocks">
          {Array.from({ length: 20 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      );
    case "line":
      return (
        <span className="th g line">
          <svg viewBox="0 0 200 76" preserveAspectRatio="none" aria-hidden="true">
            <polyline
              points="0,64 25,60 50,56 70,40 95,46 120,30 140,34 165,14 200,20"
              fill="none"
              style={{ stroke: "var(--accent)" }}
              strokeWidth="3"
            />
            <polyline
              points="0,58 40,54 80,52 120,48 160,44 200,40"
              fill="none"
              style={{ stroke: "var(--emerald)" }}
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </svg>
        </span>
      );
    case "notes":
      return (
        <span className="th g notes">
          {[92, 70, 84, 56].map((w) => (
            <i key={w} style={{ width: `${w}%` }} />
          ))}
        </span>
      );
    default:
      return <span className={`th g ${thumb.kind}`} />;
  }
}

const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IE", { month: "short", year: "numeric", timeZone: "UTC" });

export default function LabRows({ rows, total }: { rows: LabRow[]; total: number }) {
  const [expanded, setExpanded] = useState(false);
  const hidden = Math.max(0, rows.length - VISIBLE);

  return (
    <>
      <div className={`lab-list${expanded ? " expanded" : ""}`}>
        <div id="lab-rows">
          {rows.map((lab) => (
            <Link className="row" href={lab.href} key={lab.href}>
              <span className="spine" />
              <span className="d">{monthYear(lab.date)}</span>
              <span>
                <span className="t">
                  {lab.title}
                  {lab.subtitle && <small>{lab.subtitle}</small>}
                </span>
                <span className="x">
                  <span>
                    <span className="xp">
                      {lab.description}
                      <b>Open →</b>
                    </span>
                  </span>
                </span>
              </span>
              <span className="c">
                {lab.badge}
                <span>{lab.meta}</span>
              </span>
              <Thumb thumb={lab.thumb} />
            </Link>
          ))}
        </div>
      </div>
      <div className="lab-list-foot">
        {hidden > 0 ? (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls="lab-rows"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Show fewer ↑" : `Show ${hidden} more ↓`}
          </button>
        ) : (
          <span />
        )}
        <Link href="/labs">All {total} →</Link>
      </div>
    </>
  );
}
