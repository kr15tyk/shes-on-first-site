import { useEffect } from 'react'

type StructuredData = Record<string, unknown> | Record<string, unknown>[]

type SeoProps = {
  title: string
  description: string
  path: string
  image?: string
  type?: 'website' | 'article' | 'profile'
  noindex?: boolean
  structuredData?: StructuredData
}

const siteUrl = 'https://shesonfirst.com'
const defaultTitle = "She's On First — Women's Baseball"
const defaultDescription = "She's On First documents the Inaugural 60 players of the Women's Professional Baseball League through sourced profiles, statistics, and stories."
const defaultImage = `${siteUrl}/logo-lockup.png?v=21e762b`

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

function setCanonical(url: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!element) {
    element = document.createElement('link')
    element.rel = 'canonical'
    document.head.appendChild(element)
  }
  element.href = url
}

function restoreDefaults() {
  document.title = defaultTitle
  setMeta('name', 'description', defaultDescription)
  setMeta('name', 'robots', 'index,follow')
  setMeta('property', 'og:type', 'website')
  setMeta('property', 'og:title', defaultTitle)
  setMeta('property', 'og:description', defaultDescription)
  setMeta('property', 'og:url', `${siteUrl}/`)
  setMeta('property', 'og:image', defaultImage)
  setMeta('name', 'twitter:card', 'summary_large_image')
  setMeta('name', 'twitter:title', defaultTitle)
  setMeta('name', 'twitter:description', defaultDescription)
  setMeta('name', 'twitter:image', defaultImage)
  setCanonical(`${siteUrl}/`)
  document.getElementById('sof-structured-data')?.remove()
}

export default function Seo({
  title,
  description,
  path,
  image = defaultImage,
  type = 'website',
  noindex = false,
  structuredData,
}: SeoProps) {
  useEffect(() => {
    const url = `${siteUrl}${path}`
    document.title = title
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow')
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', image)
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', image)
    setCanonical(url)

    document.getElementById('sof-structured-data')?.remove()
    if (structuredData) {
      const script = document.createElement('script')
      script.id = 'sof-structured-data'
      script.type = 'application/ld+json'
      script.text = JSON.stringify(structuredData)
      document.head.appendChild(script)
    }

    return restoreDefaults
  }, [description, image, noindex, path, structuredData, title, type])

  return null
}
