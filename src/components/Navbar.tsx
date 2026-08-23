import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'

const links = [
  { to: '/inaugural-60', label: 'The Inaugural 60' },
  { to: '/blog', label: 'Project Notes' },
  { to: '/about', label: 'Our Mission' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <img src="/nav-badge.png?v=21e762b" alt="" className="brand-badge" />
          <span className="brand-word">
            She&rsquo;s On First
            <em>Women&rsquo;s Baseball</em>
          </span>
        </Link>

        <nav className={`nav-links ${open ? 'is-open' : ''}`} aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
          <Link to={{ pathname: '/', hash: '#newsletter' }} className="btn btn-primary nav-cta" onClick={() => setOpen(false)}>
            Updates
          </Link>
        </nav>

        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
