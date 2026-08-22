import { Link } from 'react-router-dom'

// Add the project's profile URL here when the Instagram account is ready.
const instagramUrl = ''

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
            <Link to="/about">About &amp; Mission</Link>
          </div>
          <div>
            <h4>Connect</h4>
            <Link to={{ pathname: '/', hash: '#newsletter' }}>Updates</Link>
            {instagramUrl ? (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
            ) : (
              <span className="footer-note">Instagram · coming soon</span>
            )}
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
