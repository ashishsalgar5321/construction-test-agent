'use client'

import Image from 'next/image'

const ALEX_IMAGE = '/alex-engineer.png'

interface SpeechBubbleProps {
  name: string
  role: string
  message: string
  isTyping: boolean
  stepIndex?: number
  totalSteps?: number
  actionLabel: string
  onAction?: () => void
  onSkip?: () => void
}

export function GuideSpeechBubble({
  name,
  role,
  message,
  isTyping,
  stepIndex,
  totalSteps,
  actionLabel,
  onAction,
  onSkip,
}: SpeechBubbleProps) {
  const showStep = totalSteps != null && stepIndex != null

  return (
    <section className="guide-speech-bubble">
      <header className="guide-speech-header">
        <span className="guide-speech-avatar">
          <Image
            src={ALEX_IMAGE}
            alt=""
            width={36}
            height={36}
            className="guide-speech-avatar-img"
          />
        </span>
        <span className="guide-speech-meta">
          <strong className="guide-speech-name">{name}</strong>
          <em className="guide-speech-role">{role}</em>
        </span>
        {showStep ? (
          <span className="guide-step-badge">
            {stepIndex + 1}/{totalSteps}
          </span>
        ) : null}
      </header>
      <p className="guide-speech-text">
        {message}
        {isTyping ? <span className="guide-cursor">|</span> : null}
      </p>
      <footer className="guide-speech-actions">
        {onSkip ? (
          <button type="button" className="guide-btn-skip" onClick={onSkip}>
            Skip tour
          </button>
        ) : null}
        {onAction ? (
          <button
            type="button"
            className="guide-btn-primary"
            onClick={onAction}
            disabled={isTyping}
          >
            {actionLabel}
          </button>
        ) : null}
      </footer>
    </section>
  )
}
