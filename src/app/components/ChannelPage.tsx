import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router";
import plnCover from "../../imports/7F92D84F-2CF2-4330-953F-48563F10651D.jpeg";

interface ArenaBlock {
  id: number;
  title: string;
  class: string;
  description?: string;
  content?: string;
  image?: {
    original: { url: string };
    large: { url: string };
    display: { url: string };
    thumb: { url: string };
  };
  embed?: {
    html?: string;
    url?: string;
    type?: string;
    width?: number;
    height?: number;
  };
  source?: {
    url: string;
    title?: string;
  };
  attachment?: {
    url: string;
    content_type: string;
    file_name: string;
  };
}

interface ArenaChannel {
  title: string;
  slug: string;
  length: number;
  contents: ArenaBlock[];
}

const txt: React.CSSProperties = {
  fontSize: "11px",
  color: "rgba(0, 0, 0, 0.5)",
  lineHeight: "1.7",
  margin: 0,
};

const MEDIA_HEIGHT = 220;

function stripExtension(title: string): string {
  if (!title) return "";
  return title.replace(/\.(jpe?g|png|gif|webp|svg|tiff?|bmp|mp4|mov|avi|mkv)$/i, "");
}

function meaningfulTitle(title: string): string {
  const stripped = stripExtension(title);
  if (!stripped) return "";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stripped)) return "";
  if (/^[0-9a-f]{24,}$/i.test(stripped)) return "";
  return stripped;
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

const DISPLAY_NAMES: Record<string, string> = {
  "odyxxey": "odyxxey",
  "curation and programming": "Curation and Cultural Programming",
};

function formatChannelTitle(decoded: string): string {
  const key = decoded.toLowerCase();
  if (DISPLAY_NAMES[key]) return DISPLAY_NAMES[key];
  return toTitleCase(decoded);
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

type TitleMode = "normal" | "strip" | "none";

// ─── Lightbox ────────────────────────────────────────────────────────────────

function LightboxOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
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
        {children}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "10px", right: "10px",
            background: "none", border: "none", cursor: "pointer",
            fontSize: "11px", color: "rgba(0, 0, 0, 0.5)", lineHeight: 1, padding: "4px",
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <LightboxOverlay onClose={onClose}>
      <img src={src} alt={alt} style={{ maxWidth: "90vw", maxHeight: "90vh", width: "auto", height: "auto", display: "block" }} />
    </LightboxOverlay>
  );
}

function VideoLightbox({ block, onClose }: { block: ArenaBlock; onClose: () => void }) {
  const isQuickTime = block.attachment?.content_type === "video/quicktime";
  return (
    <LightboxOverlay onClose={onClose}>
      <video
        key={block.id}
        controls
        autoPlay
        playsInline
        style={{ maxWidth: "90vw", maxHeight: "90vh", width: "auto", height: "auto", display: "block" }}
        poster={block.image?.large.url}
      >
        {isQuickTime && <source src={block.attachment!.url} type="video/mp4" />}
        <source src={block.attachment!.url} type={block.attachment!.content_type} />
      </video>
    </LightboxOverlay>
  );
}

function EmbedLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <LightboxOverlay onClose={onClose}>
      <div style={{ width: "80vw", maxWidth: "960px", aspectRatio: "16/9" }}>
        <iframe
          src={src}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ display: "block" }}
        />
      </div>
    </LightboxOverlay>
  );
}

function resolveTitle(raw: string, mode: TitleMode): string {
  if (mode === "none") return "";
  const decoded = decodeEntities(raw);
  if (mode === "strip") return stripExtension(decoded);
  return meaningfulTitle(decoded);
}

// ─── Video player (used in both playlist and standard grid) ──────────────────

function VideoPlayer({ block, height }: { block: ArenaBlock; height?: number }) {
  const h = height ?? MEDIA_HEIGHT;

  if (block.class === "Attachment" && block.attachment?.content_type.startsWith("video/")) {
    const isQuickTime = block.attachment.content_type === "video/quicktime";
    return (
      <video
        key={block.id}
        controls
        playsInline
        style={{ width: "100%", height: `${h}px`, display: "block", objectFit: "contain", background: "#e8e8e3" }}
        poster={block.image?.large.url}
      >
        {isQuickTime && <source src={block.attachment.url} type="video/mp4" />}
        <source src={block.attachment.url} type={block.attachment.content_type} />
      </video>
    );
  }

  if (block.class === "Media" && block.embed?.html) {
    const srcMatch = block.embed.html.match(/src=["']([^"']+)["']/);
    const src = srcMatch?.[1];
    return (
      <div style={{ height: `${h}px`, overflow: "hidden" }}>
        {src ? (
          <iframe
            src={src}
            width="100%"
            height={h}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{ display: "block" }}
          />
        ) : (
          <div
            style={{ width: "100%", height: "100%" }}
            dangerouslySetInnerHTML={{ __html: block.embed.html }}
          />
        )}
      </div>
    );
  }

  return null;
}

// ─── Video playlist layout ───────────────────────────────────────────────────

function VideoPlaylist({ blocks }: { blocks: ArenaBlock[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [descOpen, setDescOpen] = useState(false);
  const active = blocks[activeIdx];

  return (
    <div className="video-playlist-grid" style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
      columnGap: 0,
      alignItems: "start",
    }}>
      {/* Main player — col 1+2 */}
      <div className="video-player-col" style={{ gridColumn: "1 / 3", paddingRight: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {active && (
          <>
            <VideoPlayer block={active} height={320} />
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
              <div style={txt}>{resolveTitle(active.title, "normal") || active.title}</div>
              {active.description && (
                <button
                  onClick={() => setDescOpen((v) => !v)}
                  style={{ ...txt, background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}
                >
                  {descOpen ? "−" : "+"}
                </button>
              )}
            </div>
            {descOpen && active.description && (
              <div style={txt}>{decodeEntities(active.description)}</div>
            )}
          </>
        )}
      </div>

      {/* Playlist — col 3+4 */}
      <div className="video-list-col" style={{ gridColumn: "3 / 5", display: "flex", flexDirection: "column", gap: "0" }}>
        {blocks.map((block, i) => {
          const title = resolveTitle(block.title, "normal") || block.title;
          const isActive = i === activeIdx;
          return (
            <div
              key={block.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                paddingBottom: "16px",
                borderBottom: "none",
                opacity: isActive ? 1 : 0.6,
              }}
            >
              {block.image && (
                <img
                  src={block.image.thumb.url}
                  alt={title}
                  style={{ width: "80px", flexShrink: 0, height: "50px", objectFit: "cover", display: "block" }}
                />
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={txt}>{title}</div>
                {!isActive && (
                  <button
                    onClick={() => { setActiveIdx(i); setDescOpen(false); }}
                    style={{ ...txt, background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline", textAlign: "left" }}
                  >
                    Watch
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Standard block grid ─────────────────────────────────────────────────────

function Block({
  block,
  hideDescription,
  titleMode,
  showSoundCloudDescriptions,
}: {
  block: ArenaBlock;
  hideDescription: boolean;
  titleMode: TitleMode;
  showSoundCloudDescriptions?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const closeLightbox = useCallback(() => setLightbox(false), []);
  const title = resolveTitle(block.title, titleMode);
  const hasDescription = !hideDescription && !!block.description;

  // Video attachment
  if (block.class === "Attachment" && block.attachment?.content_type.startsWith("video/")) {
    const isQuickTime = block.attachment.content_type === "video/quicktime";
    return (
      <>
        {lightbox && <VideoLightbox block={block} onClose={closeLightbox} />}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setLightbox(true)}>
            <video
              key={block.id}
              controls
              playsInline
              style={{ width: "100%", height: "auto", maxHeight: `${MEDIA_HEIGHT}px`, display: "block", pointerEvents: "none" }}
              poster={block.image?.large.url}
            >
              {isQuickTime && <source src={block.attachment.url} type="video/mp4" />}
              <source src={block.attachment.url} type={block.attachment.content_type} />
            </video>
          </div>
          <TitleRow title={title} hasDescription={hasDescription} open={open} setOpen={setOpen} />
          {open && block.description && <div style={txt}>{decodeEntities(block.description)}</div>}
        </div>
      </>
    );
  }

  // Audio attachment
  if (block.class === "Attachment" && block.attachment?.content_type.startsWith("audio/")) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <audio controls style={{ width: "100%", display: "block" }}>
          <source src={block.attachment.url} type={block.attachment.content_type} />
        </audio>
        <TitleRow title={title} hasDescription={hasDescription} open={open} setOpen={setOpen} />
        {open && block.description && <div style={txt}>{decodeEntities(block.description)}</div>}
      </div>
    );
  }

  if (block.class === "Media" && block.embed?.html) {
    const ratio =
      block.embed.height && block.embed.width ? block.embed.height / block.embed.width : 9 / 16;
    const h = MEDIA_HEIGHT;
    const srcMatch = block.embed.html.match(/src=["']([^"']+)["']/);
    const src = srcMatch?.[1];
    const isSoundCloud = !!(src?.includes("soundcloud.com") || block.source?.url?.includes("soundcloud.com"));
    const isSoundCloudPlaylist = isSoundCloud && !!(block.source?.url?.includes("/sets/"));
    const isVideo = block.embed.type === "video" || (!isSoundCloud && src?.includes("vimeo") || src?.includes("youtube") || src?.includes("youtu.be"));
    const showDescription = hasDescription && (!isSoundCloud || !!showSoundCloudDescriptions);

    // SoundCloud playlist — show cover image + link instead of embed
    if (isSoundCloudPlaylist && block.source?.url) {
      // Use provided cover image for the P.L.N. playlist (block 35773491), else fall back to Are.na thumbnail
      const coverSrc: string = block.id === 35773491 ? plnCover : (block.image?.large.url ?? plnCover);
      const coverOriginal: string = block.id === 35773491 ? plnCover : (block.image?.original.url ?? plnCover);
      return (
        <>
          {lightbox && <Lightbox src={coverOriginal} alt={title} onClose={closeLightbox} />}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ height: `${MEDIA_HEIGHT}px`, display: "flex", alignItems: "flex-start" }}>
              <img
                src={coverSrc}
                alt={title}
                onClick={() => setLightbox(true)}
                style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", display: "block", cursor: "pointer" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
              {title && <div style={txt}>{title}</div>}
              <a
                href={block.source.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...txt, textDecoration: "none", flexShrink: 0 }}
              >
                {"↗︎"}
              </a>
            </div>
          </div>
        </>
      );
    }

    // For SoundCloud: strip visual mode and whitespace-causing params, set bg to page colour
    const cleanSrc = isSoundCloud && src
      ? src
          .replace(/&?visual=true/g, "")
          .replace(/&?show_artwork=true/g, "")
          .concat("&visual=false&show_artwork=false&buying=false&sharing=false&download=false&show_playcount=false&show_user=false")
      : src;

    return (
      <>
        {lightbox && src && <EmbedLightbox src={src} onClose={closeLightbox} />}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div
            style={{ width: "100%", aspectRatio: `${1 / ratio}`, maxHeight: `${h}px`, overflow: "hidden", cursor: isVideo ? "pointer" : "default", background: isSoundCloud ? "#f5f5f0" : undefined }}
            onClick={isVideo && src ? () => setLightbox(true) : undefined}
          >
            {cleanSrc ? (
              <iframe
                src={cleanSrc}
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                style={{ display: "block", pointerEvents: isVideo ? "none" : "auto", background: "transparent" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%" }} dangerouslySetInnerHTML={{ __html: block.embed.html }} />
            )}
          </div>
          <TitleRow title={title} hasDescription={showDescription} open={open} setOpen={setOpen} />
          {open && showDescription && block.description && <div style={txt}>{decodeEntities(block.description)}</div>}
        </div>
      </>
    );
  }

  if (block.class === "Link" && block.source?.url) {
    return (
      <>
        {lightbox && block.image && (
          <Lightbox src={block.image.original.url} alt={title || ""} onClose={closeLightbox} />
        )}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {block.image && (
          <div style={{ height: `${MEDIA_HEIGHT}px`, display: "flex", alignItems: "flex-start" }}>
            <img
              src={block.image.display.url}
              alt={title || ""}
              onClick={() => setLightbox(true)}
              style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", display: "block", cursor: "pointer" }}
            />
          </div>
        )}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
          {title && <div style={txt}>{title}</div>}
          <a href={block.source.url} target="_blank" rel="noopener noreferrer"
            style={{ ...txt, textDecoration: "none", flexShrink: 0 }}>
            {"↗︎"}
          </a>
        </div>
        {open && block.description && <div style={txt}>{decodeEntities(block.description)}</div>}
      </div>
      </>
    );
  }

  if (block.image) {
    return (
      <>
        {lightbox && (
          <Lightbox src={block.image.original.url} alt={title || ""} onClose={closeLightbox} />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ height: `${MEDIA_HEIGHT}px`, display: "flex", alignItems: "flex-start" }}>
            <img
              src={block.image.large.url}
              alt={title || ""}
              onClick={() => setLightbox(true)}
              style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", display: "block", cursor: "pointer" }}
            />
          </div>
          <TitleRow title={title} hasDescription={hasDescription} open={open} setOpen={setOpen} />
          {open && block.description && <div style={txt}>{decodeEntities(block.description)}</div>}
        </div>
      </>
    );
  }

  if (block.class === "Text" && block.content) {
    return <div style={txt} dangerouslySetInnerHTML={{ __html: block.content }} />;
  }

  return null;
}

function TitleRow({
  title,
  hasDescription,
  open,
  setOpen,
}: {
  title: string;
  hasDescription: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  if (!title && !hasDescription) return null;
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
      <div style={txt}>{title}</div>
      {hasDescription && (
        <button
          onClick={() => setOpen(!open)}
          style={{ ...txt, background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}
        >
          {open ? "−" : "+"}
        </button>
      )}
    </div>
  );
}

// ─── Data fetching ───────────────────────────────────────────────────────────

async function fetchAllBlocks(slug: string): Promise<{ channel: ArenaChannel; blocks: ArenaBlock[] }> {
  const PER = 100;
  const opts: RequestInit = { cache: "no-store" };
  const first = (await fetch(
    `https://api.are.na/v2/channels/${slug}?per=${PER}&page=1`, opts
  ).then((r) => r.json())) as ArenaChannel;
  const totalPages = Math.ceil(first.length / PER);
  if (totalPages <= 1) return { channel: first, blocks: first.contents };
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      fetch(`https://api.are.na/v2/channels/${slug}?per=${PER}&page=${i + 2}`, opts)
        .then((r) => r.json())
        .then((d: ArenaChannel) => d.contents)
    )
  );
  return { channel: first, blocks: [...first.contents, ...rest.flat()] };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function ChannelPage() {
  const { slug } = useParams<{ slug: string }>();
  const [channel, setChannel] = useState<ArenaChannel | null>(null);
  const [blocks, setBlocks] = useState<ArenaBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [odyxxeyOpen, setOdyxxeyOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setChannel(null);
    setBlocks([]);
    fetchAllBlocks(slug)
      .then(({ channel, blocks }) => {
        setChannel(channel);
        setBlocks(blocks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const slugLower = channel?.slug?.toLowerCase() ?? "";
  const titleLower = channel?.title?.toLowerCase() ?? "";

  const isGraphicResearch = slugLower.includes("graphic-research") || titleLower.includes("graphic research");
  const isGraphicArtDesign = slugLower.includes("graphic-art") || titleLower.includes("graphic art");
  const isPressChannel = slugLower.includes("press") || titleLower === "press";
  const isVideoChannel = slugLower.startsWith("video-") || titleLower === "video";
  const isImageChannel = slugLower.startsWith("image-") || titleLower === "image";
  const isOdyxxey = slugLower.includes("odyxxey") || titleLower === "odyxxey";
  const isNewestFirst = isGraphicResearch || slugLower.includes("experience-and-space") || titleLower.includes("experience and space");

  const titleMode: TitleMode = isGraphicResearch || isImageChannel ? "none" : isGraphicArtDesign ? "strip" : "normal";
  const hideDescription = isGraphicResearch || isImageChannel || isPressChannel;

  const videoBlocks = blocks.filter(
    (b) =>
      (b.class === "Media" && b.embed?.html) ||
      (b.class === "Attachment" && b.attachment?.content_type.startsWith("video/"))
  );

  const orderedBlocks = isNewestFirst ? [...blocks].reverse() : blocks;

  const standardBlocks = orderedBlocks.filter((b) => {
    if (isGraphicResearch && b.class === "Link") return false;
    return (
      b.image ||
      (b.class === "Media" && b.embed?.html) ||
      (b.class === "Link" && b.source?.url) ||
      (b.class === "Text" && b.content) ||
      (b.class === "Attachment" && (
        b.attachment?.content_type.startsWith("video/") ||
        b.attachment?.content_type.startsWith("audio/")
      ))
    );
  });

  return (
    <div style={{ paddingTop: "calc(50vh)", paddingLeft: "16px", paddingRight: "16px", paddingBottom: "32px" }}>
      {/* Header */}
      <div className="channel-header" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", columnGap: 0, marginBottom: "24px" }}>
        {/* Col 1 — back link + title (with + toggle for odyxxey) */}
        <div className="channel-title" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Link
            to="/work"
            style={{ ...txt, textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            {"←︎ Work"}
          </Link>
          {channel && (
            <div style={txt}>{formatChannelTitle(decodeEntities(channel.title))}</div>
          )}
        </div>

        {/* Cols 2–4 empty on first row */}
        {isOdyxxey && <div />}
        {isOdyxxey && <div />}
        {isOdyxxey && <div />}

        {/* Bio — spans cols 1–2 */}
        {isOdyxxey && (
          <div className="odyxxey-bio" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <p style={txt}>odyxxey is a platform for contemporary sound. It is dedicated to supporting innovative artists through release projects, weekly mix programming and periodic events.</p>
            <p style={txt}>Through its evolving lineup of guests, odyxxey has built a space which brings together mindful artists and listeners, with curatorial focus on cultural reconstruction and urban conditions.</p>
            <p style={txt}>odyxxey's work is research and design led and synthesised cross-continentally.</p>
          </div>
        )}

        {isOdyxxey && <div />}

        {/* Col 4 — Website + Instagram */}
        {isOdyxxey && (
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column" }}>
            {[
              { label: "Website",   url: "https://odyxxey.com" },
              { label: "Instagram", url: "https://instagram.com/odyxxey" },
            ].map(({ label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...txt, textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </div>

      {loading && <div style={txt}>Loading…</div>}

      {!loading && isVideoChannel && <VideoPlaylist blocks={videoBlocks} />}

      {!loading && !isVideoChannel && (
        <div className="channel-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          columnGap: 0,
          rowGap: "32px",
          alignItems: "start",
        }}>
          {standardBlocks.map((block) => (
            <div key={block.id} style={{ paddingRight: "20px" }}>
              <Block block={block} hideDescription={hideDescription} titleMode={titleMode} showSoundCloudDescriptions={isOdyxxey} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
