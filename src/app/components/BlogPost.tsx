import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router";
import { BLOG_POST_BODIES } from "../data/blogPosts";

interface Post {
  id: number;
  title: string;
  slug: string;
  post_date: string;
  body_html: string;
  canonical_url: string;
}

const txt: React.CSSProperties = {
  fontSize: "11px",
  color: "rgba(0, 0, 0, 0.5)",
  lineHeight: "1.7",
  margin: 0,
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "-");
}

function preprocessHTML(html: string): string {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild!;

  // Unwrap every <a> that contains an <img>
  root.querySelectorAll("a").forEach((a) => {
    if (a.querySelector("img")) {
      const parent = a.parentNode!;
      while (a.firstChild) parent.insertBefore(a.firstChild, a);
      parent.removeChild(a);
    } else {
      // Remove links whose visible text is only arrows/whitespace
      const text = (a.textContent ?? "").trim();
      if (!text || /^[↗→↑↪\s]+$/.test(text)) {
        a.remove();
      } else {
        // Force remaining text links to open in a new tab
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    }
  });

  // Remove any Substack "expand" button elements
  root.querySelectorAll("[class*='expand'], [class*='image-link']").forEach((el) => el.remove());

  return root.innerHTML;
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        background: "rgba(245,245,240,0.6)",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
        <img
          src={src}
          alt=""
          style={{ maxWidth: "90vw", maxHeight: "90vh", width: "auto", height: "auto", display: "block" }}
        />
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "10px", right: "10px",
            background: "none", border: "none", cursor: "pointer",
            fontSize: "11px", color: "rgba(0,0,0,0.5)", lineHeight: 1, padding: "4px",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}


export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const staticData = slug ? BLOG_POST_BODIES[slug] : null;
  const [post, setPost] = useState<Post | null>(
    staticData ? { id: 0, ...staticData } : null
  );
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  useEffect(() => {
    const parseFeed = (xml: string): Post[] | null => {
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const items = Array.from(doc.getElementsByTagName("item"));
      if (!items.length) return null;
      return items.map((item, i) => {
        const tag = (name: string) => item.getElementsByTagName(name)[0]?.textContent?.trim() ?? "";
        const link = tag("link") || item.querySelector("guid")?.textContent?.trim() || "";
        const slug = link.split("/p/")[1]?.split("?")[0] ?? String(i);
        // content:encoded is namespaced — try both
        const body = item.getElementsByTagName("content:encoded")[0]?.textContent
          ?? item.getElementsByTagName("encoded")[0]?.textContent
          ?? tag("description");
        return { id: i, title: tag("title"), slug, post_date: tag("pubDate"), canonical_url: link, body_html: body };
      });
    };

    setLoading(false);
    if (window.location.hostname.includes("figma.site")) return;

    const FEED = "https://departurelounge.substack.com/feed";

    (async () => {
      // 1. allorigins proxy (avoids CORS)
      let posts: Post[] | null = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED)}`, { cache: "no-store" })
        .then(r => r.json()).then(d => parseFeed(d.contents ?? "")).catch(() => null);

      // 2. rss2json
      if (!posts?.length) posts = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED)}`, { cache: "no-store" }
      ).then(r => r.json())
        .then(d => d.status === "ok" ? d.items.map((p: {title:string;link:string;pubDate:string;content:string}, i:number) => ({
          id: i, title: p.title, slug: p.link.split("/p/")[1]?.split("?")[0] ?? String(i),
          post_date: p.pubDate, canonical_url: p.link, body_html: p.content ?? "",
        })) : null).catch(() => null);

      // 3. Direct fetch
      if (!posts?.length) posts = await fetch(FEED, { cache: "no-store" })
        .then(r => r.text()).then(parseFeed).catch(() => null);

      setPost(Array.isArray(posts) ? (posts.find(p => p.slug === slug) ?? null) : null);
      setLoading(false);
    })();
  }, [slug]);

  function handleContentClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const img = target.closest("img") as HTMLImageElement | null;
    const anchor = target.closest("a") as HTMLAnchorElement | null;

    if (img) {
      e.preventDefault();
      e.stopPropagation();
      setLightboxSrc(img.src);
      return;
    }

    if (anchor) {
      // Force external open, prevent React Router from catching it
      e.preventDefault();
      e.stopPropagation();
      const href = anchor.getAttribute("href");
      if (href) window.open(href, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div style={{ paddingTop: "calc(50vh)", paddingLeft: "16px", paddingRight: "16px", paddingBottom: "32px" }}>
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={closeLightbox} />}

      <div className="blogpost-header" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", columnGap: 0, marginBottom: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Link
            to="/blog"
            style={{ ...txt, textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            {"←︎ Blog"}
          </Link>
          {post && <div style={txt}>{formatDate(post.post_date)}</div>}
        </div>
      </div>

      {post && (
        <div className="blogpost-content" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", columnGap: 0 }}>
          <div className="blogpost-body" style={{ gridColumn: "1 / 3", paddingRight: "20px" }}>
            <div style={{ ...txt, marginBottom: "16px" }}>{post.title}</div>
            {post.body_html ? (
              <div
                className="blog-content"
                style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", lineHeight: "1.7" }}
                onClick={handleContentClick}
                dangerouslySetInnerHTML={{ __html: preprocessHTML(post.body_html) }}
              />
            ) : (
              <a
                href={post.canonical_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...txt, textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Read on Substack {"↗︎"}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
