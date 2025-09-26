import { useState, useEffect, useRef } from 'react'

interface UseTypingEffectOptions {
  speed?: number
  onComplete?: () => void
}

export function useTypingEffect(text: string, options: UseTypingEffectOptions = {}) {
  const { speed = 30, onComplete } = options
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    if (!text) {
      setDisplayedText('')
      setIsTyping(false)
      return
    }
    
    setIsTyping(true)
    setDisplayedText('')
    let currentIndex = 0
    
    intervalRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
        setIsTyping(false)
        onComplete?.()
      }
    }, speed)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [text, speed, onComplete])
  
  return { displayedText, isTyping }
}