import { useState, useRef } from 'react'
import { Camera, Loader2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { extractFromNationalID } from '../lib/openai'
import { supabase } from '../lib/supabase'

export default function IDPhotoUpload({ onTenantAdded }) {
  const [stage, setStage] = useState('idle')   // idle | extracting | confirm | saving
  const [preview, setPreview] = useState(null)
  const [fields, setFields] = useState({ full_name: '', national_id_number: '', date_of_birth: '', phone: '' })
  const [base64, setBase64] = useState('')
  const [mime, setMime] = useState('image/jpeg')
  const fileRef = useRef()

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return

    setMime(file.type || 'image/jpeg')
    setPreview(URL.createObjectURL(file))

    // convert to base64
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const b64 = ev.target.result.split(',')[1]
      setBase64(b64)
      setStage('extracting')
      try {
        const extracted = await extractFromNationalID(b64, file.type)
        setFields({
          full_name: extracted.full_name || '',
          national_id_number: extracted.national_id_number || '',
          date_of_birth: extracted.date_of_birth || '',
          phone: '',
        })
        setStage('confirm')
      } catch (err) {
        toast.error('Could not read ID card: ' + err.message)
        setStage('idle')
      }
    }
    reader.readAsDataURL(file)
  }

  async function save() {
    if (!fields.full_name.trim()) {
      toast.error('Name is required')
      return
    }
    setStage('saving')
    try {
      // Upload photo to Supabase Storage
      let id_photo_url = null
      if (base64) {
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
        const fileName = `id-${Date.now()}.${mime.split('/')[1]}`
        const { data: storageData, error: se } = await supabase.storage
          .from('id-photos')
          .upload(fileName, bytes, { contentType: mime })
        if (!se && storageData) {
          const { data: urlData } = supabase.storage.from('id-photos').getPublicUrl(fileName)
          id_photo_url = urlData?.publicUrl
        }
      }

      const { error } = await supabase.from('tenants').insert({
        name: fields.full_name.trim(),
        phone: fields.phone.trim() || null,
        national_id: fields.national_id_number.trim() || null,
        date_of_birth: fields.date_of_birth || null,
        id_photo_url,
      })
      if (error) throw error

      toast.success(`Tenant "${fields.full_name}" added`)
      setStage('idle')
      setPreview(null)
      setFields({ full_name: '', national_id_number: '', date_of_birth: '', phone: '' })
      onTenantAdded?.()
    } catch (err) {
      toast.error(err.message)
      setStage('confirm')
    }
  }

  function cancel() {
    setStage('idle')
    setPreview(null)
    setBase64('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="border border-dashed border-slate-300 rounded-xl p-4">
      {stage === 'idle' && (
        <div className="flex flex-col items-center py-4">
          <Camera size={28} className="text-slate-400 mb-2" />
          <p className="text-sm text-slate-600 font-medium mb-1">Add tenant via National ID photo</p>
          <p className="text-xs text-slate-400 mb-3">Claude Vision will extract name, ID number, and date of birth</p>
          <label className="cursor-pointer px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
            Choose photo
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
          </label>
        </div>
      )}

      {stage === 'extracting' && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 size={20} className="animate-spin text-green-600" />
          <p className="text-sm text-slate-600">Reading ID card with Claude Vision...</p>
        </div>
      )}

      {(stage === 'confirm' || stage === 'saving') && (
        <div className="flex gap-4">
          {/* Preview */}
          {preview && (
            <img src={preview} alt="ID" className="w-36 h-24 object-cover rounded-lg border border-slate-200 flex-shrink-0" />
          )}

          {/* Fields */}
          <div className="flex-1 space-y-2">
            <div>
              <label className="text-xs text-slate-500">Full Name *</label>
              <input
                value={fields.full_name}
                onChange={e => setFields(f => ({ ...f, full_name: e.target.value }))}
                className="w-full mt-0.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">National ID No.</label>
                <input
                  value={fields.national_id_number}
                  onChange={e => setFields(f => ({ ...f, national_id_number: e.target.value }))}
                  className="w-full mt-0.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500">Date of Birth</label>
                <input
                  type="date"
                  value={fields.date_of_birth}
                  onChange={e => setFields(f => ({ ...f, date_of_birth: e.target.value }))}
                  className="w-full mt-0.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500">Phone (add manually)</label>
              <input
                value={fields.phone}
                onChange={e => setFields(f => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. 0701 234 567"
                className="w-full mt-0.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={save}
                disabled={stage === 'saving'}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {stage === 'saving'
                  ? <Loader2 size={14} className="animate-spin" />
                  : <CheckCircle size={14} />
                }
                Save Tenant
              </button>
              <button onClick={cancel} className="px-4 py-1.5 text-sm text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
