import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

export default function NotFound() {
  return (
    <section className="section container notfound">
      <Seo
        title="Page Not Found | She's On First"
        description="The requested page could not be found."
        path={window.location.pathname}
        noindex
      />
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
