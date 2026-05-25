'use client'

import { useEffect, useState } from 'react'

/** Typewriter effect for guide dialogue; resets when `text` changes. */
export function useTypewriter(text: string, speed = 18) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    let index = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const tick = () => {
      index += 1
      setDisplay(text.slice(0, index))
      if (index < text.length) {
        timer = setTimeout(tick, speed)
      }
    }

    timer = setTimeout(tick, speed)

    return () => {
      if (timer) clearTimeout(timer)
      setDisplay('')
    }
  }, [text, speed])

  return display
}
