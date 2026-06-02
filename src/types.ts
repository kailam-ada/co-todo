export type ProfileStatus = 'ACTIVE' | 'ANONYMIZED'

export interface Profile {
  id: string
  email: string | null
  first_name: string | null
  parent_label: string | null
  avatar_color: string
  family_id: string
  points: number
  status: ProfileStatus
  created_at: string
}
