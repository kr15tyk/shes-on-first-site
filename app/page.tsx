export default function Home() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label="She's On First home">
          <img src="/sof-logo.png" alt="" />
          <span>
            <strong>She&apos;s On First</strong>
            <small>Women&apos;s baseball media</small>
          </span>
        </a>

        <nav aria-label="Primary navigation">
          <a href="#inaugural-60">Inaugural 60</a>
          <a href="#standards">Our standards</a>
          <a href="#about">About</a>
        </nav>

        <a className="header-cta" href="#inaugural-60">
          Meet the players
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />

        <div className="hero-copy">
          <p className="eyebrow">
            <span /> Independent women&apos;s baseball media
          </p>
          <h1>
            Meet the players
            <em>making baseball history.</em>
          </h1>
          <p className="hero-intro">
            She&apos;s On First is documenting the first 60 players in Women&apos;s
            Pro Baseball League history through sourced profiles, structured
            data, and public-knowledge work.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#inaugural-60">
              Explore the Inaugural 60 <span aria-hidden="true">↗</span>
            </a>
            <a className="button button-secondary" href="#standards">
              See how we source stories
            </a>
          </div>

          <div className="hero-stats" id="inaugural-60">
            <div>
              <strong>60</strong>
              <span>opening-day players</span>
            </div>
            <div>
              <strong>4</strong>
              <span>inaugural teams</span>
            </div>
            <div>
              <strong>1</strong>
              <span>history-making season</span>
            </div>
          </div>
        </div>

        <div className="hero-art" aria-label="She's On First logo">
          <div className="logo-halo" />
          <img src="/sof-logo.png" alt="She's On First — Women's Baseball Media" />
          <div className="status-chip">
            <span className="status-dot" />
            <div>
              <small>Project status</small>
              <strong>Building the Inaugural 60</strong>
            </div>
          </div>
        </div>

        <div className="hero-note">
          <span>01</span>
          <p>
            A durable, sourced record of the athletes who were there at the
            beginning.
          </p>
        </div>
      </section>
    </main>
  );
}
