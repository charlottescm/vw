export function Music() {
  const soloReleases = [
    { title: "Naked", url: "https://odyxxey.sup.nr/naked" },
    { title: "brecht", url: "https://virginia-waters.bandcamp.com/track/brecht" },
    { title: "demo tape", url: "https://virginia-waters.bandcamp.com/track/demo-tape" },
    { title: "Mixes", url: "https://soundcloud.com/ao3291/sets/mixes" },
  ];

  const collabReleases = [
    { title: "w/ RIP DRARI", url: "https://soundcloud.com/seedy-executive-type" },
  ];

  const pastShows = [
    "17-12-25 Forestlimit, Tokyo [Live]",
    "18-12-25 SPREAD, Tokyo [DJ set]",
    "05-06-25 Ormside Projects, London [DJ set]",
    "26-04-25 Ausstellungsraum Klingenthal, Basel [Sound Install]",
    "19-04-25 Ormside Projects, London [DJ set]",
    "19-10-24 Radion, Amsterdam [Live]",
    "17-10-24 Ormside Projects, London [Live]",
    "03-10-24 Salon des Amateurs, Düsseldorf [Live]",
    "06-07-24 Le Point Ephémère, Paris [DJ set]",
    "03-07-24 Loki, London [DJ set]",
    "05-06-24 Spanners, London [Live]",
    "28-03-24 Loki, London [DJ set]",
    "06-03-24 Spanners, London [DJ set]",
    "30-11-23 Venue MOT, London [Live]",
    "01-11-23 Peckham Audio, London [DJ set]",
    "26-10-23 IOActive, London [DJ set]",
    "28-09-23 IOActive, London [DJ set & Elevator Soundtracking]",
    "31-08-23 IOActive, London [DJ set]",
    "03-08-23 IOActive, London [DJ set]",
    "06-07-23 Telegrafía, London [DJ set]",
    "14-06-23 Spanners, London [DJ set]",
    "25-05-23 IOActive, London [DJ set]",
    "28-03-23 IOActive, London [Elevator Soundtracking]",
    "23-02-23 IOActive, London [Elevator Soundtracking]",
    "15-12-22 Ormside Projects, London [Live w/ Choir]",
    "21-10-22 HQI, London [Live]",
    "06-05-22 Secret Location, London [Live w/ Band]",
    "02-10-21 HQI, London [DJ/Live]",
  ];

  const text: React.CSSProperties = {
    fontSize: "11px",
    color: "rgba(0, 0, 0, 0.5)",
    lineHeight: "1.7",
  };

  const linkStyle: React.CSSProperties = {
    ...text,
    textDecoration: "none",
    color: "rgba(0, 0, 0, 0.5)",
  };

  return (
    <div className="music-grid" style={{
      paddingTop: "calc(50vh)",
      paddingLeft: "16px",
      paddingRight: "16px",
      paddingBottom: "0",
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
      alignItems: "start",
    }}>
      {/* Col 1 — Solo Releases */}
      <div>
        <div style={text}>Solo Releases</div>
        <div style={{ marginTop: "4px" }}>
          {soloReleases.map((r) => (
            <div key={r.title}>
              <a href={r.url} style={linkStyle}>{r.title}{" ↗︎"}</a>
            </div>
          ))}
        </div>
      </div>

      {/* Col 2 — Collab Releases */}
      <div>
        <div style={text}>Collab Releases</div>
        <div style={{ marginTop: "4px" }}>
          {collabReleases.map((r) => (
            <div key={r.title}>
              <a href={r.url} style={linkStyle}>{r.title}{" ↗︎"}</a>
            </div>
          ))}
        </div>
      </div>

      {/* Col 3 — Upcoming shows */}
      <div>
        <div style={text}>Upcoming shows</div>
        <div style={{ marginTop: "4px" }}>
          <div style={text}>-</div>
        </div>
      </div>

      {/* Col 4 — Past shows */}
      <div>
        <div style={text}>Past shows</div>
        <div style={{ marginTop: "4px" }}>
          {pastShows.map((s, i) => (
            <div key={i} style={text}>{s}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
