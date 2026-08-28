import { Link } from 'react-router-dom'
import Seo from '../components/Seo'

export default function About() {
  return (
    <>
      <Seo
        title="Our Mission | She's On First"
        description="Why She's On First is building a sourced, independent record of women’s baseball and the WPBL’s Inaugural 60."
        path="/about"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: "Our Mission — She's On First",
          url: 'https://shesonfirst.com/about',
        }}
      />
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
              Alongside player profiles and stories, She&rsquo;s On First is building a
              trustworthy record of the WPBL&mdash;its players, rosters, games, and statistics.
              We preserve where information came from, when it was checked, and where sources
              disagree, with human review before anything is published. The goal is to make
              women&rsquo;s baseball easier to follow, report on, and understand.
            </p>
            <p>
              This is where their story gets written down, followed, and carried forward. We start with sixty,
              and we don&rsquo;t plan to stop there. <span className="grad-text">First base was never the finish line.</span>
            </p>

            <div className="about-cta">
              <Link to="/inaugural-60" className="btn btn-primary">Meet the Inaugural 60</Link>
              <Link to="/blog" className="btn btn-ghost">Read Project Notes</Link>
            </div>

            <section className="founder-card panel" aria-labelledby="founder-heading">
              <div className="founder-portrait">
                <img
                  src="/kristy-founder-portrait-v2.png"
                  alt="Comic-style illustrated portrait of Kristy against neon baseball graphics"
                />
              </div>
              <div className="founder-copy">
                <span className="eyebrow">Behind the project</span>
                <h2 id="founder-heading">Meet Kristy</h2>
                <p>
                  She&rsquo;s On First was founded by Kristy, whose career in women&rsquo;s
                  sports began in her twenties with the WTA Tour. Her first job took her
                  to tournaments around the world, where she managed competition data and
                  produced statistics for the media. Today, as founder of K10 Labs and the
                  builder behind Shufflr, WoSoLive, and WoSpo, she continues turning
                  overlooked sports information into useful products and trustworthy public
                  records.
                </p>
                <p>
                  Baseball and soccer are also part of everyday life for Kristy and her
                  wife&mdash;the sports they follow, talk about, and love together. She&rsquo;s
                  On First brings that shared fandom together with Kristy&rsquo;s background in
                  sports data and public records.
                </p>
              </div>
            </section>

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
