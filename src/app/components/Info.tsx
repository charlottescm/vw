export function Info() {
  const text: React.CSSProperties = {
    fontSize: "11px",
    color: "rgba(0, 0, 0, 0.5)",
    lineHeight: "1.7",
    margin: 0,
  };

  return (
    <div className="info-grid" style={{
      paddingTop: "calc(50vh)",
      paddingLeft: "16px",
      paddingRight: "16px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
      columnGap: 0,
      alignItems: "start",
    }}>
      {/* Col 1 — empty */}
      <div />

      {/* Col 2 — bio text */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        <p style={text}>
          Charlotte Mandell is an artist, creative director and producer based in London, relocating to Brussels in Autumn 2026.
        </p>
        <p style={{ ...text, marginTop: "10px" }}>
          She's the Founder and Director of{" "}
          <a
            href="https://odyxxey.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgba(0, 0, 0, 0.5)", textDecoration: "none" }}
          >
            odyxxey
          </a>
          , a platform for contemporary sound spanning over a decade of work across music, design and events.
        </p>
      </div>
    </div>
  );
}
