import { useEffect, useState } from "react";
import { Link } from "react-router";

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

// Desired display order by slug, with optional display name overrides
const CHANNEL_ORDER: { slug: string; label?: string }[] = [
  { slug: "odyxxey-e4j8qr1vnpk",          label: "odyxxey" },
  { slug: "graphic-art-and-design",         label: "Graphic Art and Design" },
  { slug: "sound-np32u65udf4",              label: "Sound" },
  { slug: "graphic-research-h78zwoiqr1y",   label: "Graphic Research" },
  { slug: "video-afwkk-hfcjq",             label: "Video" },
  { slug: "curation-and-programming",       label: "Curation and Cultural Programming" },
  { slug: "experience-and-space",           label: "Experience and Space" },
  { slug: "selected-press",                 label: "Selected Press" },
];

function displayLabel(slug: string, rawTitle: string): string {
  const entry = CHANNEL_ORDER.find((c) => c.slug === slug);
  if (entry?.label) return entry.label;
  const decoded = decodeEntities(rawTitle);
  // Preserve known lowercase brands
  if (decoded.toLowerCase() === "odyxxey") return "odyxxey";
  return toTitleCase(decoded);
}

interface ArenaBlock {
  id: number;
  title: string;
  class: string;
  slug?: string;
}

interface ArenaChannel {
  title: string;
  contents: ArenaBlock[];
}

const txt: React.CSSProperties = {
  fontSize: "11px",
  color: "rgba(0, 0, 0, 0.5)",
  lineHeight: "1.7",
  margin: 0,
};

export function Work() {
  const [channel, setChannel] = useState<ArenaChannel | null>(null);

  useEffect(() => {
    fetch("https://api.are.na/v2/channels/work-fvv8x5ph5_0?per=100", { cache: "no-store" })
      .then((r) => r.json())
      .then(setChannel)
      .catch(() => {});
  }, []);

  const rawChannels = channel?.contents.filter((b) => b.class === "Channel") ?? [];

  // Sort by CHANNEL_ORDER; omit channels not in the list
  const orderedChannels = CHANNEL_ORDER
    .map((entry) => rawChannels.find((c) => c.slug === entry.slug))
    .filter((c): c is ArenaBlock => !!c);

  return (
    <div style={{
      paddingTop: "calc(50vh)",
      paddingLeft: "16px",
      paddingRight: "16px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
      columnGap: 0,
      alignItems: "start",
    }}>
      {/* Col 1 — About */}
      <div className="work-about" style={{ display: "flex", flexDirection: "column", gap: "10px", paddingRight: "20px" }}>
        <div style={txt}>About</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={txt}>
            I offer creative and strategic direction, design and caretaking to artists and teams across contemporary music, fashion and tech.
          </p>
          <div style={txt}>
            <div>I bring:</div>
            <div>• 11+ years in music curation, A&R scouting, artist development, brand building, multimedia design, project management &amp; events</div>
            <div>• 6+ years leading a small team with a research-led practice</div>
            <div>• 2+ years in music video direction</div>
            <div>• 1+ year designing strategic operational systems in a tech startup</div>
          </div>
          <div style={txt}>
            <div>Currently available for:</div>
            <div>• Part-time remote roles</div>
            <div>• Consultancy</div>
            <div>• Project-based work in London or Brussels</div>
          </div>
        </div>
      </div>

      {/* Col 2 — empty */}
      <div className="work-empty" />

      {/* Col 3 — Work page links */}
      <div className="work-links" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={txt}>Work</div>
        <div>
          {orderedChannels.length === 0 && (
            <div style={{ ...txt, color: "#999" }}>Loading…</div>
          )}
          {orderedChannels.map((ch) => (
            <div key={ch.id}>
              <Link
                to={`/work/${ch.slug}`}
                style={{ ...txt, textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                {displayLabel(ch.slug!, ch.title)}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
