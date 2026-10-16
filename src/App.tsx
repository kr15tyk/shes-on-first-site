import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Article from './pages/Article'
import InauguralSixty from './pages/InauguralSixty'
import Player from './pages/Player'
import About from './pages/About'
import Schedule from './pages/Schedule'
import Leaders from './pages/Leaders'
import NotFound from './pages/NotFound'
import profiles from './data/editorialProfiles.json'
import WpblFirstMonthAnalysis from './pages/WpblFirstMonthAnalysis'

function LegacyPlayerLink({ slug }: { slug: string }) {
  const { search, hash } = useLocation()
  return <Navigate to={`/inaugural-60/${slug}${search}${hash}`} replace />
}

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <Layout>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inaugural-60" element={<InauguralSixty />} />
        <Route path="/inaugural-60/:slug" element={<Player />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/leaders" element={<Leaders />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Article />} />
        {Object.keys(profiles).map(slug => <Route key={slug} path={`/features/${slug}`} element={<LegacyPlayerLink slug={slug} />} />)}
        <Route path="/analysis/wpbl-first-month" element={<WpblFirstMonthAnalysis />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
