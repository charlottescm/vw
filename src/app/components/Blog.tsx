import { useEffect, useState } from "react";
import { Link } from "react-router";

interface Post {
  id: number;
  title: string;
  slug: string;
  post_date: string;
  canonical_url: string;
  description: string;
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

function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    window.open(
      `https://departurelounge.substack.com/subscribe?email=${encodeURIComponent(email)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setStatus("success");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {status === "success" ? (
        <div style={txt}>Check your inbox to confirm.</div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              fontSize: "11px",
              color: "rgba(0, 0, 0, 0.5)",
              background: "transparent",
              border: "none",
              borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
              outline: "none",
              padding: "2px 0",
              fontFamily: "inherit",
              width: "100%",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              ...txt,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              textDecoration: "underline",
              fontWeight: "normal",
            }}
          >
            {status === "loading" ? "Subscribing…" : "Subscribe"}
          </button>
          {status === "error" && <div style={txt}>Something went wrong. Try again.</div>}
        </form>
      )}
    </div>
  );
}

const STATIC_POSTS: Post[] = [
  { id: 0, title: "05 | Brussels is two hours away", slug: "brussels-is-two-hours-away", post_date: "Sun, 28 Jun 2026 21:38:58 GMT", canonical_url: "https://departurelounge.substack.com/p/brussels-is-two-hours-away", description: "" },
  { id: 1, title: "04 | You are not a machine", slug: "04-you-are-not-a-machine", post_date: "Fri, 03 Oct 2025 15:54:12 GMT", canonical_url: "https://departurelounge.substack.com/p/04-you-are-not-a-machine", description: "" },
  { id: 2, title: "03 | Without producers landlords would be fucked", slug: "03-without-producers-landlords-would", post_date: "Wed, 13 Mar 2024 23:26:49 GMT", canonical_url: "https://departurelounge.substack.com/p/03-without-producers-landlords-would", description: "" },
  { id: 3, title: "02 | The Internet as a City", slug: "02-the-internet-as-a-city", post_date: "Fri, 08 Mar 2024 00:07:34 GMT", canonical_url: "https://departurelounge.substack.com/p/02-the-internet-as-a-city", description: "" },
  { id: 4, title: "01 | Departure Lounge", slug: "departure-lounge-01", post_date: "Tue, 27 Feb 2024 15:31:20 GMT", canonical_url: "https://departurelounge.substack.com/p/departure-lounge-01", description: "" },
];

export function Blog() {
  const [posts, setPosts] = useState<Post[]>(STATIC_POSTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const FEED = "https://departurelounge.substack.com/feed";

    const parseFeed = (xml: string) => {
      const doc = new DOMParser().parseFromString(xml, "text/xml");
      const items = Array.from(doc.getElementsByTagName("item"));
      if (!items.length) return null;
      return items.map((item, i) => {
        const tag = (name: string) => item.getElementsByTagName(name)[0]?.textContent?.trim() ?? "";
        const link = tag("link") || item.querySelector("guid")?.textContent?.trim() || "";
        const slug = link.split("/p/")[1]?.split("?")[0] ?? String(i);
        return { id: i, title: tag("title"), slug, post_date: tag("pubDate"), canonical_url: link, description: "" };
      });
    };

    if (window.location.hostname.includes("figma.site")) return;

    (async () => {
      // 1. allorigins proxy (avoids CORS, most reliable)
      let result = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(FEED)}`, { cache: "no-store" })
        .then(r => r.json())
        .then(d => parseFeed(d.contents ?? ""))
        .catch(() => null);

      // 2. rss2json
      if (!result?.length) result = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(FEED)}`, { cache: "no-store" }
      ).then(r => r.json())
        .then(d => d.status === "ok" ? d.items.map((p: {title:string;link:string;pubDate:string}, i:number) => ({
          id: i, title: p.title, slug: p.link.split("/p/")[1]?.split("?")[0] ?? String(i),
          post_date: p.pubDate, canonical_url: p.link, description: "",
        })) : null)
        .catch(() => null);

      // 3. Direct fetch
      if (!result?.length) result = await fetch(FEED, { cache: "no-store" })
        .then(r => r.text()).then(parseFeed).catch(() => null);

      if (Array.isArray(result) && result.length > 0) setPosts(result);
    })();
  }, []);

  return (
    <div style={{
      paddingTop: "calc(50vh)",
      paddingLeft: "16px",
      paddingRight: "16px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
      columnGap: 0,
      alignItems: "start",
    }} className="blog-grid">
      {/* Col 1 — post list */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {loading && <div style={txt}>Loading…</div>}
        {posts.map((post) => (
          <div key={post.id} style={{ marginBottom: "2px" }}>
            <Link
              to={`/blog/${post.slug}`}
              style={{ ...txt, textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              {post.title}
            </Link>
            <span className="blog-date-mobile" style={{ ...txt, display: "none" }}>
              &nbsp;— {formatDate(post.post_date)}
            </span>
          </div>
        ))}
      </div>

      {/* Col 2 — dates (hidden on mobile) */}
      <div className="blog-dates-desktop" style={{ display: "flex", flexDirection: "column" }}>
        {posts.map((post) => (
          <div key={post.id} style={{ ...txt, marginBottom: "2px" }}>
            {formatDate(post.post_date)}
          </div>
        ))}
      </div>

      <div className="blog-dates-desktop" />
      <div className="blog-dates-desktop" />

      {/* Subscribe — spans col 1, below posts */}
      <div style={{ gridColumn: "1 / 2", marginTop: "32px" }} className="blog-subscribe">
        <SubscribeForm />
        <div style={{ marginTop: "16px" }}>
          <a
            href="https://departurelounge.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...txt, textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            View posts on Substack {"↗︎"}
          </a>
        </div>
      </div>
    </div>
  );
}
