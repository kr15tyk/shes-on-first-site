import { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import './layout.css'
import '../pages/pages.css'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </>
  )
}
