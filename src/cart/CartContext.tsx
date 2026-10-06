import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { BOOK, HAS_PRICE } from '../config'
import { track } from '../lib/tracking'

interface State { qty: number }
type Action = { type: 'add'; n: number } | { type: 'set'; n: number } | { type: 'clear' }

const KEY = 'rg-cart-v1'
const MAX = 10
const clamp = (n: number) => Math.max(0, Math.min(MAX, n))

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'add': return { qty: clamp(s.qty + a.n) }
    case 'set': return { qty: clamp(a.n) }
    case 'clear': return { qty: 0 }
  }
}

function load(): State {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '')
    if (typeof v?.qty === 'number') return { qty: clamp(v.qty) }
  } catch { /* sem storage */ }
  return { qty: 0 }
}

interface Ctx {
  qty: number
  subtotal: number
  open: boolean
  bump: number
  add: (n?: number) => void
  setQty: (n: number) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void
}

const CartCtx = createContext<Ctx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [open, setOpen] = useState(false)
  const [bump, setBump] = useState(0)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const add = useCallback((n = 1) => {
    track('AddToCart', { value: HAS_PRICE ? (n * BOOK.priceCents) / 100 : undefined, quantity: n })
    dispatch({ type: 'add', n })
    setBump((b) => b + 1)
    setOpen(true)
  }, [])

  const value = useMemo<Ctx>(() => ({
    qty: state.qty,
    subtotal: state.qty * BOOK.priceCents,
    open,
    bump,
    add,
    setQty: (n) => dispatch({ type: 'set', n }),
    clear: () => dispatch({ type: 'clear' }),
    openCart: () => setOpen(true),
    closeCart: () => setOpen(false),
  }), [state.qty, open, bump, add])

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const c = useContext(CartCtx)
  if (!c) throw new Error('useCart fora do CartProvider')
  return c
}
