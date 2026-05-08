import { useState } from 'react'
import { CreditCard, Unlock, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

const MOCK_UNLOCKED_LEADS = [
  { id: '1', full_name: 'Carlos Mendoza', amount: 20, unlocked_at: new Date(Date.now() - 1 * 86400000).toISOString(), campaign: 'Camp_Hipoteca_Q1' },
  { id: '4', full_name: 'Ana Flores Ramos', amount: 20, unlocked_at: new Date(Date.now() - 4 * 86400000).toISOString(), campaign: 'Camp_PyME_CDMX' },
  { id: '7', full_name: 'Jorge Ramírez Díaz', amount: 20, unlocked_at: new Date(Date.now() - 7 * 86400000).toISOString(), campaign: 'Camp_Seguros_EDOMEX' },
]

const MOCK_PAYMENTS = [
  { id: 'pay_1', amount: 20, status: 'succeeded', created_at: new Date(Date.now() - 1 * 86400000).toISOString(), description: 'Desbloqueo: Carlos Mendoza' },
  { id: 'pay_2', amount: 40, status: 'succeeded', created_at: new Date(Date.now() - 4 * 86400000).toISOString(), description: 'Desbloqueo: Ana Flores + Jorge Ramírez' },
]

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-MX', { dateStyle: 'medium' })
}

export default function Billing() {
  const totalSpent = MOCK_UNLOCKED_LEADS.reduce((sum, l) => sum + l.amount, 0)
  const pendingBalance = 0

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Facturación</h1>
          <p className="text-slate-500 mt-1">Historial de desbloqueos y pagos</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500 font-medium">Balance pendiente</p>
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                <Clock size={18} className="text-orange-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">${pendingBalance}</p>
            {pendingBalance > 0 && (
              <Button size="sm" className="mt-3 w-full">
                <CreditCard size={14} /> Pagar ahora
              </Button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500 font-medium">Leads desbloqueados</p>
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                <Unlock size={18} className="text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{MOCK_UNLOCKED_LEADS.length}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500 font-medium">Total pagado</p>
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                <DollarSign size={18} className="text-slate-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">${totalSpent}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 mb-6">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Leads desbloqueados</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_UNLOCKED_LEADS.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                    <Unlock size={16} className="text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{item.full_name}</p>
                    <p className="text-xs text-slate-400">{item.campaign} · {formatDate(item.unlocked_at)}</p>
                  </div>
                </div>
                <span className="font-semibold text-slate-900">${item.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Historial de pagos</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {MOCK_PAYMENTS.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    payment.status === 'succeeded' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {payment.status === 'succeeded'
                      ? <CheckCircle size={16} className="text-green-500" />
                      : <AlertCircle size={16} className="text-red-500" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{payment.description}</p>
                    <p className="text-xs text-slate-400">{formatDate(payment.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={payment.status === 'succeeded' ? 'green' : 'red'}>
                    {payment.status === 'succeeded' ? 'Pagado' : 'Fallido'}
                  </Badge>
                  <span className="font-semibold text-slate-900">${payment.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
