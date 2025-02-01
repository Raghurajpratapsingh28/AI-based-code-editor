function Navbar({ onLoginClick }) {
    return (
      <nav style={{ backgroundColor: "#333", color: "white", padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>MyApp</span>
          <button
            onClick={onLoginClick}
            style={{
              backgroundColor: "white",
              color: "#333",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </div>
      </nav>
    )
  }

  export default Navbar;