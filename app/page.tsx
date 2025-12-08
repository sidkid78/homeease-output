import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to HOMEase | AI
          </h1>
          <p className="text-xl text-muted-foreground">
            AI-powered aging-in-place lead generation platform connecting homeowners with trusted contractors
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto">
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Sign Up
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">AR Assessments</h3>
            <p className="text-sm text-muted-foreground">
              Use AR technology to assess your home improvement needs
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">AI Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Get intelligent recommendations powered by Gemini AI
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Trusted Contractors</h3>
            <p className="text-sm text-muted-foreground">
              Connect with verified contractors in your area
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
