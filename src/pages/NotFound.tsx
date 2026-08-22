import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section container notfound">
      <span className="eyebrow">404</span>
      <h1>Caught looking.</h1>
      <p className="muted">That page isn&rsquo;t on base. Let&rsquo;s get you back to the action.</p>
      <div className="hero-cta">
        <Link to="/" className="btn btn-primary">Home</Link>
        <Link to="/inaugural-60" className="btn btn-ghost">The Inaugural 60</Link>
      </div>
    </section>
  )
}
