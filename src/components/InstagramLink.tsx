import './instagram.css'

export default function InstagramLink({ className = '', label }: { className?: string; label?: string }) {
  return (
    <a
      href="https://www.instagram.com/sheson1st/"
      className={`instagram-link ${className}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label ? `${label} (opens in a new tab)` : 'She’s On First on Instagram (opens in a new tab)'}
      title="@sheson1st on Instagram"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
      {label && <span>{label}</span>}
    </a>
  )
}
