import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { signInWithEmail, signInWithGoogle } from '@/services/auth'
import { useAppStore } from '@/store'

export default function LoginPage() {
  const navigate = useNavigate()
  const setUser = useAppStore((s) => s.setUser)

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error, setError]       = useState('')

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const profile = await signInWithEmail(email, password)
      setUser(profile)
      navigate('/dashboard')
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setGLoading(true)
    try {
      const profile = await signInWithGoogle()
      setUser(profile)
      navigate('/dashboard')
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setGLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="fade-up">
        <h2 className="text-xl font-bold text-[#f0f4ff] mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
          Welcome back
        </h2>
        <p className="text-sm text-[#4a5568] mb-6">Sign in to your Tajiri account</p>

        {/* Google */}
        <GoogleButton onClick={handleGoogle} loading={gLoading} />

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#2a3145]" />
          <span className="text-xs text-[#4a5568]">or</span>
          <div className="flex-1 h-px bg-[#2a3145]" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmail} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
            autoComplete="current-password"
          />

          {/* Show/hide password */}
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="flex items-center gap-1.5 text-xs text-[#4a5568] hover:text-[#8892aa] transition-colors self-end -mt-2"
          >
            {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPw ? 'Hide' : 'Show'} password
          </button>

          {error && (
            <div className="rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 px-3 py-2.5 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-[#4a5568] mt-5">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#0D9B87] hover:text-[#0A7163] font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

function friendlyError(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found':       'No account found with this email.',
    'auth/wrong-password':       'Incorrect password. Please try again.',
    'auth/invalid-credential':   'Invalid email or password.',
    'auth/too-many-requests':    'Too many attempts. Please wait a moment.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/popup-closed-by-user': 'Sign-in cancelled.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  }
  return map[code] ?? 'Something went wrong. Please try again.'
}
