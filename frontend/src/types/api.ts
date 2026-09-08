export interface User {
  id: number
  name: string
  email: string
  role: string
  department: string
  college: string
  semester: number
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface Conversation {
  id: number
  user_id: number
  thread_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: number
  conversation_id: number
  role: string
  content: string
  created_at: string
}

export interface ChatResponse {
  response: string
  thread_id: string
}

export interface AcademicDocument {
  id: number
  user_id: number
  filename: string
  file_path: string
  file_hash: string
  college: string
  department: string
  semester: number
  subject: string
  unit: number
  status: string
  chunk_count: number | null
  created_at: string
  updated_at: string
}


