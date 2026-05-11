import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Lock, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const UNLOCK_COUPONS = { 'PRUEBA100': 100, 'WELCOME50': 50, 'PARTNER25': 25 }

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#0F172A',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': { color: '#94A3B8' },
    },
    invalid: { color: '#EF4444' },
  },
}

function CheckoutForm({ lead, clientId, amount, onSuccess, onClose }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState(null)

  const discount = appliedCoupon ? UNLOCK_COUPONS[appliedCoupon] : 0
  const finalAmount = Math.round(amount * (1 - discount / 100))
  const isFree = finalAmount === 0

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase()
    if (UNLOCK_COUPONS[code]) {
      setAppliedCoupon(code)
      setCouponError(null)
    } else {
      setCouponError('Código inválido.')
      setAppliedCoupon(null)
    }
  }

  async function handleFreeUnlock() {
    setLoading(true)
    try {
      const { error } = await supabase.from('lead_unlocks').insert({ lead_id: lead.id, client_id: clientId })
      if (error) throw new Error(error.message)
      await supabase.from('leads').update({ is_locked: false }).eq('id', lead.id)
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (isFree) return handleFreeUnlock()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, clientId, amount: finalAmount }),
      })

      const { clientSecret, error: apiError } = await res.json()
      if (apiError) throw new Error(apiError)

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      })

      if (stripeError) throw new Error(stripeError.message)

      if (paymentIntent.status === 'succeeded') {
        const confirmRes = await fetch('/api/stripe/confirm-unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id, leadId: lead.id, clientId }),
        })
        const confirmData = await confirmRes.json()
        if (confirmData.error) throw new Error(confirmData.error)
        onSuccess()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Lock size={18} className="text-green-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">Desbloquear lead completo</p>
          <p className="text-xs text-slate-500">{lead.full_name} · {lead.city}</p>
        </div>
        <div className="ml-auto text-right">
          {discount > 0 && <p className="text-xs text-slate-400 line-through">${amount}</p>}
          <span className="text-lg font-bold text-slate-900">${finalAmount}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Código de descuento"
          value={couponInput}
          onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null) }}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
        />
        <Button type="button" variant="outline" onClick={applyCoupon}>Aplicar</Button>
      </div>
      {couponError && <p className="text-xs text-red-500 -mt-3">{couponError}</p>}
      {appliedCoupon && <p className="text-xs text-green-600 -mt-3">{discount}% de descuento aplicado</p>}

      {!isFree && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Datos de tarjeta</label>
          <div className="border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-400 transition-all">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
        <Button type="submit" loading={loading} disabled={!isFree && !stripe} className="flex-1">
          {isFree ? 'Desbloquear gratis' : `Pagar $${finalAmount}`}
        </Button>
      </div>
    </form>
  )
}

export default function PaymentModal({ open, onClose, lead, clientId, onSuccess }) {
  if (!lead) return null

  const amount = lead.price ? Math.round(lead.price) : 12

  function handleSuccess() {
    onSuccess(lead.id)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Desbloquear lead">
      <Elements stripe={stripePromise}>
        <CheckoutForm
          lead={lead}
          clientId={clientId}
          amount={amount}
          onSuccess={handleSuccess}
          onClose={onClose}
        />
      </Elements>
    </Modal>
  )
}
