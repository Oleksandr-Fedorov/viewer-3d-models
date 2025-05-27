'use client'

import { Session } from 'next-auth'
import { getSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

type SessionContextType = {
  session: Session | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  refreshSession: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const pathname = usePathname()

  const refreshSession = useCallback(async () => {
    try {
      setStatus('loading')
      const sessionData = await getSession()

      if (sessionData) {
        setSession(sessionData)
        setStatus('authenticated')
        return
      }

      setStatus('unauthenticated')
    } catch (error) {
      console.error('Failed to fetch session:', error)
      setStatus('unauthenticated')
      setSession(null)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  return <SessionContext.Provider value={{ session, status, refreshSession }}>
      {children}
    </SessionContext.Provider>
  
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}