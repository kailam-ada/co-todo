import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from '../types'

export interface SignUpParams {
  email: string
  password: string
  firstName: string
  captchaToken?: string
}

export interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string, captchaToken?: string) => Promise<void>
  signUp: (params: SignUpParams) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  resetPasswordForEmail: (email: string, captchaToken?: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
