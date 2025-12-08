
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/ui/use-toast'

/**
 * Renders the signup form.
 * Allows users to create a new account with email, password, and role selection.
 */
export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'HOMEOWNER' | 'CONTRACTOR' | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    if (role) {
      formData.append('role', role)
    }

    const result = await signUp(formData)

    if (!result.success) {
      toast({
        title: 'Signup Failed',
        description: result.error || 'An unexpected error occurred.',
        variant: 'destructive',
      })
    } else {
      // For successful signup, inform the user to check their email.
      toast({
        title: 'Signup Successful',
        description: result.error || 'Please check your email to confirm your account.',
      })
      router.push('/login') // Redirect to login after successful signup and email confirmation message
    }
    setIsLoading(false)
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create your HOMEase | AI account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label>Account Type</Label>
              <RadioGroup
                onValueChange={(value: 'HOMEOWNER' | 'CONTRACTOR') => setRole(value)}
                className="flex flex-col space-y-1"
                required
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="HOMEOWNER" id="homeowner" />
                  <Label htmlFor="homeowner">Homeowner</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="CONTRACTOR" id="contractor" />
                  <Label htmlFor="contractor">Contractor</Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !role}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
