import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, phone?: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signInWithPhone: (phone: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  sendPhoneOTP: (phone: string) => Promise<any>
  verifyPhoneOTP: (phone: string, token: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      phone,
      options: {
        data: {
          phone: phone
        }
      }
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signInWithPhone = async (phone: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      phone,
      password,
    })
    return { data, error }
  }

  const sendPhoneOTP = async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    })
    return { data, error }
  }

  const verifyPhoneOTP = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithPhone,
    signOut,
    sendPhoneOTP,
    verifyPhoneOTP,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}