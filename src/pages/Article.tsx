import { useParams, Link } from 'react-router-dom'
import { getArticle, articles, heroGradients } from '../data/articles'
import ArticleCard from '../components/ArticleCard'
import Seo from '../components/Seo'

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

export default function Article() {
  const { slug } = useParams()
  const article = slug ? getArticle(slug) : undefined

  if (!article) {
    return (
      <section className="section container">
        <Seo title="Story Not Found | She's On First" description="The requested story could not be found." path={`/blog/${slug || ''}`} noindex />
        <h1>Story not found</h1>
        <p className="muted">That post doesn&rsquo;t exist. <Link to="/blog" className="inline-link">Back to the Blog →</Link></p>
      </section>
    )
  }

  const more = articles.filter((a) => a.slug !== article.slug).slice(0, 3)

  return (
    <article>
      <Seo
        title={`${article.title} | She's On First`}
        description={article.dek}
        path={`/blog/${article.slug}`}
        type="article"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.dek,
          datePublished: article.date,
          dateModified: article.date,
          author: { '@type': 'Organization', name: article.author },
          publisher: { '@type': 'Organization', name: "She's On First" },
          mainEntityOfPage: `https://shesonfirst.com/blog/${article.slug}`,
        }}
      />
      <div className="article-hero" style={{ background: heroGradients[article.hero] }}>
        <div className="article-hero-overlay">
          <div className="container">
            <Link to="/blog" className="back-link">← Project Notes</Link>
            <span className="tag violet">{article.category}</span>
            <h1 className="article-title">{article.title}</h1>
            <p className="article-dek">{article.dek}</p>
            <div className="article-byline">
              <span>By {article.author}</span>
              <span className="dot">•</span>
              <span>{fmtDate(article.date)}</span>
              <span className="dot">•</span>
              <span>{article.readMins} min read</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container article-body">
        {article.body.map((p, i) => (
          <p key={i} className={i === 0 ? 'lead-para' : ''}>{p}</p>
        ))}
        {article.contactEmail ? (
          <div className="article-contact panel">
            <span className="eyebrow">Get in Touch</span>
            <h2>Let&rsquo;s work together.</h2>
            <p>Send inquiries and collaboration ideas to:</p>
            <a className="btn btn-primary" href={`mailto:${article.contactEmail}`}>
              {article.contactEmail}
            </a>
          </div>
        ) : (
          <div className="article-note">
            Project methodology note. Roster and profile status may change as sources are reviewed.
          </div>
        )}
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head"><div><span className="eyebrow">Keep Reading</span><h2>More Project Notes</h2></div></div>
          <div className="news-grid">
            {more.map((a) => <ArticleCard key={a.slug} article={a} />)}
          </div>
        </div>
      </section>
    </article>
  )
}
