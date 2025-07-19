export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    name: string | null
                    age: number | null
                    email: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    name?: string | null
                    age?: number | null
                    email?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string | null
                    age?: number | null
                    email?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            agents: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    secret_key: string | null
                    user_id: string
                    created_at: string
                    updated_at: string
                    is_public: boolean
                    config: any
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    secret_key?: string | null
                    user_id: string
                    created_at?: string
                    updated_at?: string
                    is_public?: boolean
                    config?: any
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    secret_key?: string | null
                    user_id?: string
                    created_at?: string
                    updated_at?: string
                    is_public?: boolean
                    config?: any
                }
                Relationships: []
            }
            sources: {
                Row: {
                    id: string
                    agent_id: string
                    type: 'file' | 'text' | 'website' | 'qa' | 'notion'
                    name: string
                    details: any
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    agent_id: string
                    type: 'file' | 'text' | 'website' | 'qa' | 'notion'
                    name: string
                    details: any
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    agent_id?: string
                    type?: 'file' | 'text' | 'website' | 'qa' | 'notion'
                    name?: string
                    details?: any
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            custom_actions: {
                Row: {
                    id: string
                    agent_id: string
                    name: string
                    when_to_use: string
                    config: any
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    agent_id: string
                    name: string
                    when_to_use: string
                    config: any
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    agent_id?: string
                    name?: string
                    when_to_use?: string
                    config?: any
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            conversations: {
                Row: {
                    id: string
                    agent_id: string
                    user_id: string | null
                    identity: any | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    agent_id: string
                    user_id?: string | null
                    identity?: any | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    agent_id?: string
                    user_id?: string | null
                    identity?: any | null
                    created_at?: string
                    updated_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    role: 'user' | 'assistant' | 'system'
                    content: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    conversation_id: string
                    role: 'user' | 'assistant' | 'system'
                    content: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    conversation_id?: string
                    role?: 'user' | 'assistant' | 'system'
                    content?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            agent_chat_interface_configs: {
                Row: {
                    id: string
                    agent_id: string
                    config: any
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    agent_id: string
                    config: any
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    agent_id?: string
                    config?: any
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            source_type: 'file' | 'text' | 'website' | 'qa' | 'notion'
        }
    }
} 