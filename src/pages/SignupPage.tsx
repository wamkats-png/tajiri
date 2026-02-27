import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { signUpWithEmail, signInWithGoogle } from '@/services/auth'
import { useAppStore } from '@/store'

export default function SignupPage() {
  const navigate = useNavigate()
  const setUser  = useAppStore((s) => s.setUser)

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [error, setError]       = useState('')

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const profile = await signUpWithEmail(email, password, name)
      setUser(profile)
      navigate('/onboarding')
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
      // New Google users go to onboarding; existing go to dashboard
      navigate('/onboarding')
    } catch (err: any) {
      setError(friendlyError(err.code))
    } finally {
      setGLoading(false)
    }
  }

  const strength = getPasswordStrength(password)

  return (
    <AuthLayout>
      <div className="fade-up">
        <h2 className="text-xl font-bold text-[#f0f4ff] mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
          Create your account
        </h2>
        <p className="text-sm text-[#4a5568] mb-6">Start tracking smarter with Tajiri</p>

        <GoogleButton onClick={handleGoogle} loading={gLoading} label="Sign up with Google" />

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#2a3145]" />
          <span className="text-xs text-[#4a5568]">or</span>
          <div className="flex-1 h-px bg-[#2a3145]" />
        </div>

        <form onSubmit={handleEmail} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Julius Kamya"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User size={16} />}
            required
            autoComplete="name"
          />
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

          {/* Password with strength meter */}
          <div className="flex flex-col gap-1.5">
            <div className="relative">
              <Input
                label="Password"
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                required
                autoComplete="new-password"
              />
            </div>
            {password.length > 0 && (
              <div className="flex gap-1 mt-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background: i < strength.score
                        ? strength.score <= 1 ? '#EF4444'
                          : strength.score <= 2 ? '#F59E0B'
                          : '#0A7163'
                        : '#2a3145'
                    }}
                  />
                ))}
                <span className="text-xs text-[#4a5568] ml-1 self-center">{strength.label}</span>
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type={showPw ? 'text' : 'password'}
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            icon={<Lock size={16} />}
            required
            autoComplete="new-password"
            error={confirm && confirm !== password ? 'Passwords do not match' : undefined}
          />

          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="flex items-center gap-1.5 text-xs text-[#4a5568] hover:text-[#8892aa] transition-colors self-end -mt-2"
          >
            {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
            {showPw ? 'Hide' : 'Show'} passwords
          </button>

          {error && (
            <div className="rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 px-3 py-2.5 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-[#4a5568] mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0D9B87] hover:text-[#0A7163] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

function getPasswordStrength(pw: string): { score: number; label: string } {
  if (!pw) return { score: 0, label: '' }
  let score = 0
  if (pw.length >= 8)  score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return { score, label: labels[score] }
}

function friendlyError(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/weak-password':        'Password is too weak.',
    'auth/popup-closed-by-user': 'Sign-up cancelled.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  }
  return map[code] ?? 'Something went wrong. Please try again.'
}
