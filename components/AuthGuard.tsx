import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import styled from 'styled-components'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthenticated(!!session)
      setLoading(false)

      if (requireAuth && !session && event !== 'INITIAL_SESSION') {
        router.push('/auth/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setAuthenticated(!!session)
      
      if (requireAuth && !session) {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setAuthenticated(false)
      if (requireAuth) {
        router.push('/auth/login')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <LoadingWrapper>
        <LoadingText>Loading...</LoadingText>
      </LoadingWrapper>
    )
  }

  if (requireAuth && !authenticated) {
    return (
      <LoadingWrapper>
        <LoadingText>Redirecting to login...</LoadingText>
      </LoadingWrapper>
    )
  }

  return <>{children}</>
}

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
`

const LoadingText = styled.div`
  font-size: 1.6rem;
  opacity: 0.7;
`
