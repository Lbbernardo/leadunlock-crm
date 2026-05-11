import { useState, useEffect } from 'react'
import { Building2, MapPin, Phone, Mail, CreditCard, AlertTriangle, Check, Save, User } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const BRAND_LABELS = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  diners: 'Diners Club',
  jcb: 'JCB',
  unionpay: 'UnionPay',
}

function CardIcon({ brand }) {
  const colors = {
    visa: 'bg-blue-600',
    mastercard: 'bg-red-500',
    amex: 'bg-blue-400',
  }
  return (
    <div className={`w-10 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold ${colors[brand] || 'bg-slate-600'}`}>
      {(BRAND_LABELS[brand] || 'CARD').slice(0, 4).toUpperCase()}
    </div>
  )
}

export default function Profile() {
  const { user, clientId } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ company_name: '', phone: '', city: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const [{ data: userData }, { data: clientData }] = await Promise.all([
        supabase.from('users').select('email, full_name').eq('id', user.id).single(),
        supabase.from('clients').select('company_name, phone, city, status, payment_method_last4, payment_method_brand').eq('user_id', user.id).single(),
      ])
      setProfile({ ...userData, ...clientData })
      setForm({
        company_name: clientData?.company_name || '',
        phone: clientData?.phone || '',
        city: clientData?.city || '',
      })
      setLoading(false)
    }
    load()
  }, [user])

  async function handleSave() {
    setSaving(true)
    await supabase.from('clients').update({
      company_name: form.company_name,
      phone: form.phone,
      city: form.city,
    }).eq('user_id', user.id)
    setProfile(p => ({ ...p, ...form }))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const hasPaymentMethod = !!profile?.payment_method_last4

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>
          <p className="text-slate-500 mt-1">Información de tu cuenta y método de pago</p>
        </div>

        {/* Advertencia si no tiene método de pago */}
        {!hasPaymentMethod && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-semibold text-sm">No tienes un método de pago activo</p>
              <p className="text-red-600 text-xs mt-0.5 leading-relaxed">
                Para poder desbloquear leads necesitas tener una tarjeta guardada. Agrega un método de pago para continuar recibiendo tus contactos.
              </p>
            </div>
          </div>
        )}

        {/* Info de cuenta */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
              <User size={22} className="text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{profile?.full_name || profile?.email}</p>
              <p className="text-sm text-slate-500">{profile?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Building2 size={14} className="inline mr-1.5 text-slate-400" />
                Nombre de empresa
              </label>
              <input
                value={form.company_name}
                onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                placeholder="Tu empresa"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Phone size={14} className="inline mr-1.5 text-slate-400" />
                  Teléfono
                </label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 305 000 0000"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <MapPin size={14} className="inline mr-1.5 text-slate-400" />
                  Ciudad
                </label>
                <input
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="Miami, FL"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Mail size={14} className="inline mr-1.5 text-slate-400" />
                Email
              </label>
              <input
                value={profile?.email || ''}
                disabled
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <Button onClick={handleSave} loading={saving} className="mt-5 w-full sm:w-auto">
            <Save size={15} />
            {saved ? '¡Guardado!' : 'Guardar cambios'}
          </Button>
        </div>

        {/* Método de pago */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-slate-500" />
              <h2 className="font-semibold text-slate-900">Método de pago</h2>
            </div>
            {hasPaymentMethod && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                <Check size={12} /> Activo
              </span>
            )}
          </div>

          {hasPaymentMethod ? (
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <CardIcon brand={profile.payment_method_brand} />
              <div className="flex-1">
                <p className="font-medium text-slate-900 text-sm">
                  {BRAND_LABELS[profile.payment_method_brand] || 'Tarjeta'} ···· {profile.payment_method_last4}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Tarjeta guardada · usada para activación de cuenta</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-full">Principal</span>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
              <CreditCard size={28} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">Sin método de pago</p>
              <p className="text-slate-400 text-xs mt-1">
                La tarjeta se guarda automáticamente cuando realizas tu primer pago.
              </p>
            </div>
          )}

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 text-xs leading-relaxed">
              <strong>Importante:</strong> Debes tener siempre un método de pago activo para poder desbloquear leads. Si no tienes tarjeta guardada, contacta a soporte.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
