import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Tag, Calendar, MessageSquare, Save, User } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { StatusBadge, statusOptions } from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const MOCK_LEADS = {
  '1': { id: '1', full_name: 'Carlos Mendoza', phone: '+52 55 1234 5678', email: 'carlos@ejemplo.com', city: 'CDMX', state: 'Ciudad de México', product_interest: 'Crédito hipotecario', source: 'Meta Ads', campaign_name: 'Camp_Hipoteca_Q1', is_locked: false, is_unlocked: true, status: 'interested', notes: 'Muy interesado, llamar en la tarde. Tiene presupuesto aprobado de $2MXN.', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  '4': { id: '4', full_name: 'Ana Flores Ramos', phone: '+52 55 2222 3333', email: 'ana.fr@ejemplo.com', city: 'CDMX', state: 'Ciudad de México', product_interest: 'Crédito PyME', source: 'Meta Ads', campaign_name: 'Camp_PyME_CDMX', is_locked: false, is_unlocked: true, status: 'contacted', notes: 'Agendé demo para el viernes.', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  '7': { id: '7', full_name: 'Jorge Ramírez Díaz', phone: '+52 55 7777 8888', email: 'jorge.rd@ejemplo.com', city: 'Toluca', state: 'Estado de México', product_interest: 'Seguro de vida', source: 'Meta Ads', campaign_name: 'Camp_Seguros_EDOMEX', is_locked: false, is_unlocked: true, status: 'closed', notes: 'Cerrado. Cliente firmó contrato.', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-slate-900 font-medium mt-0.5">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clientData } = useAuth()
  const [lead, setLead] = useState(null)
  const [interestCategory, setInterestCategory] = useState(null)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('leads').select('*').eq('id', id).single()
      .then(async ({ data }) => {
        if (data) {
          setLead(data)
          setNotes(data.notes || '')
          setStatus(data.status)
          if (data.campaign_name) {
            const { data: camp } = await supabase
              .from('campaigns')
              .select('interest_category')
              .eq('name', data.campaign_name)
              .maybeSingle()
            if (camp?.interest_category) setInterestCategory(camp.interest_category)
          }
        }
      })
  }, [id])

  async function handleSave() {
    setSaving(true)
    await supabase.from('leads').update({ notes, status }).eq('id', id)
    setLead((prev) => ({ ...prev, notes, status }))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center min-h-64">
          <p className="text-slate-500">Lead no encontrado o aún bloqueado.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-8 max-w-3xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Volver a leads
        </button>

        <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{lead.full_name}</h1>
            <p className="text-slate-500 mt-1">{lead.campaign_name}</p>
          </div>
          <StatusBadge status={lead.status} />
        </div>

        {interestCategory && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Tag size={15} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Este lead está interesado en</p>
              <p className="text-blue-900 font-semibold mt-0.5">{interestCategory}</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Información de contacto
            </h2>
            <InfoRow icon={User} label="Nombre" value={lead.full_name} />
            <InfoRow icon={Phone} label="Teléfono" value={lead.phone} />
            <InfoRow icon={Mail} label="Email" value={lead.email} />
            <InfoRow icon={MapPin} label="Ubicación" value={
              [lead.city, lead.state].filter(Boolean).join(', ') || clientData?.target_state || null
            } />
            <InfoRow icon={Tag} label="Interés" value={interestCategory || lead.product_interest} />
            <InfoRow icon={Calendar} label="Fecha de entrada" value={new Date(lead.created_at).toLocaleDateString('es-MX', { dateStyle: 'long' })} />
            <InfoRow icon={Tag} label="Fuente" value={lead.source} />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Seguimiento
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  Notas internas
                </div>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agrega notas sobre este lead..."
                rows={5}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 resize-none"
              />
            </div>

            <Button
              onClick={handleSave}
              loading={saving}
              className="mt-4 w-full"
            >
              <Save size={15} />
              {saved ? '¡Guardado!' : 'Guardar cambios'}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
