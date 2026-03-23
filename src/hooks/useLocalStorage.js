import { useEffect, useState } from 'react'

function getInitialValue(key, initialValue) {
  if (typeof window === 'undefined') {
    return typeof initialValue === 'function' ? initialValue() : initialValue
  }

  try {
    const storedValue = window.localStorage.getItem(key)

    if (storedValue !== null) {
      return JSON.parse(storedValue)
    }
  } catch {
    return typeof initialValue === 'function' ? initialValue() : initialValue
  }

  return typeof initialValue === 'function' ? initialValue() : initialValue
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => getInitialValue(key, initialValue))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore storage failures and keep the app usable.
    }
  }, [key, value])

  return [value, setValue]
}
