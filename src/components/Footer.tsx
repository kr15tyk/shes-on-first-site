import { Link } from 'react-router-dom'

import InstagramLink from './InstagramLink'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src="/logo-lockup-sm.png?v=21e762b" alt="She's On First" className="footer-logo" />
          <p className="muted">
            Independent documentation of women&rsquo;s baseball history.
          </p>
        </div>

        <div className="footer-cols">
          <div>
            <h4>Explore</h4>
            <Link to="/inaugural-60">The Inaugural 60</Link>
            <Link to="/schedule">Schedule</Link>
            <Link to="/leaders">Leaders</Link>
            <Link to="/blog">Project Notes</Link>
            <Link to="/about">Our Mission</Link>
          </div>
          <div>
            <h4>Connect</h4>
            <Link to={{ pathname: '/', hash: '#newsletter' }}>Updates</Link>
            <InstagramLink label="Instagram · @sheson1st" />
            <a href="mailto:baseball@shesonfirst.com">baseball@shesonfirst.com</a>
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
