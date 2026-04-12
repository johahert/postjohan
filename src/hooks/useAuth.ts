import { useState } from 'react'
import type { AuthConfig, AuthProfile } from '../types'
import { defaultAuth } from '../constants'

export function useAuth(
  initialAuth: AuthConfig = defaultAuth(),
  initialProfiles: AuthProfile[] = [],
  initialActiveProfileId: string | null = null,
) {
  const [auth, setAuth] = useState<AuthConfig>(initialAuth)
  const [profiles, setProfiles] = useState<AuthProfile[]>(initialProfiles)
  const [activeProfileId, setActiveProfileId] = useState<string | null>(initialActiveProfileId)
  const [profileName, setProfileName] = useState('')

  const saveProfile = () => {
    if (!profileName.trim()) return
    const profile: AuthProfile = {
      id: crypto.randomUUID(),
      name: profileName.trim(),
      auth: { ...auth },
    }
    setProfiles((prev) => [...prev, profile])
    setActiveProfileId(profile.id)
    setProfileName('')
  }

  const loadProfile = (id: string) => {
    const profile = profiles.find((p) => p.id === id)
    if (!profile) return
    setAuth({ ...profile.auth })
    setActiveProfileId(id)
  }

  const deleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    if (activeProfileId === id) setActiveProfileId(null)
  }

  return {
    auth, setAuth,
    profiles, setProfiles,
    activeProfileId, setActiveProfileId,
    profileName, setProfileName,
    saveProfile,
    loadProfile,
    deleteProfile,
  }
}
