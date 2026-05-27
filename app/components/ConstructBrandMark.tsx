type Props = {
  size?: 'compact' | 'hero'
  showTagline?: boolean
  tagline?: string
}

/** One logo style app-wide: orange construction tile + name + badge */
export default function ConstructBrandMark({
  size = 'compact',
  showTagline = false,
  tagline,
}: Props) {
  const isHero = size === 'hero'

  return (
    <div
      className={`construct-brand ${isHero ? 'construct-brand-hero' : 'construct-brand-compact'}`}
    >
      <div
        className={`construct-brand-icon ${isHero ? 'construct-brand-icon-hero' : ''}`}
        aria-hidden
      >
        🏗️
      </div>
      <div className="construct-brand-text">
        <div className="construct-brand-name">ConstructQA Agent</div>
        <div className="construct-brand-sub">Construction QA</div>
        {showTagline && tagline && (
          <p className="construct-brand-tagline">{tagline}</p>
        )}
      </div>
    </div>
  )
}
