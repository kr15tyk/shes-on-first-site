import { Link } from 'react-router-dom'

export default function About() {
  return (
    <>
      <section className="page-head">
        <div className="container">
          <span className="eyebrow">Why We&rsquo;re Here</span>
          <h1>Our Mission</h1>
          <p className="muted page-lede">
            An independent, sourced record of the players opening a new chapter in
            women&rsquo;s baseball.
          </p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container about-wrap">
          <div className="about-main">
            <p className="lead-para">
              She&rsquo;s On First is an independent documentation project. The Inaugural 60
              records the players reported across the four opening-day WPBL rosters while
              the authoritative cohort is still being confirmed.
            </p>
            <p>
              Women have played baseball for as long as the game has existed, and for just as long their
              stories have gone under-told. We exist to change that: to put these players on the record
              through careful sourcing, visible uncertainty, responsible image use, and
              to follow the game forward as it grows.
            </p>
            <p>
              This is where their story gets written down, followed, and carried forward. We start with sixty,
              and we don&rsquo;t plan to stop there. <span className="grad-text">First base was never the finish line.</span>
            </p>

            <div className="about-cta">
              <Link to="/inaugural-60" className="btn btn-primary">Meet the Inaugural 60</Link>
              <Link to="/blog" className="btn btn-ghost">Read Project Notes</Link>
            </div>

            <div className="about-contact" id="contact">
              <h3>Get in touch</h3>
              <p className="muted">
                Photographers, journalists, and potential collaborators are invited to
                reach out with inquiries, reporting leads, or ideas.
              </p>
              <a className="btn btn-ghost" href="mailto:baseball@shesonfirst.com">
                baseball@shesonfirst.com
              </a>
            </div>
          </div>

          <aside className="about-side">
            <div className="stat-panel panel">
              <span className="stat-num grad-text">60</span>
              <span className="stat-label">Founding players, one class</span>
            </div>
            <div className="stat-panel panel">
              <span className="stat-num grad-text">Source-<br/>backed</span>
              <span className="stat-label">Every public claim keeps its evidence</span>
            </div>
            <div className="stat-panel panel">
              <span className="stat-num grad-text">Just the<br/>beginning</span>
              <span className="stat-label">It doesn&rsquo;t end at sixty</span>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
