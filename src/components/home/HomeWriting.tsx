import Image from "next/image";
import Link from "next/link";

export type HomePost = {
  href: string;
  title: string;
  subtitle?: string;
  summary?: string;
  opening: string;
  category: string;
  date: string;
  readTime: string;
  image?: string;
};

type Props = {
  /** The big story at the top. */
  lead?: HomePost;
  /** Up to three cards under it. */
  cards: HomePost[];
  /** Everything else, as ruled rows. */
  rows: HomePost[];
};

const minutes = (readTime: string) => readTime.replace(" read", "");

export default function HomeWriting({ lead, cards, rows }: Props) {
  if (!lead) return null;

  return (
    <section className="sec writing" id="writing">
      <div className="wrap">
        <div className="sec-head">
          <h2>
            <i style={{ background: "var(--emerald)" }} />
            Writing
          </h2>
          <div className="meta">
            <span>Hover any essay to read the opening</span>
            <Link href="/blog">All essays →</Link>
          </div>
        </div>

        <Link className="lead" href={lead.href}>
          <div className="cover">
            {lead.image && (
              <Image src={lead.image} alt="" fill sizes="(max-width: 1180px) 100vw, 660px" />
            )}
            <span className="tag">Featured</span>
          </div>
          <div>
            <div className="k">
              <span>{lead.category}</span>
              <span>
                {lead.date} · {minutes(lead.readTime)}
              </span>
            </div>
            <h3>{lead.title}</h3>
            {lead.summary && <p className="dek">{lead.summary}</p>}
            <p className="first">{lead.opening}</p>
            <span className="go">Read the essay →</span>
          </div>
        </Link>

        {cards.length > 0 && (
          <div className="essays">
            {cards.map((post) => (
              <Link className="essay" href={post.href} key={post.href}>
                <div className="cover">
                  {post.image && (
                    <Image src={post.image} alt="" fill sizes="(max-width: 860px) 100vw, (max-width: 1180px) 50vw, 380px" />
                  )}
                  <div className="open">
                    {post.opening}
                    <small>Keep reading →</small>
                  </div>
                </div>
                <div className="k">
                  <span>{post.category}</span>
                  <span>
                    {post.date} · {minutes(post.readTime)}
                  </span>
                </div>
                <h3>{post.title}</h3>
                {post.summary && <p className="dek">{post.summary}</p>}
              </Link>
            ))}
          </div>
        )}

        {rows.length > 0 && (
          <div className="more-essays">
            {rows.map((post) => (
              <Link className="row" href={post.href} key={post.href}>
                <span className="spine" />
                <span className="d">{post.date}</span>
                <span>
                  <span className="t">
                    {post.title}
                    {post.subtitle && <small>{post.subtitle}</small>}
                  </span>
                  <span className="x">
                    <span>
                      <span className="xp">
                        {post.opening}
                        <b>Keep reading →</b>
                      </span>
                    </span>
                  </span>
                </span>
                <span className="c">
                  {post.category}
                  <span>{post.readTime}</span>
                </span>
                <span className="th">{post.image && <Image src={post.image} alt="" fill sizes="200px" />}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
