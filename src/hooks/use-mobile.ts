"use client"

import { useEffect, useState } from "react"

const MD_BREAKPOINT_PX = 768

/**
 * Returns true when viewport width is below Tailwind `md` (768px).
 * SSR-safe: defaults to false until mounted.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MD_BREAKPOINT_PX - 1}px)`)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  return isMobile
}
