import { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import './layout.css'
import '../pages/pages.css'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="sample-banner">
        <strong>Research build</strong> — the roster is provisional and player profiles are still in review.
      </div>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </>
  )
}
