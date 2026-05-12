import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Lock, AlertCircle, Wallet, CheckCircle, PhoneCall } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

function UnlockForm({ lead, clientId, amount, onSuccess, onClose }) {
  const { clientData, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const balance = clientData?.balance || 0
  const hasFunds = balance >= amount
  const remaining = balance - amount

  async function handleConfirm() {
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
        if (data.error === 'insufficient_balance') {
          setError(`Saldo insuficiente. Tienes $${data.balance} y el lead cuesta $${data.required}.`)
        } else {
          setError(data.error || 'Error al desbloquear el lead.')
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

      {/* Balance card */}
      <div className={`rounded-xl p-4 border ${hasFunds ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Wallet size={14} className={hasFunds ? 'text-green-600' : 'text-red-500'} />
            <p className="text-sm font-medium text-slate-600">Tu crédito disponible</p>
          </div>
          <p className={`text-xl font-bold ${hasFunds ? 'text-green-600' : 'text-red-600'}`}>
            ${balance.toLocaleString()}
          </p>
        </div>
        {hasFunds ? (
          <p className="text-xs text-green-600 mt-0.5">
            Quedarán <strong>${remaining.toLocaleString()}</strong> después del desbloqueo
          </p>
        ) : (
          <p className="text-xs text-red-600 mt-0.5">
            Te faltan <strong>${(amount - balance).toLocaleString()}</strong> para desbloquear este lead
          </p>
        )}
      </div>

      {/* Insufficient balance notice */}
      {!hasFunds && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <PhoneCall size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Recarga tu crédito</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Contacta a tu asesor de LeadUnlock para agregar crédito a tu cuenta.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
        <Button
          onClick={handleConfirm}
          loading={loading}
          disabled={loading || !hasFunds}
          className="flex-1"
        >
          {hasFunds ? `Desbloquear · $${amount}` : 'Sin crédito'}
        </Button>
      </div>

      {hasFunds && (
        <p className="text-center text-xs text-slate-400">
          El crédito se descuenta de tu saldo inmediatamente
        </p>
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
