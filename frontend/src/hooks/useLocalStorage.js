import { useState, useEffect } from 'react'

export default function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const s = localStorage.getItem(key)
      return s ? JSON.parse(s) : initial
    } catch { return initial }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState]
}
