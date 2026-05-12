import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Lock, AlertCircle, Wallet, CreditCard, PhoneCall, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

function UnlockForm({ lead, clientId, amount, onSuccess, onClose }) {
  const { clientData, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const balance = clientData?.balance || 0
  const hasFunds = balance >= amount
  const hasCard = !!clientData?.payment_method_last4
  const cardBrand = clientData?.payment_method_brand || 'Tarjeta'
  const cardLast4 = clientData?.payment_method_last4

  async function handleCreditUnlock() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/unlock-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, clientId }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error === 'insufficient_balance'
          ? `Saldo insuficiente. Tienes $${data.balance} y el lead cuesta $${data.required}.`
          : data.error || 'Error al desbloquear el lead.')
        return
      }
      await refreshProfile()
      onSuccess(lead.id)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCardUnlock() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/charge-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id, clientId }),
      })
      const data = await res.json()
      if (!data.success) {
        if (data.error === 'no_payment_method') {
          setError('No hay método de pago guardado. Agrega una tarjeta en tu perfil.')
        } else if (data.error === 'card_declined') {
          setError('Tu tarjeta fue rechazada. Verifica los datos en tu perfil.')
        } else {
          setError(data.error || 'Error al procesar el pago.')
        }
        return
      }
      await refreshProfile()
      onSuccess(lead.id)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Lead summary */}
      <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Lock size={18} className="text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{lead.full_name}</p>
          <p className="text-xs text-slate-500">{lead.city || 'Sin ciudad'}</p>
        </div>
        <span className="text-lg font-bold text-slate-900 flex-shrink-0">${amount}</span>
      </div>

      {/* Opción 1: Tiene crédito */}
      {hasFunds && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-green-600" />
                <p className="text-sm font-medium text-slate-700">Crédito disponible</p>
              </div>
              <p className="text-xl font-bold text-green-600">${balance.toLocaleString()}</p>
            </div>
            <p className="text-xs text-green-600">
              Quedarán <strong>${(balance - amount).toLocaleString()}</strong> después del desbloqueo
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button onClick={handleCreditUnlock} loading={loading} className="flex-1">
              <Wallet size={15} /> Usar crédito · ${amount}
            </Button>
          </div>
          <p className="text-center text-xs text-slate-400">El crédito se descuenta de tu saldo inmediatamente</p>
        </>
      )}

      {/* Opción 2: Sin crédito pero tiene tarjeta */}
      {!hasFunds && hasCard && (
        <>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-red-500" />
              <p className="text-sm text-slate-600">Crédito disponible</p>
            </div>
            <p className="text-lg font-bold text-red-500">${balance.toLocaleString()}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={14} className="text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">Pagar con tarjeta guardada</p>
            </div>
            <p className="text-xs text-slate-500">
              {cardBrand.charAt(0).toUpperCase() + cardBrand.slice(1)} terminada en <strong>{cardLast4}</strong>
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button onClick={handleCardUnlock} loading={loading} className="flex-1">
              <CreditCard size={15} /> Cobrar ****{cardLast4} · ${amount}
            </Button>
          </div>
          <p className="text-center text-xs text-slate-400">Se cobrará a tu tarjeta guardada inmediatamente</p>
        </>
      )}

      {/* Opción 3: Sin crédito y sin tarjeta */}
      {!hasFunds && !hasCard && (
        <>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={14} className="text-red-500" />
              <p className="text-sm text-slate-600">Crédito disponible</p>
            </div>
            <p className="text-lg font-bold text-red-500">${balance.toLocaleString()}</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <PhoneCall size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Sin método de pago</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Agrega una tarjeta en tu perfil para poder desbloquear leads.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Link to="/dashboard/profile" className="flex-1">
              <Button className="w-full">
                <CreditCard size={15} /> Agregar tarjeta
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default function PaymentModal({ open, onClose, lead, clientId, onSuccess }) {
  if (!lead) return null

  const amount = lead.price ? Math.round(lead.price) : 20

  function handleSuccess(leadId) {
    onSuccess(leadId)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Desbloquear lead">
      <UnlockForm
        lead={lead}
        clientId={clientId}
        amount={amount}
        onSuccess={handleSuccess}
        onClose={onClose}
      />
    </Modal>
  )
}
