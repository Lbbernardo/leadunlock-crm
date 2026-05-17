import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Unlock, Building2, MapPin, Tag, Users, ChevronRight, Check, CreditCard, AlertCircle, Briefcase } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')


const LEAD_CATEGORIES = [
  { id: 'final-expense',      label: 'Gastos finales',        icon: '🕊️', description: 'Seguros de gastos funerarios' },
  { id: 'financial-products', label: 'Productos financieros', icon: '💰', description: 'UIL · Anualidades · Whole Life · Seguro de vida' },
  { id: 'life-insurance',     label: 'Seguros de vida',       icon: '🛡️', description: 'Pólizas de seguro de vida',    locked: true },
  { id: 'medicare',           label: 'Medicare / Medicaid',   icon: '🏥', description: 'Planes Medicare y Medicaid',  locked: true },
  { id: 'auto-insurance',     label: 'Seguros de auto',       icon: '🚗', description: 'Seguros vehiculares',         locked: true },
  { id: 'real-estate',        label: 'Bienes raíces',         icon: '🏠', description: 'Compra, venta y renta',      locked: true },
]

const US_CITIES = [
  'Atlanta, GA', 'Austin, TX', 'Baltimore, MD', 'Boston, MA', 'Charlotte, NC',
  'Chicago, IL', 'Cleveland, OH', 'Columbus, OH', 'Dallas, TX', 'Denver, CO',
  'Detroit, MI', 'El Paso, TX', 'Fort Worth, TX', 'Fresno, CA', 'Houston, TX',
  'Indianapolis, IN', 'Jacksonville, FL', 'Kansas City, MO', 'Las Vegas, NV',
  'Long Beach, CA', 'Los Angeles, CA', 'Louisville, KY', 'Memphis, TN',
  'Mesa, AZ', 'Miami, FL', 'Milwaukee, WI', 'Minneapolis, MN', 'Nashville, TN',
  'New Orleans, LA', 'New York, NY', 'Newark, NJ', 'Oklahoma City, OK',
  'Omaha, NE', 'Orlando, FL', 'Philadelphia, PA', 'Phoenix, AZ',
  'Portland, OR', 'Raleigh, NC', 'Sacramento, CA', 'San Antonio, TX',
  'San Diego, CA', 'San Francisco, CA', 'San Jose, CA', 'Seattle, WA',
  'Tampa, FL', 'Tucson, AZ', 'Tulsa, OK', 'Virginia Beach, VA',
  'Washington, DC', 'Hialeah, FL', 'Fort Lauderdale, FL', 'St. Petersburg, FL',
  'Orlando, FL', 'Cape Coral, FL', 'Tallahassee, FL', 'Pembroke Pines, FL',
  'Hollywood, FL', 'Miramar, FL', 'Gainesville, FL', 'Coral Springs, FL',
  'Brooklyn, NY', 'Queens, NY', 'Bronx, NY', 'Staten Island, NY', 'Buffalo, NY',
  'Aurora, CO', 'Colorado Springs, CO', 'Henderson, NV', 'North Las Vegas, NV',
  'Chandler, AZ', 'Scottsdale, AZ', 'Gilbert, AZ', 'Glendale, AZ',
  'Riverside, CA', 'Anaheim, CA', 'Stockton, CA', 'Bakersfield, CA',
  'Oakland, CA', 'San Bernardino, CA', 'Santa Ana, CA',
  'Arlington, TX', 'Corpus Christi, TX', 'Laredo, TX', 'Lubbock, TX',
  'Garland, TX', 'Irving, TX', 'Plano, TX', 'Frisco, TX',
]

const BUDGETS = [
  { label: '$200 - $400 / mes', value: '200-400' },
  { label: '$500 - $700 / mes', value: '500-700' },
  { label: '$800 - $1,000 / mes', value: '800-1000' },
  { label: 'Más de $1,000 / mes', value: '1000+' },
]

const STEPS = [
  { id: 1, label: 'Tu negocio' },
  { id: 2, label: 'Tu campaña' },
  { id: 3, label: 'Activación' },
  { id: 4, label: 'Listo' },
]

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step.id < current ? 'bg-green-500 text-white' :
              step.id === current ? 'bg-slate-900 text-white ring-2 ring-green-500' :
              'bg-slate-800 text-slate-500'
            }`}>
              {step.id < current ? <Check size={16} /> : step.id}
            </div>
            <span className={`text-xs mt-1.5 font-medium ${step.id === current ? 'text-white' : 'text-slate-600'}`}>
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 mb-5 ${step.id < current ? 'bg-green-500' : 'bg-slate-800'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function Step1({ data, onChange, onNext }) {
  const valid = data.companyName && data.city && data.categories.length > 0


  function toggleCategory(id) {
    onChange({ ...data, categories: [id] })
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Cuéntanos sobre tu negocio</h2>
        <p className="text-slate-400 text-sm">Usaremos esta info para crear campañas optimizadas para ti.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Nombre de tu empresa</label>
        <div className="relative">
          <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={data.companyName}
            onChange={e => onChange({ ...data, companyName: e.target.value })}
            placeholder="Ej: García Insurance Agency"
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          ¿Para qué compañía de seguros trabajas?
          <span className="text-slate-500 font-normal ml-1 text-xs">(opcional)</span>
        </label>
        <div className="relative">
          <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={data.insuranceCompany}
            onChange={e => onChange({ ...data, insuranceCompany: e.target.value })}
            placeholder="Ej: Mutual of Omaha, Transamerica, Aetna..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          ¿Qué tipo de leads quieres recibir?
        </label>
        <p className="text-xs text-slate-500 mb-3">Selecciona uno. Toda tu campaña se enfoca en un solo nicho.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {LEAD_CATEGORIES.map(cat => {
            const isSelected = data.categories.includes(cat.id)
            return (
              <button
                key={cat.id}
                type="button"
                disabled={cat.locked}
                onClick={() => !cat.locked && toggleCategory(cat.id)}
                className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  cat.locked
                    ? 'border-slate-800 bg-slate-900/30 opacity-40 cursor-not-allowed'
                    : isSelected
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="text-xl mt-0.5">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${isSelected ? 'text-green-400' : 'text-white'}`}>
                    {cat.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                </div>
                {isSelected && (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={10} className="text-white" />
                  </div>
                )}
                {cat.locked && (
                  <span className="absolute top-2 right-2 text-xs bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded-full">
                    Próximo
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {data.categories.length === 0 && (
          <p className="text-xs text-amber-500 mt-2">Selecciona un nicho para continuar.</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Ciudad</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <select
              value={data.city}
              onChange={e => onChange({ ...data, city: e.target.value })}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none"
            >
              <option value="">Selecciona tu ciudad</option>
              {US_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Teléfono de contacto</label>
          <input
            type="tel"
            value={data.phone}
            onChange={e => onChange({ ...data, phone: e.target.value })}
            placeholder="+1 305 000 0000"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">¿Qué producto o servicio vendes? (opcional)</label>
        <textarea
          value={data.productDescription}
          onChange={e => onChange({ ...data, productDescription: e.target.value })}
          placeholder="Ej: Vendemos pólizas de gastos finales para adultos mayores de 50-85 años..."
          rows={2}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
        />
      </div>

      <Button onClick={onNext} disabled={!valid} className="w-full py-3 text-base">
        Continuar <ChevronRight size={18} />
      </Button>
    </div>
  )
}

const GOALS = [
  'Conseguir citas / demos',
  'Vender directamente por WhatsApp',
  'Llenar mi pipeline de ventas',
  'Crecer mi lista de prospectos',
  'Otro',
]

function Step2({ data, onChange, onNext, onBack }) {
  const isOtherGoal = data.goal === 'Otro' || (data.goal && !GOALS.slice(0, -1).includes(data.goal))
  const selectedGoalOption = GOALS.includes(data.goal) ? data.goal : (isOtherGoal ? 'Otro' : '')
  const otherGoalText = isOtherGoal && data.goal !== 'Otro' ? data.goal : (data.otherGoalText || '')

  function selectGoal(g) {
    if (g === 'Otro') {
      onChange({ ...data, goal: 'Otro', otherGoalText: '' })
    } else {
      onChange({ ...data, goal: g, otherGoalText: '' })
    }
  }

  function setOtherGoalText(text) {
    onChange({ ...data, goal: text || 'Otro', otherGoalText: text })
  }

  const valid = data.targetAudience && data.budget && data.goal && data.goal !== 'Otro'
  const hasFinancial = data.categories.includes('financial-products')

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Diseña tu campaña</h2>
        <p className="text-slate-400 text-sm">Nosotros creamos y manejamos tus campañas en Meta Ads.</p>
      </div>

      {hasFinancial && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-300">
          <p className="font-semibold mb-1">⚠️ Nota sobre productos financieros en Meta Ads</p>
          <p className="text-amber-400/80 text-xs leading-relaxed">
            Meta no permite segmentar por edad para productos financieros (UIL, Anualidades, Whole Life).
            Nuestras campañas se enfocan en intereses, comportamientos y audiencias similares — sin restricciones de edad.
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Users size={14} className="inline mr-1" />
          ¿A quién le vendes? (cliente ideal)
        </label>
        <textarea
          value={data.targetAudience}
          onChange={e => onChange({ ...data, targetAudience: e.target.value })}
          placeholder={
            hasFinancial
              ? 'Ej: Personas interesadas en proteger su patrimonio, que buscan opciones de ahorro e inversión con beneficios de seguro de vida...'
              : 'Ej: Adultos de 50-85 años, que buscan proteger a su familia de gastos funerarios...'
          }
          rows={3}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          ¿En qué estado(s) quieres vender?
          <span className="text-slate-500 font-normal ml-1 text-xs">Preferiblemente donde tengas tu licencia</span>
        </label>
        <input
          value={data.targetState}
          onChange={e => onChange({ ...data, targetState: e.target.value })}
          placeholder="Ej: Florida, Texas, California"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">¿Cuántos leads necesitas al mes?</label>
        <input
          type="number"
          value={data.leadsPerMonth}
          onChange={e => onChange({ ...data, leadsPerMonth: e.target.value })}
          placeholder="Ej: 30"
          min="10"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
        />
        {data.leadsPerMonth && (
          <p className="text-xs text-slate-500 mt-1.5">
            Estimado: desde ${(data.leadsPerMonth * 12).toLocaleString()} / mes en leads
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Tag size={14} className="inline mr-1" />
          Presupuesto mensual para leads
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BUDGETS.map(b => (
            <button
              key={b.value}
              onClick={() => onChange({ ...data, budget: b.value })}
              className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
                data.budget === b.value
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">¿Cuál es tu objetivo principal?</label>
        <div className="space-y-2">
          {GOALS.map(g => (
            <button
              key={g}
              onClick={() => selectGoal(g)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
                selectedGoalOption === g
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedGoalOption === g ? 'border-green-500 bg-green-500' : 'border-slate-600'
              }`}>
                {selectedGoalOption === g && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              {g}
            </button>
          ))}
        </div>
        {selectedGoalOption === 'Otro' && (
          <textarea
            value={otherGoalText}
            onChange={e => setOtherGoalText(e.target.value)}
            placeholder="Describe tu objetivo..."
            rows={2}
            autoFocus
            className="mt-3 w-full px-4 py-3 bg-slate-800 border border-green-500/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none text-sm"
          />
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1 py-3 border-slate-700 text-slate-400">
          Atrás
        </Button>
        <Button onClick={onNext} disabled={!valid} className="flex-2 py-3 flex-1">
          Continuar <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  )
}

const CARD_OPTIONS = {
  style: {
    base: { fontSize: '15px', color: '#F1F5F9', fontFamily: 'Inter, sans-serif', '::placeholder': { color: '#475569' } },
    invalid: { color: '#EF4444' },
  },
}

function PaymentForm({ data, onSuccess, onBack }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [appliedCodeData, setAppliedCodeData] = useState(null)
  const [couponError, setCouponError] = useState(null)
  const { isMock, user } = useAuth()

  const discountPct = appliedCodeData?.discount_pct || 0
  const finalAmount = discountPct > 0 ? Math.round(100 * (1 - discountPct / 100)) : 100
  const isFree = finalAmount === 0

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase()
    if (!code) return setCouponError('Ingresa un código.')
    setCouponError(null)
    setCouponLoading(true)

    if (isMock) {
      setAppliedCodeData({ id: null, discount_pct: 100, used_count: 0, max_uses: null })
      setCouponLoading(false)
      return
    }

    const { data: row } = await supabase
      .from('discount_codes')
      .select('id, discount_pct, max_uses, used_count, expires_at, active')
      .eq('code', code)
      .maybeSingle()

    if (!row) { setCouponError('Código inválido.'); setCouponLoading(false); return }
    if (!row.active) { setCouponError('Este código está desactivado.'); setCouponLoading(false); return }
    if (row.expires_at && new Date(row.expires_at) < new Date()) { setCouponError('Este código ha vencido.'); setCouponLoading(false); return }
    if (row.max_uses !== null && row.used_count >= row.max_uses) { setCouponError('Este código ya agotó sus usos.'); setCouponLoading(false); return }

    setAppliedCodeData(row)
    setCouponLoading(false)
  }

  async function handlePay(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isMock || isFree) {
      await new Promise(r => setTimeout(r, 900))
      if (appliedCodeData?.id) {
        await supabase.from('discount_codes')
          .update({ used_count: appliedCodeData.used_count + 1 })
          .eq('id', appliedCodeData.id)
      }
      onSuccess()
      return
    }

    try {
      const res = await fetch('/api/stripe/create-activation-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount, email: user?.email, description: 'Activación cuenta LeadUnlock' }),
      })
      const { clientSecret, error: apiErr } = await res.json()
      if (apiErr) throw new Error(apiErr)

      const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      })
      if (stripeErr) throw new Error(stripeErr.message)
      if (paymentIntent.status === 'succeeded') {
        await fetch('/api/stripe/confirm-activation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id, userId: user?.id }),
        })
        if (appliedCodeData?.id) {
          await supabase.from('discount_codes')
            .update({ used_count: appliedCodeData.used_count + 1 })
            .eq('id', appliedCodeData.id)
        }
        onSuccess()
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const categoryLabels = data.categories.map(id => {
    const cat = LEAD_CATEGORIES.find(c => c.id === id)
    return cat ? cat.label : id
  })

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Activa tu cuenta</h2>
        <p className="text-slate-400 text-sm">Pago único de activación para empezar a recibir leads.</p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Resumen de tu cuenta</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Empresa</span>
            <span className="text-white font-medium">{data.companyName}</span>
          </div>
          <div className="flex justify-between items-start gap-4">
            <span className="text-slate-400 flex-shrink-0">Categorías</span>
            <span className="text-white text-right">{categoryLabels.join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Leads estimados/mes</span>
            <span className="text-white">{data.leadsPerMonth || '—'}</span>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-3">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-xs text-green-400">
            🎁 Si desbloqueas $1,000 en leads, te devolvemos estos $100 como crédito en tu cuenta.
          </div>
        </div>
      </div>

      {/* Código de descuento */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Código de descuento (opcional)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null) }}
            placeholder="Ej: WELCOME50"
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm uppercase"
          />
          <button
            type="button"
            onClick={applyCoupon}
            disabled={couponLoading}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {couponLoading ? '…' : 'Aplicar'}
          </button>
        </div>
        {couponError && <p className="text-xs text-red-400 mt-1.5">{couponError}</p>}
        {appliedCodeData && (
          <div className="flex items-center gap-2 mt-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
            <Check size={14} className="text-green-400 flex-shrink-0" />
            <p className="text-xs text-green-400 font-medium">{appliedCodeData.discount_pct}% de descuento aplicado</p>
          </div>
        )}
      </div>

      {/* Precio */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4">
        <div>
          <p className="text-white font-semibold">Activación de cuenta</p>
          <p className="text-slate-500 text-xs">Pago único · No recurrente</p>
        </div>
        <div className="text-right">
          {appliedCodeData && <p className="text-slate-500 text-sm line-through">$100</p>}
          <span className="text-3xl font-extrabold text-white">
            ${finalAmount}
          </span>
        </div>
      </div>

      {!isMock && !isFree && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Datos de tarjeta</label>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all">
            <CardElement options={CARD_OPTIONS} />
          </div>
          <p className="text-xs text-slate-500 mt-2">Test: <code>4242 4242 4242 4242</code> · 12/34 · 123</p>
        </div>
      )}

      {(isMock || isFree) && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-400">
          {isFree ? '✅ Código aplicado — activación sin costo.' : 'Modo demo activo — el pago se simulará sin cargo real.'}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-800 text-red-400 rounded-xl text-sm">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="ghost" onClick={onBack} className="text-slate-500 hover:text-white">
          Atrás
        </Button>
        <Button type="submit" loading={loading} className="flex-1 py-3 text-base">
          <CreditCard size={18} />
          {isFree ? `Activar cuenta — $${finalAmount}` : `Pagar $${finalAmount} y activar cuenta`}
        </Button>
      </div>
    </form>
  )
}

function Step4({ data }) {
  const navigate = useNavigate()
  const categoryLabels = data.categories.map(id => {
    const cat = LEAD_CATEGORIES.find(c => c.id === id)
    return cat ? `${cat.icon} ${cat.label}` : id
  })

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
        <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
          <Check size={32} className="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-2">¡Cuenta activada!</h2>
        <p className="text-slate-400">
          Recibimos la información de <strong className="text-white">{data.companyName}</strong>.
          Nuestro equipo creará tus campañas en las próximas <strong className="text-green-400">24-48 horas</strong>.
        </p>
      </div>

      {categoryLabels.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {categoryLabels.map(label => (
            <span key={label} className="bg-green-500/10 text-green-400 text-xs font-medium px-3 py-1.5 rounded-full border border-green-500/20">
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">¿Qué sigue?</h3>
        {[
          { step: '1', text: 'Nuestro equipo revisa tu briefing de campaña', time: 'Hoy' },
          { step: '2', text: 'Creamos y activamos tu campaña personalizada en Meta Ads', time: '24-48h' },
          { step: '3', text: 'Los leads empiezan a llegar a tu dashboard', time: 'En 48h' },
          { step: '4', text: 'Abre los leads que te interesan y empieza a cerrar negocios', time: 'Tú decides' },
        ].map(item => (
          <div key={item.step} className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white mt-0.5">
              {item.step}
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">{item.text}</p>
            </div>
            <span className="text-xs text-slate-500 flex-shrink-0">{item.time}</span>
          </div>
        ))}
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-green-400">
        🎁 Recuerda: desbloquea $1,000 en leads y te devolvemos los $100 de activación como crédito.
      </div>

      <Button onClick={() => navigate('/dashboard')} className="w-full py-3 text-base">
        Ir a mi dashboard <ChevronRight size={18} />
      </Button>
    </div>
  )
}

const EMPTY = {
  companyName: '', insuranceCompany: '', categories: [], city: '', phone: '',
  productDescription: '', targetAudience: '', leadsPerMonth: '',
  budget: '', goal: '', otherGoalText: '', targetState: '',
}

function OnboardingContent() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState(EMPTY)
  const { user, isMock, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  async function handlePaymentSuccess() {
    if (!isMock && user) {
      const categoryLabels = data.categories.map(id => {
        const cat = LEAD_CATEGORIES.find(c => c.id === id)
        return cat ? cat.label : id
      })
      const productDescParts = []
      if (data.insuranceCompany) productDescParts.push(`Compañía: ${data.insuranceCompany}`)
      if (data.productDescription) productDescParts.push(data.productDescription)

      await supabase
        .from('clients')
        .update({
          company_name: data.companyName,
          phone: data.phone,
          city: data.city,
          product_description: productDescParts.join('\n') || null,
          target_audience: data.targetAudience,
          leads_per_month: data.leadsPerMonth ? parseInt(data.leadsPerMonth) : null,
          budget: data.budget,
          goal: data.goal,
          target_state: data.targetState || null,
          categories: categoryLabels,
          status: 'active',
        })
        .eq('user_id', user.id)
      await refreshProfile()
    }
    setStep(4)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
              <Unlock size={18} className="text-white" />
            </div>
            <span className="font-bold text-white text-xl">LeadUnlock CRM</span>
          </div>
          {step < 4 && (
            <button onClick={handleSignOut} className="flex items-center gap-1.5 text-slate-600 hover:text-slate-400 text-xs transition-colors">
              <LogOut size={13} /> Salir
            </button>
          )}
        </div>

        <StepIndicator current={step} />

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8">
          {step === 1 && <Step1 data={data} onChange={setData} onNext={() => setStep(2)} />}
          {step === 2 && <Step2 data={data} onChange={setData} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && (
            <Elements stripe={stripePromise}>
              <PaymentForm data={data} onSuccess={handlePaymentSuccess} onBack={() => setStep(2)} />
            </Elements>
          )}
          {step === 4 && <Step4 data={data} />}
        </div>
      </div>
    </div>
  )
}

export default function Onboarding() {
  return <OnboardingContent />
}
