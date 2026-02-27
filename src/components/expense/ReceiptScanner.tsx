import { useState, useRef } from 'react'
import { Camera, Upload, X, Loader2, CheckCircle } from 'lucide-react'
import { parseReceiptImage, type ParsedExpense } from '@/services/claude'
import { Button } from '@/components/ui/Button'

interface ReceiptScannerProps {
  defaultCurrency: string
  onParsed: (data: ParsedExpense) => void
  onError?: (msg: string) => void
}

export function ReceiptScanner({ defaultCurrency, onParsed, onError }: ReceiptScannerProps) {
  const [preview, setPreview]   = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      onError?.('Please upload an image file (JPG, PNG, WEBP).')
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setLoading(true)
    setSuccess(false)

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onload = () => resolve((r.result as string).split(',')[1])
        r.onerror = reject
        r.readAsDataURL(file)
      })

      const parsed = await parseReceiptImage(base64, file.type, defaultCurrency)
      onParsed(parsed)
      setSuccess(true)
    } catch (err: any) {
      onError?.(
        err.message?.includes('API key')
          ? 'Add your Anthropic API key to .env to enable receipt scanning.'
          : 'Could not read receipt. Please fill in manually or try a clearer photo.'
      )
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function reset() {
    setPreview(null)
    setSuccess(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Receipt"
            className="w-full max-h-56 object-contain rounded-xl border border-[#2a3145] bg-[#0f1117]"
          />

          {/* Status overlay */}
          <div className="absolute inset-0 flex items-center justify-center rounded-xl">
            {loading && (
              <div className="bg-[#0f1117]/80 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-2">
                <Loader2 size={16} className="text-[#0D9B87] animate-spin" />
                <span className="text-sm text-[#f0f4ff]">Reading receipt with AI...</span>
              </div>
            )}
            {success && (
              <div className="bg-[#0A7163]/20 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-2 border border-[#0A7163]/30">
                <CheckCircle size={16} className="text-[#0D9B87]" />
                <span className="text-sm text-[#0D9B87]">Receipt parsed! Review below.</span>
              </div>
            )}
          </div>

          {/* Remove button */}
          {!loading && (
            <button
              onClick={reset}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#0f1117]/80 border border-[#2a3145] flex items-center justify-center text-[#4a5568] hover:text-[#EF4444] transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8
            cursor-pointer transition-all duration-200
            ${dragOver
              ? 'border-[#0A7163] bg-[#0A7163]/8'
              : 'border-[#2a3145] hover:border-[#0A7163]/40 hover:bg-[#0A7163]/5'}
          `}
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-xl bg-[#1e2535] border border-[#2a3145] flex items-center justify-center mb-3">
            <Camera size={22} className="text-[#4a5568]" />
          </div>
          <p className="text-sm font-medium text-[#8892aa] mb-1">
            {dragOver ? 'Drop to scan' : 'Upload receipt photo'}
          </p>
          <p className="text-xs text-[#4a5568] mb-4">Drag & drop or tap to browse · JPG, PNG, WEBP</p>

          {/* Camera capture button for mobile */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (fileRef.current) {
                  fileRef.current.setAttribute('capture', 'environment')
                  fileRef.current.click()
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e2535] border border-[#2a3145] text-xs text-[#8892aa] hover:text-[#f0f4ff] transition-colors"
            >
              <Camera size={12} /> Take Photo
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (fileRef.current) {
                  fileRef.current.removeAttribute('capture')
                  fileRef.current.click()
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e2535] border border-[#2a3145] text-xs text-[#8892aa] hover:text-[#f0f4ff] transition-colors"
            >
              <Upload size={12} /> Browse
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
      />
    </div>
  )
}
