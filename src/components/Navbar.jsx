import React from 'react'

export default function Navbar() {
  return (
    <div>
      <nav className="navbar bg-dark border-bottom border-body" data-bs-theme="dark">
  <div className="container-fluid">
    <a className="navbar-brand">Navbar</a>
    <form className="d-flex" role="search">
      <button className="btn btn-outline-success" type="submit">Search</button>
      <button className="btn btn-outline-success" type="submit">Search</button>
    </form>
  </div>
</nav>
    </div>
  )
}
