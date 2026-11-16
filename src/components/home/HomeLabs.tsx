import Image from "next/image";
import Link from "next/link";
import type { BentoLab, LabRow } from "@/lib/homeLabs";
import LabRows from "./LabRows";

function Art({ lab }: { lab: BentoLab }) {
  const { art } = lab;
  if (art.kind === "cover") {
    return (
      <div className="art">
        <Image
          src={art.src}
          alt=""
          fill
          sizes={lab.size === "normal" ? "(max-width: 860px) 100vw, 300px" : "(max-width: 860px) 100vw, 600px"}
          style={art.position ? { objectPosition: art.position } : undefined}
        />
      </div>
    );
  }
  return (
    <div className={`art ${art.kind}`}>
      {art.srcs.map((src) => (
        <Image key={src} src={src} alt="" width={160} height={art.kind === "icons" ? 240 : 160} />
      ))}
    </div>
  );
}

export default function HomeLabs({ bento, rows, total }: { bento: BentoLab[]; rows: LabRow[]; total: number }) {
  return (
    <section className="sec labs-sec" id="labs">
      <div className="wrap">
        <div className="sec-head">
          <h2>
            <i style={{ background: "var(--accent)" }} />
            Labs
          </h2>
          <div className="meta">
            <span>{total} interactive things</span>
            <Link href="/labs">All labs →</Link>
          </div>
        </div>

        <div className="labs">
          {bento.map((lab) => (
            <Link className={`lab${lab.size === "normal" ? "" : ` ${lab.size}`}`} href={lab.href} key={lab.href}>
              <Art lab={lab} />
              <span className="go">{lab.cta} →</span>
              <div className="cap">
                <div className="k">{lab.kicker}</div>
                <h3>{lab.title}</h3>
                <p>{lab.blurb}</p>
              </div>
            </Link>
          ))}
        </div>

        {rows.length > 0 && <LabRows rows={rows} total={total} />}
      </div>
    </section>
  );
}
