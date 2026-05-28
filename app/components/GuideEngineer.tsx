'use client'

import Image from 'next/image'
import { GuideSpeechBubble } from '@/app/components/GuideSpeechBubble'
import { useTypewriter } from '@/app/hooks/useTypewriter'

const ALEX_IMAGE = '/alex-engineer.png'

interface Props {
  message: string
  name?: string
  role?: string
  stepIndex?: number
  totalSteps?: number
  actionLabel?: string
  onAction?: () => void
  onSkip?: () => void
  pointing?: 'left' | 'right' | 'center'
  compact?: boolean
}

export default function GuideEngineer({
  message,
  name = 'Alex',
  role = 'Site QA Engineer',
  stepIndex,
  totalSteps,
  actionLabel = 'Continue',
  onAction,
  onSkip,
  pointing = 'left',
  compact = false,
}: Props) {
  const typed = useTypewriter(message)
  const isTyping = typed.length < message.length
  const wrapClass = [
    'guide-engineer-wrap',
    `guide-point-${pointing}`,
    compact ? 'guide-compact' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const poseClass = `engineer-float engineer-pose-${pointing}`

  return (
    <section className={wrapClass} role="dialog" aria-label={`Guide from ${name}`}>
      <figure className="guide-engineer-character" aria-hidden>
        <span className={poseClass}>
          <Image
            src={ALEX_IMAGE}
            alt=""
            width={compact ? 120 : 150}
            height={compact ? 160 : 200}
            className="guide-engineer-img"
            priority
            unoptimized
          />
          <span className="engineer-ground-glow" />
        </span>
      </figure>

      <GuideSpeechBubble
        name={name}
        role={role}
        message={typed}
        isTyping={isTyping}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        actionLabel={actionLabel}
        onAction={onAction}
        onSkip={onSkip}
      />
    </section>
  )
}
