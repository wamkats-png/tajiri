import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ChevronRight, Check, Edit2, Globe, CreditCard } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { logOut } from '@/services/auth'
import { updateUserProfile, saveTracker } from '@/services/firestore'
import { useAppStore } from '@/store'
import { CURRENCIES, TRACKER_COLORS } from '@/utils/constants'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, tracker1, tracker2, setUser, setTracker } = useAppStore()

  const [logoutModal, setLogoutModal]     = useState(false)
  const [profileModal, setProfileModal]   = useState(false)
  const [currencyModal, setCurrencyModal] = useState(false)
  const [tracker1Modal, setTracker1Modal] = useState(false)
  const [tracker2Modal, setTracker2Modal] = useState(false)
  const [loggingOut, setLoggingOut]       = useState(false)
  const [saving, setSaving]               = useState(false)

  const [displayName, setDisplayName]         = useState(user?.displayName ?? '')
  const [defaultCurrency, setDefaultCurrency] = useState(user?.defaultCurrency ?? 'UGX')
  const [t1Name, setT1Name]   = useState(tracker1?.name ?? '')
  const [t1Color, setT1Color] = useState(tracker1?.color ?? '#0A7163')
  const [t2Name, setT2Name]   = useState(tracker2?.name ?? '')
  const [t2Color, setT2Color] = useState(tracker2?.color ?? '#3B82F6')

  async function handleLogout() {
    setLoggingOut(true)
    await logOut()
    setUser(null)
    navigate('/login')
  }

  async function handleSaveProfile() {
    if (!user) return
    setSaving(true)
    try {
      await updateUserProfile(user.uid, { displayName, defaultCurrency })
      setUser({ ...user, displayName, defaultCurrency })
      setProfileModal(false)
    } catch { } finally { setSaving(false) }
  }

  async function handleSaveTracker(slot: 'tracker1' | 'tracker2', name: string, color: string) {
    if (!user) return
    const tracker = slot === 'tracker1' ? tracker1 : tracker2
    if (!tracker) return
    setSaving(true)
    try {
      const updated = { ...tracker, name: name.trim() || tracker.name, color }
      await saveTracker(user.uid, updated)
      setTracker(slot, updated)
      slot === 'tracker1' ? setTracker1Modal(false) : setTracker2Modal(false)
    } catch { } finally { setSaving(false) }
  }

  return (
    <AppShell title="Settings">
      <div className="space-y-6 fade-up max-w-lg mx-auto">

        {/* Profile */}
        <section>
          <h2 className="text-xs font-semibold text-[#4a5568] uppercase tracking-widest mb-3">Account</h2>
          <Card>
            <div className="flex items-center gap-4 pb-4 mb-4 border-b border-[#2a3145]">
              <div className="w-14 h-14 rounded-2xl bg-[#0A7163]/20 border border-[#0A7163]/30 flex items-center justify-center flex-shrink-0">
                {user?.photoURL
                  ? <img src={user.photoURL} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                  : <span className="text-xl font-bold text-[#0D9B87]">{user?.displayName?.[0]?.toUpperCase() ?? '?'}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-[#f0f4ff] truncate">{user?.displayName}</p>
                <p className="text-sm text-[#4a5568] truncate">{user?.email}</p>
                <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#0A7163]/10 text-[#0D9B87]">
                  ✅ All Features Unlocked
                </div>
              </div>
            </div>
            <div className="space-y-0.5">
              <SettingRow icon={<Edit2 size={14} />} label="Edit Profile" onClick={() => setProfileModal(true)} />
              <SettingRow icon={<Globe size={14} />} label="Default Currency" value={user?.defaultCurrency ?? 'UGX'} onClick={() => setCurrencyModal(true)} />
              <SettingRow icon={<CreditCard size={14} />} label="Plan" value="Free · All Features" />
            </div>
          </Card>
        </section>

        {/* Trackers */}
        <section>
          <h2 className="text-xs font-semibold text-[#4a5568] uppercase tracking-widest mb-3">Trackers</h2>
          <div className="space-y-3">
            {tracker1 && (
              <TrackerCard
                tracker={tracker1}
                onEdit={() => { setT1Name(tracker1.name); setT1Color(tracker1.color); setTracker1Modal(true) }}
              />
            )}
            {tracker2 ? (
              <TrackerCard
                tracker={tracker2}
                onEdit={() => { setT2Name(tracker2.name); setT2Color(tracker2.color); setTracker2Modal(true) }}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-[#2a3145] bg-[#181d27]/50 p-4 text-center">
                <p className="text-xs text-[#4a5568]">Tracker 2 not set up yet. Complete onboarding to add it.</p>
              </div>
            )}
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-xs font-semibold text-[#4a5568] uppercase tracking-widest mb-3">About</h2>
          <Card>
            <div className="space-y-0.5">
              <SettingRow label="Version" value="1.0.0" />
              <SettingRow label="Platform" value="Web / PWA" />
              <SettingRow label="AI Engine" value="Claude (Anthropic)" />
            </div>
          </Card>
        </section>

        <Button variant="danger" fullWidth onClick={() => setLogoutModal(true)}>
          <LogOut size={15} /> Sign Out
        </Button>

        <p className="text-center text-[10px] text-[#2a3145] pb-4">Tajiri · Smart money, clear picture.</p>
      </div>

      {/* Edit Profile */}
      <Modal open={profileModal} onClose={() => setProfileModal(false)} title="Edit Profile">
        <div className="space-y-4">
          <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" fullWidth onClick={() => setProfileModal(false)}>Cancel</Button>
            <Button fullWidth loading={saving} onClick={handleSaveProfile}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Currency */}
      <Modal open={currencyModal} onClose={() => setCurrencyModal(false)} title="Default Currency">
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {CURRENCIES.map((c) => (
            <button key={c.code} onClick={() => { setDefaultCurrency(c.code); setCurrencyModal(false) }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                defaultCurrency === c.code ? 'border-[#0A7163] bg-[#0A7163]/10' : 'border-[#2a3145] bg-[#1e2535] hover:border-[#3a4155]'
              }`}>
              <span className="text-xl">{c.flag}</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-[#f0f4ff]">{c.name}</div>
                <div className="text-xs text-[#4a5568]">{c.code}</div>
              </div>
              {defaultCurrency === c.code && <Check size={14} className="text-[#0D9B87]" />}
            </button>
          ))}
        </div>
      </Modal>

      {/* Edit Tracker 1 */}
      <TrackerEditModal
        open={tracker1Modal}
        onClose={() => setTracker1Modal(false)}
        name={t1Name}
        color={t1Color}
        onNameChange={setT1Name}
        onColorChange={setT1Color}
        onSave={() => handleSaveTracker('tracker1', t1Name, t1Color)}
        saving={saving}
      />

      {/* Edit Tracker 2 */}
      <TrackerEditModal
        open={tracker2Modal}
        onClose={() => setTracker2Modal(false)}
        name={t2Name}
        color={t2Color}
        onNameChange={setT2Name}
        onColorChange={setT2Color}
        onSave={() => handleSaveTracker('tracker2', t2Name, t2Color)}
        saving={saving}
      />

      {/* Logout */}
      <Modal open={logoutModal} onClose={() => setLogoutModal(false)} title="Sign Out">
        <p className="text-sm text-[#8892aa] mb-6">Are you sure you want to sign out of Tajiri?</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setLogoutModal(false)}>Cancel</Button>
          <Button variant="danger" fullWidth loading={loggingOut} onClick={handleLogout}>Sign Out</Button>
        </div>
      </Modal>
    </AppShell>
  )
}

function TrackerCard({ tracker, onEdit }: { tracker: any; onEdit: () => void }) {
  return (
    <div className="rounded-2xl border border-[#2a3145] bg-[#181d27] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${tracker.color}20`, border: `1.5px solid ${tracker.color}40` }}>
            <div className="w-3 h-3 rounded-full" style={{ background: tracker.color }} />
          </div>
          <div>
            <div className="text-sm font-medium text-[#f0f4ff]">{tracker.name}</div>
            <div className="text-xs text-[#4a5568]">{tracker.currency} · Active</div>
          </div>
        </div>
        <button onClick={onEdit} className="text-xs text-[#0D9B87] hover:text-[#0A7163] transition-colors flex items-center gap-1">
          <Edit2 size={11} /> Edit
        </button>
      </div>
    </div>
  )
}

function TrackerEditModal({ open, onClose, name, color, onNameChange, onColorChange, onSave, saving }: any) {
  return (
    <Modal open={open} onClose={onClose} title="Edit Tracker">
      <div className="space-y-4">
        <Input label="Tracker Name" value={name} onChange={(e: any) => onNameChange(e.target.value)} placeholder="e.g. Home Budget" />
        <div>
          <label className="text-sm font-medium text-[#8892aa] block mb-3">Color</label>
          <div className="flex gap-2 flex-wrap">
            {TRACKER_COLORS.map((c) => (
              <button key={c} onClick={() => onColorChange(c)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ background: c, boxShadow: color === c ? `0 0 0 2px #0f1117, 0 0 0 4px ${c}` : 'none' }}>
                {color === c && <Check size={12} className="text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={saving} onClick={onSave}>Save</Button>
        </div>
      </div>
    </Modal>
  )
}

function SettingRow({ icon, label, value, onClick }: {
  icon?: React.ReactNode; label: string; value?: string; onClick?: () => void
}) {
  const inner = (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2.5 text-[#8892aa]">
        {icon}
        <span className="text-sm text-[#f0f4ff]">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {value && <span className="text-sm text-[#4a5568]">{value}</span>}
        {onClick && <ChevronRight size={14} className="text-[#2a3145]" />}
      </div>
    </div>
  )
  return onClick
    ? <button onClick={onClick} className="w-full hover:bg-[#1e2535] -mx-2 px-2 rounded-lg transition-colors">{inner}</button>
    : <div>{inner}</div>
}
