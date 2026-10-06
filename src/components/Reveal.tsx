import { motion, useInView, useMotionValue, animate } from 'framer-motion'
import { useEffect, useRef, type ElementType, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  y?: number
  x?: number
  className?: string
  as?: 'div' | 'li' | 'section' | 'p' | 'h2' | 'h3'
}

export function Reveal({ children, delay = 0, y = 28, x = 0, className, as = 'div' }: RevealProps) {
  const Tag = motion[as] as ElementType
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, x, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}

export function Counter({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const v = useMotionValue(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fmt = (n: number) => `${prefix}${Math.round(n).toLocaleString('pt-BR')}${suffix}`
    el.textContent = fmt(0)
    if (!inView) return
    const c = animate(v, to, { duration: 2.2, ease: [0.22, 1, 0.36, 1], onUpdate: (n) => { el.textContent = fmt(n) } })
    return () => c.stop()
  }, [inView, to, prefix, suffix, v])

  return <span ref={ref}>{`${prefix}${to.toLocaleString('pt-BR')}${suffix}`}</span>
}
