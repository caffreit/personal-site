import "@/styles/home.css";
import { getAllPosts, getPostOpening, type PostListItem } from "@/lib/posts";
import { readPhotoManifest } from "@/lib/photos";
import { HERO_SLIDES } from "@/lib/hero";
import { getHomeLabs } from "@/lib/homeLabs";
import HomeDoors, { type DoorPhoto } from "@/components/home/HomeDoors";
import HomeWriting, { type HomePost } from "@/components/home/HomeWriting";
import HomeLabs from "@/components/home/HomeLabs";
import AlbumStrip, { type HomeAlbum } from "@/components/home/AlbumStrip";

/** Album order on the home page; anything not listed follows in manifest order. */
const ALBUM_ORDER = [
  "Portraits", "BnW", "Film", "People", "Buildings", "Faves", "Diptych", "Mountains", "Minimal", "Animals", "Recents",
];

/** Home-page covers that differ from the album's own, so the strip doesn't repeat the hero frames. */
const COVER_OVERRIDES: Record<string, string> = {
  Faves: "000226830008.jpg",
  Diptych: "000393120003.jpg",
  Minimal: "DSCF0816.jpg",
  Recents: "img022.jpg",
};

const formatDate = (date: string | Date) =>
  new Date(date)
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    .replace(",", "");

function toHomePost(post: PostListItem): HomePost {
  // "Against Idle Land: A Case for…" reads better as a title plus a subtitle
  const at = post.title.indexOf(": ");
  return {
    href: `/blog/${post.slug}`,
    title: at === -1 ? post.title : post.title.slice(0, at),
    subtitle: at === -1 ? undefined : post.title.slice(at + 2),
    summary: post.summary,
    opening: getPostOpening(post.slug),
    category: post.category ?? post.tags[0] ?? "Essay",
    date: formatDate(post.date),
    readTime: post.readTime,
    image: post.image,
  };
}

export default function Home() {
  // newest first (frontmatter dates arrive as a mix of strings and Date objects)
  const posts = [...getAllPosts()]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(toHomePost);
  const { albums } = readPhotoManifest();
  const labs = getHomeLabs();

  // The essay door shows the newest post. Below, the next one leads the Writing section,
  // three more follow as cards, and the rest (newest included) become the ruled list.
  const [latest, lead, ...others] = posts;
  const cards = others.slice(0, 3);
  const rows = latest && lead ? [latest, ...others.slice(3)] : [];

  const albumTitles = new Map(albums.map((album) => [album.id, album.title]));
  const photos: DoorPhoto[] = HERO_SLIDES.map((slide) => {
    const [, , albumId, filename = ""] = slide.src.split("/");
    const title = albumTitles.get(albumId) ?? slide.alt;
    return { src: slide.src, caption: `${filename.replace(/\.[^.]+$/, "")} · ${title}` };
  });

  const rank = (id: string) => {
    const i = ALBUM_ORDER.indexOf(id);
    return i === -1 ? ALBUM_ORDER.length : i;
  };
  const homeAlbums: HomeAlbum[] = [...albums]
    .sort((a, b) => rank(a.id) - rank(b.id))
    .filter((album) => album.images.length > 0)
    .map((album) => {
      const override = COVER_OVERRIDES[album.id];
      const cover = override && album.images.some((img) => img.filename === override) ? override : album.cover;
      return {
        href: `/photos/${encodeURIComponent(album.id)}`,
        title: album.title,
        cover: `/photos/${encodeURIComponent(album.id)}/${encodeURIComponent(cover)}`,
        count: album.images.length,
      };
    });
  const frames = albums.reduce((sum, album) => sum + album.images.length, 0);

  return (
    <div className="home">
      <HomeDoors
        photos={photos}
        essay={
          latest && {
            href: latest.href,
            title: latest.title,
            dek: latest.summary,
            excerpt: latest.opening,
            date: latest.date,
            readTime: latest.readTime,
            image: latest.image,
            category: latest.category,
          }
        }
        counts={{ essays: posts.length, labs: labs.total, albums: homeAlbums.length }}
      />
      <HomeWriting lead={lead ?? latest} cards={cards} rows={rows} />
      <HomeLabs bento={labs.bento} rows={labs.rows} total={labs.total} />
      <AlbumStrip albums={homeAlbums} frames={frames} />
    </div>
  );
}
