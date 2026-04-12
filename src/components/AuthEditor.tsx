import type { AuthConfig, AuthProfile, AuthType } from '../types'

interface AuthEditorProps {
  auth: AuthConfig
  onAuthChange: (auth: AuthConfig) => void
  profiles: AuthProfile[]
  activeProfileId: string | null
  profileName: string
  onProfileNameChange: (name: string) => void
  onSaveProfile: () => void
  onLoadProfile: (id: string) => void
  onDeleteProfile: (id: string) => void
}

export function AuthEditor({
  auth,
  onAuthChange,
  profiles,
  activeProfileId,
  profileName,
  onProfileNameChange,
  onSaveProfile,
  onLoadProfile,
  onDeleteProfile,
}: AuthEditorProps) {
  return (
    <div className="mt-4 space-y-4">
      {/* Profiles */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700/50">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
          Profiles
        </p>
        <div className="flex flex-wrap gap-2">
          {profiles.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
                activeProfileId === p.id
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-600 dark:border-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              <button onClick={() => onLoadProfile(p.id)} className="font-medium">
                {p.name}
              </button>
              <button
                onClick={() => onDeleteProfile(p.id)}
                className="ml-1 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
              >
                ✕
              </button>
            </div>
          ))}
          {profiles.length === 0 && (
            <span className="text-xs text-slate-400 dark:text-slate-500">No saved profiles</span>
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={profileName}
            onChange={(e) => onProfileNameChange(e.target.value)}
            placeholder="Profile name"
            className="h-8 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          />
          <button
            onClick={onSaveProfile}
            disabled={!profileName.trim()}
            className="h-8 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-600"
          >
            Save current
          </button>
        </div>
      </div>

      {/* Auth type */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
          Type
        </label>
        <select
          value={auth.type}
          onChange={(e) => onAuthChange({ ...auth, type: e.target.value as AuthType })}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
        >
          <option value="none">No Auth</option>
          <option value="bearer">Bearer Token</option>
          <option value="basic">Basic Auth</option>
          <option value="api-key">API Key</option>
        </select>
      </div>

      {auth.type === 'bearer' && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
            Token
          </label>
          <input
            value={auth.bearer}
            onChange={(e) => onAuthChange({ ...auth, bearer: e.target.value })}
            placeholder="Paste your token"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
      )}

      {auth.type === 'basic' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Username
            </label>
            <input
              value={auth.basicUser}
              onChange={(e) => onAuthChange({ ...auth, basicUser: e.target.value })}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Password
            </label>
            <input
              type="password"
              value={auth.basicPass}
              onChange={(e) => onAuthChange({ ...auth, basicPass: e.target.value })}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
        </div>
      )}

      {auth.type === 'api-key' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Header Name
            </label>
            <input
              value={auth.apiKeyHeader}
              onChange={(e) => onAuthChange({ ...auth, apiKeyHeader: e.target.value })}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Value
            </label>
            <input
              value={auth.apiKeyValue}
              onChange={(e) => onAuthChange({ ...auth, apiKeyValue: e.target.value })}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>
        </div>
      )}
    </div>
  )
}
