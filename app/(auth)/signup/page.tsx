
import { SignupForm } from '@/components/auth/signup-form'

/**
 * Signup page for HOMEase | AI.
 * Renders the SignupForm component.
 */
export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <SignupForm />
    </div>
  )
}
