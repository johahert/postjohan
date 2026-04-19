import { useEffect, useState } from 'react'

export function useDarkMode(initial: boolean) {
  const [darkMode, setDarkMode] = useState(initial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return { darkMode, setDarkMode }
}
