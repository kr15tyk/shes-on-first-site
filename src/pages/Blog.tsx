import { useState } from 'react'
import { articles, Article } from '../data/articles'
import ArticleCard from '../components/ArticleCard'

const cats: (Article['category'] | 'All')[] = ['All', 'Features', 'Analysis', 'Contact']

export default function Blog() {
  const [cat, setCat] = useState<(typeof cats)[number]>('All')
  const list = cat === 'All' ? articles : articles.filter((a) => a.category === cat)

  return (
    <>
      <section className="page-head">
        <div className="container">
          <span className="eyebrow">Behind the Record</span>
          <h1>Project Notes</h1>
          <p className="muted page-lede">
            Notes on building a responsible public record of the Inaugural 60.
          </p>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container">
          <div className="filters">
            {cats.map((c) => (
              <button key={c} className={`chip ${cat === c ? 'chip-on' : ''}`} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="news-grid">
            {list.map((a) => <ArticleCard key={a.slug} article={a} />)}
          </div>
          {list.length === 0 && <p className="muted">No posts in this category yet.</p>}
        </div>
      </section>
    </>
  )
}
