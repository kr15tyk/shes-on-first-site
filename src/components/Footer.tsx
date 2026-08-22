import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src="/logo-lockup-sm.png" alt="She's On First" className="footer-logo" />
          <p className="muted">
            Independent documentation of women&rsquo;s baseball history.
          </p>
        </div>

        <div className="footer-cols">
          <div>
            <h4>Explore</h4>
            <Link to="/inaugural-60">The Inaugural 60</Link>
            <Link to="/blog">Project Notes</Link>
            <Link to="/about">About</Link>
          </div>
          <div>
            <h4>Connect</h4>
            <Link to={{ pathname: '/', hash: '#newsletter' }}>Updates</Link>
            <Link to="/about">Our Mission</Link>
            <span className="footer-note">Contact coming soon</span>
          </div>
          <div>
            <h4>Status</h4>
            <span className="footer-note">Roster provisional</span>
            <span className="footer-note">Profiles in research</span>
            <span className="footer-note">Independent project</span>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span className="muted">© {new Date().getFullYear()} She&rsquo;s On First.</span>
        <span className="muted">Not affiliated with or endorsed by the WPBL.</span>
      </div>
    </footer>
  )
}
