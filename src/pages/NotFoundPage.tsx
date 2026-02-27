import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl mb-6 select-none">🗺️</div>
      <h1 className="text-4xl font-black text-[#f0f4ff] mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
        404
      </h1>
      <p className="text-[#4a5568] mb-8 max-w-xs">
        This page doesn't exist. Let's get you back on track.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
        <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
      </div>
    </div>
  )
}
