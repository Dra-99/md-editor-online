import { useEffect, useState } from "react"

export function useDebounceValue(value, delay = 1000) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const id = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)
      return () => clearTimeout(id)
    }, [value, delay])
    return debouncedValue
  }