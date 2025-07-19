import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'
import type { Database } from '../../database.types'

// Create Supabase client with service role key for admin operations
export const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface TestUser {
    user: any
    session: any
}

// Helper function to create a test user and authenticate
export async function createAndAuthenticateUser(): Promise<TestUser> {
    // Generate test user data
    const email = faker.internet.email()
    const password = faker.internet.password()
    const name = faker.person.fullName()

    // Create user with email/password
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: { name },
        email_confirm: true
    })

    if (authError) throw authError

    // Try to create profile record - if it fails due to RLS, continue without it
    try {
        await supabaseAdmin
            .from('profiles')
            .insert({
                id: authData.user.id,
                name,
                email,
                updated_at: new Date().toISOString()
            })
    } catch (error) {
        console.warn('Failed to create profile, continuing without it:', error)
    }

    // Sign in to get session
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
    })

    if (signInError) throw signInError

    return {
        user: authData.user,
        session: signInData.session
    }
}

// Helper function to set authentication cookies in browser
export async function setAuthCookies(page: any, session: any) {
    // Extract the project reference from the Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 
                      supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 
                      'devtukvjyaktnrmyqdnu' // fallback
    
    // Create the auth token cookie value (this is the full session object)
    const authTokenValue = Buffer.from(JSON.stringify(session)).toString('base64')
    
    // Split the token into chunks if it's too long (Supabase does this)
    const chunkSize = 4000 // Supabase splits at around 4000 chars
    const chunks = []
    for (let i = 0; i < authTokenValue.length; i += chunkSize) {
        chunks.push(authTokenValue.slice(i, i + chunkSize))
    }
    
    // @ts-ignore
    const cookies = []
    
    // Add the main auth token chunks
    chunks.forEach((chunk, index) => {
        cookies.push({
            name: `sb-${projectRef}-auth-token.${index}`,
            value: `base64-${chunk}`,
            domain: 'localhost',
            path: '/',
            httpOnly: false, // Supabase auth cookies are not httpOnly
            secure: false, // false for localhost
            sameSite: 'Lax' as const
        })
    })
    
    // Add the code verifier cookie (used for OAuth flows)
    // cookies.push({
    //     name: `sb-${projectRef}-auth-token-code-verifier`,
    //     value: 'base64-IjNmZjA2Y2YzZTE5MmRmMTlmYTZkNWNjYTliYzYyYjlhMzIzODMwYWNmNTIxMjVkNGQzYTQ5NmM0MWY1M2NkZDAwMGYyMGExMjc4ZWQzMDRlYzlhMGU5NGExMmI3MTNmNzM0Nzk3N2I2YjI0ZjRhODYi',
    //     domain: 'localhost',
    //     path: '/',
    //     httpOnly: false,
    //     secure: false,
    //     sameSite: 'Lax' as const
    // })

    // @ts-ignore
    await page.context().addCookies(cookies)
}

// Helper function to cleanup test user
export async function cleanupTestUser(userId: string) {
    try {
        await supabaseAdmin.auth.admin.deleteUser(userId)
    } catch (error) {
        console.warn('Failed to cleanup test user:', error)
    }
} 