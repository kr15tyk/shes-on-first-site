import { Link } from 'react-router-dom'
import { Article, heroGradients } from '../data/articles'

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default function ArticleCard({ article, size = 'md' }: { article: Article; size?: 'md' | 'lg' }) {
  return (
    <Link to={`/blog/${article.slug}`} className={`card ${size === 'lg' ? 'card-lg' : ''}`}>
      <div className="card-media" style={{ background: heroGradients[article.hero] }}>
        <span className="tag violet card-cat">{article.category}</span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{article.title}</h3>
        <p className="card-dek">{article.dek}</p>
        <div className="card-meta">
          <span>{article.author}</span>
          <span className="dot">•</span>
          <span>{fmtDate(article.date)}</span>
          <span className="dot">•</span>
          <span>{article.readMins} min</span>
        </div>
      </div>
    </Link>
  )
}
