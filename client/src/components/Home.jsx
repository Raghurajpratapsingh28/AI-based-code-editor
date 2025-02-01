

import { useState } from "react"
import Navbar from "./Navbar"

// Navbar Component


// SignUpForm Component
function SignUpForm() {
  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Sign up:", firstName, email, password)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label htmlFor="firstName" style={{ display: "block", marginBottom: "0.5rem" }}>
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          placeholder="Enter your first name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>
      <div>
        <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem" }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>
      <div>
        <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem" }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>
      <button
        type="submit"
        style={{
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Sign Up
      </button>
    </form>
  )
}

// LoginForm Component
function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Login:", email, password)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label htmlFor="loginEmail" style={{ display: "block", marginBottom: "0.5rem" }}>
          Email
        </label>
        <input
          id="loginEmail"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>
      <div>
        <label htmlFor="loginPassword" style={{ display: "block", marginBottom: "0.5rem" }}>
          Password
        </label>
        <input
          id="loginPassword"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        />
      </div>
      <button
        type="submit"
        style={{
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Login
      </button>
    </form>
  )
}

// AuthModal Component
function AuthModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("login")

  if (!isOpen) return null

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Authentication</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>
        <div style={{ display: "flex", marginBottom: "1rem" }}>
          <button
            onClick={() => setActiveTab("login")}
            style={{
              flex: 1,
              padding: "0.5rem",
              border: "none",
              borderBottom: activeTab === "login" ? "2px solid #007bff" : "2px solid transparent",
              background: "none",
              cursor: "pointer",
            }}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            style={{
              flex: 1,
              padding: "0.5rem",
              border: "none",
              borderBottom: activeTab === "signup" ? "2px solid #007bff" : "2px solid transparent",
              background: "none",
              cursor: "pointer",
            }}
          >
            Sign Up
          </button>
        </div>
        {activeTab === "login" ? <LoginForm /> : <SignUpForm />}
      </div>
    </div>
  )
}

// Main App Component
export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f0f0" }}>
      <Navbar onLoginClick={() => setIsModalOpen(true)} />
      <main style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Welcome to our App</h1>
        <p style={{ fontSize: "1.2rem" }}>This is the main content of the page.</p>
      </main>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

