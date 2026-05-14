import { useState, useEffect } from 'react'
import { Building2, MapPin, Phone, Mail, CreditCard, AlertTriangle, Check, Save, User, Plus, X, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

const BRAND_LABELS = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  discover: 'Discover',
  diners: 'Diners Club',
  jcb: 'JCB',
  unionpay: 'UnionPay',
}

const CARD_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      color: '#0f172a',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#ef4444' },
  },
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

function AddCardForm({ onSuccess, onClose }) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cardComplete, setCardComplete] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripe || !elements || !cardComplete) return
    setLoading(true)
    setError(null)

    try {
      // 1. Crear SetupIntent
      const res = await fetch('/api/stripe/create-setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      })
      const { clientSecret, error: apiErr } = await res.json()
      if (apiErr) throw new Error(apiErr)

      // 2. Confirmar con Stripe (valida que la tarjeta es real)
      const { error: stripeErr, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      })
      if (stripeErr) throw new Error(stripeErr.message)
      if (setupIntent.status !== 'succeeded') throw new Error('No se pudo verificar la tarjeta')

      // 3. Guardar en Supabase
      const saveRes = await fetch('/api/stripe/confirm-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupIntentId: setupIntent.id, userId: user?.id }),
      })
      const saveData = await saveRes.json()
      if (!saveData.success) throw new Error(saveData.error || 'Error al guardar tarjeta')

      onSuccess({ last4: saveData.last4, brand: saveData.brand })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
        <CardElement
          options={CARD_OPTIONS}
          onChange={e => {
            setCardComplete(e.complete)
            if (e.error) setError(e.error.message)
            else setError(null)
          }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-xs">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Lock size={12} />
          Encriptado con Stripe
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <Button
          type="submit"
          loading={loading}
          disabled={!cardComplete || loading}
          className="flex-1"
        >
          <Check size={15} />
          Guardar tarjeta
        </Button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

function PasswordForm({ onSuccess, onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const strength = (() => {
    const p = form.next
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'][strength]

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.next !== form.confirm) { setError('Las contraseñas no coinciden.'); return }
    if (form.next.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    setLoading(true)
    setError(null)
    try {
      // Re-autenticar con contraseña actual
      const { data: { session } } = await supabase.auth.getSession()
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: session?.user?.email,
        password: form.current,
      })
      if (signInErr) { setError('La contraseña actual es incorrecta.'); setLoading(false); return }

      const { error: updateErr } = await supabase.auth.updateUser({ password: form.next })
      if (updateErr) throw updateErr
      onSuccess()
    } catch (err) {
      setError(err.message || 'Error al cambiar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  function Field({ id, label, value, visible, onToggle }) {
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <div className="relative">
          <input
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
            className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
            autoComplete={id === 'current' ? 'current-password' : 'new-password'}
          />
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field id="current" label="Contraseña actual" value={form.current}
        visible={show.current} onToggle={() => setShow(s => ({ ...s, current: !s.current }))} />

      <Field id="next" label="Nueva contraseña" value={form.next}
        visible={show.next} onToggle={() => setShow(s => ({ ...s, next: !s.next }))} />

      {form.next.length > 0 && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-200'}`} />
            ))}
          </div>
          <p className={`text-xs font-medium ${['','text-red-500','text-amber-500','text-blue-500','text-green-600'][strength]}`}>
            {strengthLabel}
          </p>
        </div>
      )}

      <Field id="confirm" label="Confirmar nueva contraseña" value={form.confirm}
        visible={show.confirm} onToggle={() => setShow(s => ({ ...s, confirm: !s.confirm }))} />

      {form.confirm.length > 0 && form.next !== form.confirm && (
        <p className="text-xs text-red-500 -mt-2">Las contraseñas no coinciden</p>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-xs">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={loading}
          disabled={!form.current || !form.next || !form.confirm || loading}
          className="flex-1">
          <Lock size={15} />
          Actualizar contraseña
        </Button>
        <button type="button" onClick={onClose}
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ company_name: '', phone: '', city: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAddCard, setShowAddCard] = useState(false)
  const [cardAdded, setCardAdded] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)

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

  function handlePasswordSuccess() {
    setShowPasswordForm(false)
    setPasswordChanged(true)
    setTimeout(() => setPasswordChanged(false), 3000)
  }

  function handleCardSuccess({ last4, brand }) {
    setProfile(p => ({ ...p, payment_method_last4: last4, payment_method_brand: brand }))
    setShowAddCard(false)
    setCardAdded(true)
    setTimeout(() => setCardAdded(false), 3000)
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

        {/* Toast tarjeta agregada */}
        {cardAdded && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-6">
            <Check size={16} className="text-green-600" />
            <p className="text-green-700 text-sm font-medium">Tarjeta verificada y guardada correctamente</p>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {hasPaymentMethod && (
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
              <CardIcon brand={profile.payment_method_brand} />
              <div className="flex-1">
                <p className="font-medium text-slate-900 text-sm">
                  {BRAND_LABELS[profile.payment_method_brand] || 'Tarjeta'} ···· {profile.payment_method_last4}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Tarjeta guardada · predeterminada para desbloquear leads</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-full">Principal</span>
            </div>
          )}

          {/* Formulario agregar tarjeta */}
          {showAddCard ? (
            <div className="border border-slate-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-900">
                  {hasPaymentMethod ? 'Reemplazar tarjeta' : 'Agregar tarjeta'}
                </p>
                <button
                  onClick={() => setShowAddCard(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <Elements stripe={stripePromise}>
                <AddCardForm onSuccess={handleCardSuccess} onClose={() => setShowAddCard(false)} />
              </Elements>
            </div>
          ) : (
            !hasPaymentMethod && (
              <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl mb-4">
                <CreditCard size={28} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">Sin método de pago</p>
                <p className="text-slate-400 text-xs mt-1 mb-4">
                  Necesitas una tarjeta activa para desbloquear leads.
                </p>
              </div>
            )
          )}

          {!showAddCard && (
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl px-4 py-2.5 hover:bg-slate-50 hover:border-slate-300 transition-colors w-full sm:w-auto"
            >
              <Plus size={15} />
              {hasPaymentMethod ? 'Cambiar tarjeta' : 'Agregar método de pago'}
            </button>
          )}

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 text-xs leading-relaxed">
              <strong>Importante:</strong> Debes tener siempre un método de pago activo para poder desbloquear leads. Si no tienes tarjeta guardada, contacta a soporte.
            </p>
          </div>
        </div>
        {/* Seguridad */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-slate-500" />
              <h2 className="font-semibold text-slate-900">Seguridad</h2>
            </div>
          </div>

          {passwordChanged && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
              <Check size={16} className="text-green-600" />
              <p className="text-green-700 text-sm font-medium">Contraseña actualizada correctamente</p>
            </div>
          )}

          {showPasswordForm ? (
            <div className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-slate-900">Cambiar contraseña</p>
                <button
                  onClick={() => setShowPasswordForm(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <PasswordForm onSuccess={handlePasswordSuccess} onClose={() => setShowPasswordForm(false)} />
            </div>
          ) : (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl px-4 py-2.5 hover:bg-slate-50 hover:border-slate-300 transition-colors w-full sm:w-auto"
            >
              <Lock size={15} />
              Cambiar contraseña
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
