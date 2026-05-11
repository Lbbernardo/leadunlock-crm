import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, useStripe } from '@stripe/react-stripe-js'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Lock, AlertCircle, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const BRAND_LABELS = {
  visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express',
  discover: 'Discover', diners: 'Diners Club', jcb: 'JCB',
}

const BRAND_COLORS = {
  visa: 'bg-blue-600', mastercard: 'bg-red-500', amex: 'bg-blue-400',
}

function CardBadge({ brand, last4 }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold ${BRAND_COLORS[brand] || 'bg-slate-600'}`}>
        {(BRAND_LABELS[brand] || 'CARD').slice(0, 4).toUpperCase()}
      </div>
      <span className="text-sm font-medium text-slate-900">
        {BRAND_LABELS[brand] || 'Tarjeta'} ···· {last4}
      </span>
    </div>
  )
}

function CheckoutForm({ lead, clientId, amount, onSuccess, onClose }) {
  const stripe = useStripe()
  const { clientData } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const hasCard = !!clientData?.payment_method_last4
  const isPaymentRequired = clientData?.status === 'payment_required'

  async function handleConfirm() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/charge-saved-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, clientId }),
      })
      const data = await res.json()

      if (data.error === 'requires_action' && data.clientSecret && stripe) {
        // 3D Secure: autenticación adicional requerida
        const { error: stripeErr, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret)
        if (stripeErr) throw new Error(stripeErr.message)
        if (paymentIntent.status === 'succeeded') {
          onSuccess(lead.id)
          return
        }
        throw new Error('Autenticación fallida')
      }

      if (!data.success) {
        throw new Error(data.message || 'Error al procesar el pago')
      }

      onSuccess(lead.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Sin tarjeta guardada
  if (!hasCard) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col items-center text-center py-4 gap-3">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
            <CreditCard size={24} className="text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Sin método de pago activo</p>
            <p className="text-slate-500 text-sm mt-1">
              Necesitas una tarjeta guardada para desbloquear leads.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={() => { onClose(); navigate('/dashboard/profile') }} className="flex-1">
            Agregar tarjeta <ArrowRight size={15} />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Resumen del lead */}
      <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Lock size={18} className="text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{lead.full_name}</p>
          <p className="text-xs text-slate-500">{lead.city}</p>
        </div>
        <span className="text-lg font-bold text-slate-900 flex-shrink-0">${amount}</span>
      </div>

      {/* Tarjeta a usar */}
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Se cobrará a</p>
        <div className={`border rounded-xl p-3.5 flex items-center justify-between ${isPaymentRequired ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}>
          <CardBadge brand={clientData.payment_method_brand} last4={clientData.payment_method_last4} />
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <ShieldCheck size={13} />
            Stripe
          </div>
        </div>
        {isPaymentRequired && (
          <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
            <AlertCircle size={12} />
            Tu tarjeta fue rechazada. Actualízala en tu perfil antes de continuar.
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <div>
            <span>{error}</span>
            {(error.includes('rechaz') || error.includes('declined') || error.includes('método')) && (
              <button
                onClick={() => { onClose(); navigate('/dashboard/profile') }}
                className="block text-xs underline mt-1 text-red-600"
              >
                Actualizar método de pago →
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
        <Button
          onClick={handleConfirm}
          loading={loading}
          disabled={loading || isPaymentRequired}
          className="flex-1"
        >
          Confirmar · ${amount}
        </Button>
      </div>

      <p className="text-center text-xs text-slate-400">
        Cobro seguro procesado por Stripe
      </p>
    </div>
  )
}

export default function PaymentModal({ open, onClose, lead, clientId, onSuccess }) {
  if (!lead) return null

  const amount = lead.price ? Math.round(lead.price) : 12

  function handleSuccess(leadId) {
    onSuccess(leadId)
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
