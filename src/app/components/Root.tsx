import { NavLink, Outlet } from "react-router";

const link = (isActive: boolean): React.CSSProperties => ({
  textDecoration: isActive ? "underline" : "none",
  color: "rgba(0, 0, 0, 0.5)",
});

export function Root() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f0",
      color: "rgba(0, 0, 0, 0.5)",
      fontSize: "11px",
      fontFamily: "'Neue Haas Grotesk Text', 'NeueHaasGroteskText', 'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      <header className="site-nav" style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        background: "#f5f5f0",
        padding: "14px 16px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        alignItems: "center",
      }}>
        {/* Col 1 — name */}
        <NavLink to="/" className="nav-name" style={{ textDecoration: "none", color: "rgba(0, 0, 0, 0.5)" }}>
          Charlotte Mandell
        </NavLink>

        {/* Col 2 — empty (hidden on mobile) */}
        <div className="nav-empty" />

        {/* Col 3 — page links */}
        <div className="nav-pages">
          <NavLink to="/music" style={({ isActive }) => link(isActive)}>Music</NavLink>
          <span className="nav-sep" style={{ color: "rgba(0, 0, 0, 0.5)" }}>,&nbsp;</span>
          <NavLink to="/work" style={({ isActive }) => link(isActive)}>Work</NavLink>
          <span className="nav-sep" style={{ color: "rgba(0, 0, 0, 0.5)" }}>,&nbsp;</span>
          <NavLink to="/blog" style={({ isActive }) => link(isActive)}>Blog</NavLink>
        </div>

        {/* Col 4 — utility links */}
        <div className="nav-util" style={{ textAlign: "right" }}>
          <NavLink to="/info" style={({ isActive }) => link(isActive)}>Information</NavLink>
          <span className="nav-sep" style={{ color: "rgba(0, 0, 0, 0.5)" }}>,&nbsp;</span>
          <a href="mailto:charlotte@odyxxey.com" style={{ textDecoration: "none", color: "rgba(0, 0, 0, 0.5)" }}>Email</a>
          <span className="nav-sep" style={{ color: "rgba(0, 0, 0, 0.5)" }}>,&nbsp;</span>
          <a href="https://instagram.com/virginia_waters" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "rgba(0, 0, 0, 0.5)" }}>Instagram</a>
          <span className="nav-arrow" style={{ color: "rgba(0, 0, 0, 0.5)" }}>&nbsp;↗︎</span>
        </div>
      </header>

      <main style={{ paddingBottom: "calc(4 * 1.7 * 13px * 4)" }}>
        <Outlet />
      </main>

      <footer style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        padding: "14px 16px",
        color: "rgba(0, 0, 0, 0.5)",
        fontSize: "11px",
        background: "#f5f5f0",
        pointerEvents: "none",
      }}>
        Last Updated: 16-06-2026
      </footer>
    </div>
  );
}
