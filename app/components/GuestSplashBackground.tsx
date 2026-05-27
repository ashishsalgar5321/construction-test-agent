/** Splash-style backdrop for home + sign-in + sign-up (logged-out surfaces) */
export default function GuestSplashBackground() {
  return (
    <div className="guest-splash-bg" aria-hidden>
      <div className="splash-aurora" />
      <div className="splash-aurora splash-aurora-2" />
      <div className="splash-sky" />
      <div className="splash-vignette" />
      <div className="splash-grid" />
      <div className="splash-scanline" />
      <div className="splash-skyline guest-splash-skyline" aria-hidden>
        {[90, 120, 160, 200, 140, 100, 75, 110, 85].map((h, i) => (
          <div
            key={i}
            className={`building b${i}`}
            style={{ height: h, width: 36 + (i % 4) * 14 }}
          />
        ))}
      </div>
      <div className="splash-ground guest-splash-ground" />
    </div>
  )
}
