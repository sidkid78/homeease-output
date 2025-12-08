
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabase, response } = await createClient(request)

  // List of paths that are public and don't require authentication
  const publicPaths = ['/login', '/signup', '/auth/callback', '/']
  const isPublicPath = publicPaths.includes(pathname)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !isPublicPath) {
    // Redirect unauthenticated users from protected routes to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // For authenticated users, handle role-based redirection
  if (user) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profileData) {
      console.error('Error fetching profile in middleware:', profileError?.message)
      // If profile is missing or error, force logout to re-authenticate or fix data
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?message=Profile information missing', request.url))
    }

    const userRole = profileData.role

    // Define role-based protected paths and dashboards
    const rolePaths: Record<string, {
      dashboard: string,
      protectedPrefixes: string[],
      allowedPrefixes: string[]
    }> = {
      HOMEOWNER: {
        dashboard: '/homeowner/dashboard',
        protectedPrefixes: ['/contractor', '/admin'], // Cannot access contractor or admin paths
        allowedPrefixes: ['/homeowner', '/', '/api'] // Can access homeowner paths
      },
      CONTRACTOR: {
        dashboard: '/contractor/dashboard',
        protectedPrefixes: ['/homeowner', '/admin'], // Cannot access homeowner or admin paths
        allowedPrefixes: ['/contractor', '/', '/api'] // Can access contractor paths
      },
      ADMIN: {
        dashboard: '/admin/dashboard',
        protectedPrefixes: [], // Admin can access everything normally, or we define specific admin-only paths
        allowedPrefixes: ['/admin', '/', '/api', '/homeowner', '/contractor'] // Admin can access all
      }
    }

    const currentUserRoleConfig = rolePaths[userRole]

    // Redirect from login/signup if already authenticated
    if (isPublicPath && pathname !== '/' && pathname !== '/auth/callback' && currentUserRoleConfig) {
      return NextResponse.redirect(new URL(currentUserRoleConfig.dashboard, request.url))
    }

    // Enforce role-based access to protected routes
    if (currentUserRoleConfig) {
      const isAttemptingToAccessProtectedPath = currentUserRoleConfig.protectedPrefixes.some(prefix => pathname.startsWith(prefix))
      const isAllowedToAccessCurrentPath = currentUserRoleConfig.allowedPrefixes.some(prefix => pathname.startsWith(prefix))

      if (isAttemptingToAccessProtectedPath) {
        console.warn(`User ${user.id} (Role: ${userRole}) attempted to access protected path: ${pathname}`)
        return NextResponse.redirect(new URL(currentUserRoleConfig.dashboard, request.url)) // Redirect to their dashboard
      }

      // If user is trying to access a path not in their allowed prefixes and it's not a public path, redirect
      // This is a more strict check to ensure users only access routes explicitly allowed for their role.
      if (!isAllowedToAccessCurrentPath && !isPublicPath && pathname !== '/dashboard') { // /dashboard will be a generic redirect for now
        console.warn(`User ${user.id} (Role: ${userRole}) attempted to access unauthorized path: ${pathname}`)
        return NextResponse.redirect(new URL(currentUserRoleConfig.dashboard, request.url))
      }

       // Generic dashboard redirect logic for initial /dashboard access
       if (pathname === '/dashboard' && currentUserRoleConfig.dashboard) {
        return NextResponse.redirect(new URL(currentUserRoleConfig.dashboard, request.url));
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
