import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Zap, Building2, MapPin, Tag, Users, ChevronRight, Check, CreditCard, AlertCircle, Briefcase } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

const INDUSTRIES = [
  'Bienes raíces / Inmobiliaria',
  'Seguros',
  'Servicios financieros / Créditos',
  'Educación / Cursos',
  'Salud / Medicina estética',
  'Automotriz',
  'Restaurantes / Alimentos',
  'Construcción / Remodelación',
  'E-commerce',
  'Consultoría / Servicios profesionales',
  'Otro',
]

const BUDGETS = [
  { label: '$500 - $1,000 / mes', value: '500-1000' },
  { label: '$1,000 - $3,000 / mes', value: '1000-3000' },
  { label: '$3,000 - $5,000 / mes', value: '3000-5000' },
  { label: '$5,000+ / mes', value: '5000+' },
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
            <div className={`w-16 h-0.5 mx-2 mb-5 ${step.id < current ? 'bg-green-500' : 'bg-slate-800'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function Step1({ data, onChange, onNext }) {
  const valid = data.companyName && data.industry && data.city

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
            placeholder="Inmobiliaria García & Asociados"
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Industria</label>
        <div className="relative">
          <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <select
            value={data.industry}
            onChange={e => onChange({ ...data, industry: e.target.value })}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none"
          >
            <option value="">Selecciona tu industria</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Ciudad / Estado</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={data.city}
              onChange={e => onChange({ ...data, city: e.target.value })}
              placeholder="CDMX"
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Teléfono de contacto</label>
          <input
            type="tel"
            value={data.phone}
            onChange={e => onChange({ ...data, phone: e.target.value })}
            placeholder="+52 55 0000 0000"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">¿Qué producto o servicio vendes?</label>
        <textarea
          value={data.productDescription}
          onChange={e => onChange({ ...data, productDescription: e.target.value })}
          placeholder="Ej: Vendemos créditos hipotecarios para personas que quieren comprar su primera casa en CDMX con ingresos comprobables de $15,000/mes..."
          rows={3}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
        />
      </div>

      <Button onClick={onNext} disabled={!valid} className="w-full py-3 text-base">
        Continuar <ChevronRight size={18} />
      </Button>
    </div>
  )
}

function Step2({ data, onChange, onNext, onBack }) {
  const valid = data.targetAudience && data.budget && data.goal

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Diseña tu campaña</h2>
        <p className="text-slate-400 text-sm">Nosotros creamos y manejamos tus campañas en Meta Ads.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Users size={14} className="inline mr-1" />
          ¿A quién le vendes? (cliente ideal)
        </label>
        <textarea
          value={data.targetAudience}
          onChange={e => onChange({ ...data, targetAudience: e.target.value })}
          placeholder="Ej: Hombres y mujeres de 28-45 años, profesionistas, que rentan y quieren comprar casa propia, con ingresos de $20k-50k/mes..."
          rows={3}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
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
            Estimado: ${(data.leadsPerMonth * 20).toLocaleString()} MXN/mes en desbloqueos
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Tag size={14} className="inline mr-1" />
          Presupuesto mensual para campañas
        </label>
        <div className="grid grid-cols-2 gap-3">
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
          {['Conseguir citas / demos', 'Vender directamente por WhatsApp', 'Llenar mi pipeline de ventas', 'Crecer mi lista de prospectos'].map(g => (
            <button
              key={g}
              onClick={() => onChange({ ...data, goal: g })}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
                data.goal === g
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                data.goal === g ? 'border-green-500 bg-green-500' : 'border-slate-600'
              }`}>
                {data.goal === g && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              {g}
            </button>
          ))}
        </div>
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
  const { isMock } = useAuth()

  async function handlePay(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (isMock) {
      await new Promise(r => setTimeout(r, 1200))
      onSuccess()
      return
    }

    try {
      const res = await fetch('/api/stripe/create-activation-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100, description: 'Activación cuenta LeadUnlock' }),
      })
      const { clientSecret, error: apiErr } = await res.json()
      if (apiErr) throw new Error(apiErr)

      const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      })
      if (stripeErr) throw new Error(stripeErr.message)
      if (paymentIntent.status === 'succeeded') onSuccess()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Activa tu cuenta</h2>
        <p className="text-slate-400 text-sm">Pago único de activación para empezar a recibir leads.</p>
      </div>

      {/* Resumen */}
      <div className="bg-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Resumen de tu cuenta</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Empresa</span>
            <span className="text-white font-medium">{data.companyName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Industria</span>
            <span className="text-white">{data.industry}</span>
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

      {/* Precio */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4">
        <div>
          <p className="text-white font-semibold">Activación de cuenta</p>
          <p className="text-slate-500 text-xs">Pago único · No recurrente</p>
        </div>
        <span className="text-3xl font-extrabold text-white">$100</span>
      </div>

      {/* Card */}
      {!isMock && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Datos de tarjeta</label>
          <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all">
            <CardElement options={CARD_OPTIONS} />
          </div>
          <p className="text-xs text-slate-500 mt-2">Test: <code>4242 4242 4242 4242</code> · 12/34 · 123</p>
        </div>
      )}

      {isMock && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-400">
          Modo demo activo — el pago se simulará sin cargo real.
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
          <CreditCard size={18} /> Pagar $100 y activar cuenta
        </Button>
      </div>
    </form>
  )
}

function Step4({ data }) {
  const navigate = useNavigate()
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

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">¿Qué sigue?</h3>
        {[
          { step: '1', text: 'Nuestro equipo revisa tu briefing de campaña', time: 'Hoy' },
          { step: '2', text: 'Creamos y activamos tus campañas en Meta Ads', time: '24-48h' },
          { step: '3', text: 'Los leads empiezan a llegar a tu dashboard', time: 'En 48h' },
          { step: '4', text: 'Desbloquea los leads que te interesan por $20 c/u', time: 'Tú decides' },
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
  companyName: '', industry: '', city: '', phone: '',
  productDescription: '', targetAudience: '', leadsPerMonth: '',
  budget: '', goal: '',
}

function OnboardingContent() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState(EMPTY)

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-xl">LeadUnlock CRM</span>
        </div>

        <StepIndicator current={step} />

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {step === 1 && <Step1 data={data} onChange={setData} onNext={() => setStep(2)} />}
          {step === 2 && <Step2 data={data} onChange={setData} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && (
            <Elements stripe={stripePromise}>
              <PaymentForm data={data} onSuccess={() => setStep(4)} onBack={() => setStep(2)} />
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
