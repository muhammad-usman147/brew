'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import './NavigationProgressBar.css'

let globalStartLoading = null
let globalDoneLoading = null

export function startPageLoading() {
  if (globalStartLoading) globalStartLoading()
}

export function stopPageLoading() {
  if (globalDoneLoading) globalDoneLoading()
}

export default function NavigationProgressBar({
  color = '#ff0000',
  height = 3,
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const [opacity, setOpacity] = useState(1)

  const timerRef = useRef(null)
  const fadeTimerRef = useRef(null)
  const resetTimerRef = useRef(null)
  const isNavigatingRef = useRef(false)

  // Start progress animation safely
  const start = () => {
    // Schedule state updates asynchronously to avoid conflicts with React internal insertion effects
    setTimeout(() => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
      if (timerRef.current) clearInterval(timerRef.current)

      isNavigatingRef.current = true
      setOpacity(1)
      setVisible(true)
      setProgress(20)

      timerRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev < 50) {
            return prev + Math.floor(Math.random() * 12 + 6)
          } else if (prev < 75) {
            return prev + Math.floor(Math.random() * 6 + 3)
          } else if (prev < 90) {
            return prev + Math.floor(Math.random() * 3 + 1)
          }
          return prev
        })
      }, 200)
    }, 0)
  }

  // Complete progress animation safely
  const done = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (!isNavigatingRef.current && !visible) return

    setProgress(100)

    fadeTimerRef.current = setTimeout(() => {
      setOpacity(0)
      resetTimerRef.current = setTimeout(() => {
        setVisible(false)
        setProgress(0)
        isNavigatingRef.current = false
      }, 300)
    }, 200)
  }

  // Bind global helpers
  useEffect(() => {
    globalStartLoading = start
    globalDoneLoading = done
    return () => {
      globalStartLoading = null
      globalDoneLoading = null
    }
  }, [])

  // Complete progress when pathname or searchParams change
  useEffect(() => {
    done()
  }, [pathname, searchParams])

  // Intercept click on internal <a> links & history navigation
  useEffect(() => {
    function findAnchor(element) {
      let curr = element
      while (curr && curr !== document.body && curr !== document.documentElement) {
        if (curr.tagName && curr.tagName.toLowerCase() === 'a' && curr.href) {
          return curr
        }
        curr = curr.parentElement
      }
      return null
    }

    function handleClick(e) {
      // Ignore modified clicks or non-primary clicks
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return
      }

      const anchor = findAnchor(e.target)
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Skip hash-only or javascript links
      if (href.startsWith('#') || href.startsWith('javascript:')) return

      // Skip download links or new tab links
      if (anchor.hasAttribute('download') || anchor.getAttribute('target') === '_blank') return

      try {
        const url = new URL(anchor.href, window.location.href)
        const currentUrl = new URL(window.location.href)

        // Only handle internal routes
        if (url.origin !== currentUrl.origin) return

        // Skip if exact same path + search + hash
        if (url.pathname === currentUrl.pathname && url.search === currentUrl.search && url.hash !== '') {
          return
        }

        // If navigating to different path or params, start loader
        if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
          start()
        }
      } catch {
        // Fallback ignore invalid URLs
      }
    }

    const handlePopState = () => {
      start()
    }

    document.addEventListener('click', handleClick, { capture: true })
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleClick, { capture: true })
      window.removeEventListener('popstate', handlePopState)
      if (timerRef.current) clearInterval(timerRef.current)
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="yt-progress-container" aria-hidden="true" style={{ height: `${height}px` }}>
      <div
        className="yt-progress-bar animating"
        style={{
          width: `${progress}%`,
          opacity,
          background: color.startsWith('#')
            ? `linear-gradient(90deg, ${color} 0%, #ff4d4d 50%, ${color} 100%)`
            : color,
        }}
      >
        <div className="yt-progress-peg" />
      </div>
    </div>
  )
}
