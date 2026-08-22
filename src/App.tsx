import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Blog from './pages/Blog'
import Article from './pages/Article'
import InauguralSixty from './pages/InauguralSixty'
import Player from './pages/Player'
import About from './pages/About'
import NotFound from './pages/NotFound'

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
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Article />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
