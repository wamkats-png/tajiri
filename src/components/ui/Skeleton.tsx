interface SkeletonProps {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

export function Skeleton({ className = '', rounded = 'md' }: SkeletonProps) {
  const r = { sm: 'rounded', md: 'rounded-lg', lg: 'rounded-xl', full: 'rounded-full' }
  return (
    <div className={`animate-pulse bg-[#1e2535] ${r[rounded]} ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#2a3145] bg-[#181d27] p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10" rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-2 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-1.5 w-full" rounded="full" />
    </div>
  )
}
