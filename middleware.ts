
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabase, response } = await createClient(request)

  // List of paths that are public and don't require authentication
  const publicPaths = ['/login', '/signup', '/auth/callback', '/auth/sign-out', '/']
  const isPublicPath = publicPaths.includes(pathname) || pathname.startsWith('/auth/')

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

    // Define role-based dashboards and allowed routes
    // With route groups (homeowner) and (contractor), URLs are clean without prefixes
    const rolePaths: Record<string, {
      dashboard: string,
      allowedRoutes: string[]
    }> = {
      HOMEOWNER: {
        dashboard: '/dashboard',
        allowedRoutes: ['/dashboard', '/assess', '/projects', '/api', '/']
      },
      CONTRACTOR: {
        dashboard: '/contractor-dashboard',
        allowedRoutes: ['/contractor-dashboard', '/leads', '/profile', '/api', '/']
      },
      ADMIN: {
        dashboard: '/admin/dashboard',
        allowedRoutes: ['/'] // Admin can access everything
      }
    }

    const currentUserRoleConfig = rolePaths[userRole]

    // Redirect from login/signup if already authenticated
    if (isPublicPath && pathname !== '/' && pathname !== '/auth/callback' && currentUserRoleConfig) {
      return NextResponse.redirect(new URL(currentUserRoleConfig.dashboard, request.url))
    }

    // For admin, allow all paths
    if (userRole === 'ADMIN') {
      return response
    }

    // Check if path is allowed for the user's role
    if (currentUserRoleConfig) {
      const isAllowedPath = currentUserRoleConfig.allowedRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
      )

      if (!isAllowedPath && !isPublicPath) {
        console.warn(`User ${user.id} (Role: ${userRole}) attempted to access unauthorized path: ${pathname}`)
        return NextResponse.redirect(new URL(currentUserRoleConfig.dashboard, request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
