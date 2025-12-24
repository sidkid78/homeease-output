
import { LoginForm } from '@/components/auth/login-form'

// Force dynamic rendering since this page needs auth context
export const dynamic = 'force-dynamic'

/**
 * Login page for HOMEase | AI.
 * Renders the LoginForm component.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
