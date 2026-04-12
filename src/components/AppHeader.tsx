interface AppHeaderProps {
  darkMode: boolean
  onToggleDarkMode: () => void
}

export function AppHeader({ darkMode, onToggleDarkMode }: AppHeaderProps) {
  return (
    <header className="mx-auto mb-6 flex w-full max-w-6xl items-center justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400">
          PostJohan
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">CURL-powered API Console</p>
      </div>
      <button
        onClick={onToggleDarkMode}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-lg shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300 dark:bg-slate-800 dark:ring-slate-700 dark:hover:ring-indigo-600"
        title="Toggle theme"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </header>
  )
}
