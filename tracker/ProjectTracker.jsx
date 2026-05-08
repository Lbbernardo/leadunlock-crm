import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Edit3, Plus, Zap } from 'lucide-react'

const PHASES = [
  {
    id: 1, name: 'Discovery', color: '#FF6B35', icon: '🔍',
    items: [
      'Problema definido: negocios sin CRM pierden leads de Meta Ads',
      'ICP: PYMES y agencias de ventas en LATAM',
      'TAM estimado: +3M negocios con Meta Ads activo en MX',
      'Competencia analizada: GoHighLevel, HubSpot, Pipedrive',
      'UVP: pay-per-lead sin instalación costosa',
      'Modelo de validación: 10 clientes piloto en 30 días',
    ],
  },
  {
    id: 2, name: 'Negocio', color: '#E83F6F', icon: '💼',
    items: [
      'Modelo freemium + $20/lead desbloqueado',
      'Plan Pro: $97/mes con leads incluidos',
      'CAC objetivo: < $15 USD (orgánico + referral)',
      'LTV estimado: $200+ por cliente activo',
      'Margen bruto: ~85% (SaaS + Stripe 2.9%)',
      'Canal principal: comunidades de ventas + Meta Ads propios',
    ],
  },
  {
    id: 3, name: 'MVP', color: '#2274A5', icon: '🚀',
    items: [
      'Stack: React + Vite + Supabase + Stripe + Vercel',
      'Landing page con pricing y CTA',
      'Auth: registro, login, recuperar contraseña',
      'Dashboard del cliente con leads bloqueados/desbloqueados',
      'Lead Detail con notas y cambio de estado',
      'Billing: historial de pagos y balance',
      'Admin: gestión de clientes, leads y campañas',
      'Webhook: recibir leads desde Meta/Zapier/n8n',
      'Integración Stripe en modo test',
      'RLS en Supabase: multi-tenant seguro',
      'Mock data incluida para desarrollo',
    ],
  },
  {
    id: 4, name: 'AI Agents', color: '#32936F', icon: '🤖',
    items: [
      'Lead Qualification Agent (calificar leads entrantes)',
      'Follow-up Agent (secuencia automática de seguimiento)',
      'Sales Assistant (sugerir próximos pasos por lead)',
      'Retention Agent (detectar clientes en riesgo de churn)',
    ],
  },
  {
    id: 5, name: 'GTM', color: '#9B5DE5', icon: '📣',
    items: [
      'Oferta de lanzamiento: primeros 5 leads gratis',
      'Landing optimizada para conversión',
      'Campaña Meta Ads para agencias de ventas',
      'Secuencia de email onboarding (7 correos)',
      'Scripts de DM para comunidades de marketing',
      'Referral: $10 por cliente referido',
    ],
  },
  {
    id: 6, name: 'Automatización', color: '#F4845F', icon: '⚙️',
    items: [
      'n8n: webhook Meta Ads → Supabase',
      'n8n: notificación WhatsApp por lead nuevo',
      'n8n: facturación diaria automática',
      'Dashboard de métricas en tiempo real',
      'Lead scoring automático por comportamiento',
      'Reporte semanal por email al cliente',
    ],
  },
  {
    id: 7, name: 'Ejecución', color: '#FFD700', icon: '🎯',
    items: [
      'Día 1-2: Deploy en Vercel + Supabase configurado',
      'Día 3: Stripe en modo live activado',
      'Día 4-5: Primeros 3 clientes piloto onboarding',
      'Día 6: Primera campaña de Meta Ads propia',
      'Día 7: Revisión de métricas + ajustes',
    ],
  },
]

const STORAGE_KEY = 'leadunlock_tracker'

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export default function ProjectTracker() {
  const [state, setState] = useState(() => {
    const saved = loadState()
    const initial = {}
    PHASES.forEach((p) => {
      initial[p.id] = {
        expanded: p.id <= 3,
        checks: saved[p.id]?.checks || Array(p.items.length).fill(false),
        note: saved[p.id]?.note || '',
        editingNote: false,
      }
    })
    // Pre-check phases 1 and 2 as complete
    initial[1].checks = Array(PHASES[0].items.length).fill(true)
    initial[2].checks = Array(PHASES[1].items.length).fill(true)
    return initial
  })

  useEffect(() => {
    const toSave = {}
    Object.entries(state).forEach(([id, data]) => {
      toSave[id] = { checks: data.checks, note: data.note }
    })
    saveState(toSave)
  }, [state])

  function toggleCheck(phaseId, itemIdx) {
    setState((prev) => {
      const checks = [...prev[phaseId].checks]
      checks[itemIdx] = !checks[itemIdx]
      return { ...prev, [phaseId]: { ...prev[phaseId], checks } }
    })
  }

  function toggleExpanded(phaseId) {
    setState((prev) => ({
      ...prev,
      [phaseId]: { ...prev[phaseId], expanded: !prev[phaseId].expanded },
    }))
  }

  function setNote(phaseId, note) {
    setState((prev) => ({ ...prev, [phaseId]: { ...prev[phaseId], note } }))
  }

  function toggleNoteEdit(phaseId) {
    setState((prev) => ({
      ...prev,
      [phaseId]: { ...prev[phaseId], editingNote: !prev[phaseId].editingNote },
    }))
  }

  const totalItems = PHASES.reduce((sum, p) => sum + p.items.length, 0)
  const checkedItems = PHASES.reduce((sum, p) => sum + state[p.id].checks.filter(Boolean).length, 0)
  const totalProgress = Math.round((checkedItems / totalItems) * 100)

  return (
    <div style={{ fontFamily: 'monospace, monospace', background: '#0A0E1A', minHeight: '100vh', color: '#E2E8F0', padding: '2rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: 40, height: 40, background: '#22C55E', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            ⚡
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#F8FAFC' }}>
              LeadUnlock CRM
            </h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>Project Tracker · MVP Build</p>
          </div>
        </div>

        {/* Total Progress */}
        <div style={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Progreso total
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22C55E' }}>{totalProgress}%</span>
          </div>
          <div style={{ height: 6, background: '#1E293B', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${totalProgress}%`, background: 'linear-gradient(90deg, #22C55E, #3B82F6)', borderRadius: 99, transition: 'width 0.4s ease' }} />
          </div>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#475569' }}>
            {checkedItems} de {totalItems} entregables completados
          </p>
        </div>

        {/* Phases */}
        {PHASES.map((phase) => {
          const pState = state[phase.id]
          const checked = pState.checks.filter(Boolean).length
          const total = phase.items.length
          const progress = Math.round((checked / total) * 100)
          const isComplete = checked === total
          const isInProgress = checked > 0 && !isComplete

          return (
            <div key={phase.id} style={{ background: '#111827', border: `1px solid ${isComplete ? phase.color + '40' : '#1E293B'}`, borderRadius: 12, marginBottom: '0.75rem', overflow: 'hidden' }}>

              {/* Phase Header */}
              <button
                onClick={() => toggleExpanded(phase.id)}
                style={{ width: '100%', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', textAlign: 'left' }}
              >
                <span style={{ fontSize: '1.25rem' }}>{phase.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: phase.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      FASE {phase.id}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '1px 8px',
                      borderRadius: 99,
                      background: isComplete ? phase.color + '20' : isInProgress ? '#1E293B' : '#0F172A',
                      color: isComplete ? phase.color : isInProgress ? '#94A3B8' : '#475569',
                      border: `1px solid ${isComplete ? phase.color + '40' : '#1E293B'}`,
                      fontWeight: 600,
                    }}>
                      {isComplete ? 'COMPLETADA' : isInProgress ? 'EN PROGRESO' : 'PENDIENTE'}
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F1F5F9' }}>{phase.name}</span>
                </div>

                <div style={{ textAlign: 'right', marginRight: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: phase.color }}>{progress}%</div>
                  <div style={{ width: 80, height: 4, background: '#1E293B', borderRadius: 99, marginTop: 4 }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: phase.color, borderRadius: 99, transition: 'width 0.3s' }} />
                  </div>
                </div>

                <span style={{ color: '#475569', fontSize: '1rem' }}>
                  {pState.expanded ? '▲' : '▼'}
                </span>
              </button>

              {/* Phase Content */}
              {pState.expanded && (
                <div style={{ padding: '0 1.25rem 1.25rem' }}>
                  <div style={{ borderTop: '1px solid #1E293B', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {phase.items.map((item, idx) => (
                      <label
                        key={idx}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', padding: '0.35rem 0.5rem', borderRadius: 6, transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#1E293B'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <input
                          type="checkbox"
                          checked={pState.checks[idx]}
                          onChange={() => toggleCheck(phase.id, idx)}
                          style={{ display: 'none' }}
                        />
                        <span style={{ color: pState.checks[idx] ? phase.color : '#334155', flexShrink: 0, fontSize: '1rem', marginTop: 1 }}>
                          {pState.checks[idx] ? '✓' : '○'}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: pState.checks[idx] ? '#94A3B8' : '#CBD5E1', textDecoration: pState.checks[idx] ? 'line-through' : 'none' }}>
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Notes */}
                  <div style={{ marginTop: '1rem', borderTop: '1px solid #1E293B', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notas</span>
                      <button
                        onClick={() => toggleNoteEdit(phase.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.75rem' }}
                      >
                        {pState.editingNote ? 'Guardar' : 'Editar'}
                      </button>
                    </div>
                    {pState.editingNote ? (
                      <textarea
                        value={pState.note}
                        onChange={(e) => setNote(phase.id, e.target.value)}
                        placeholder="Agrega notas de decisión..."
                        rows={3}
                        style={{ width: '100%', background: '#0F172A', border: '1px solid #1E293B', borderRadius: 6, color: '#CBD5E1', fontSize: '0.8rem', padding: '0.5rem 0.75rem', resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                      />
                    ) : (
                      <p style={{ fontSize: '0.8rem', color: pState.note ? '#94A3B8' : '#334155', fontStyle: pState.note ? 'normal' : 'italic', margin: 0 }}>
                        {pState.note || 'Sin notas. Click en "Editar" para agregar.'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#1E293B', marginTop: '2rem' }}>
          LeadUnlock CRM Tracker · Persiste en localStorage
        </p>
      </div>
    </div>
  )
}
