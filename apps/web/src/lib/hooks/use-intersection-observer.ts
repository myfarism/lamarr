import { useEffect, useRef } from "react"

export function useIntersectionObserver(
  callback: () => void,
  enabled: boolean
) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled || !ref.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) callback()
      },
      { threshold: 0.1 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [callback, enabled])

  return ref
}
