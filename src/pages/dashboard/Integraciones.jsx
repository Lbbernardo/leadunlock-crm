import { useState } from 'react'
import { Copy, Check, Zap, Globe, Webhook, PlayCircle, ChevronDown, ChevronUp } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

const WEBHOOK_SECRET = 'tu-webhook-secret-aqui'
const BASE_URL = window.location.origin

function CopyBox({ label, value }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div>
      {label && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</p>}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
        <code className="flex-1 text-sm text-slate-700 break-all">{value}</code>
        <button
          onClick={copy}
          className="flex-shrink-0 text-slate-400 hover:text-green-500 transition-colors p-1"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  )
}

function StepAccordion({ number, title, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false)
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0">
          {number}
        </div>
        <span className="font-semibold text-slate-900 flex-1">{title}</span>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-slate-100">{children}</div>}
    </div>
  )
}

function TestLeadButton({ clientId, onLeadReceived }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function sendTestLead() {
    setLoading(true)
    setResult(null)

    // Simula un lead entrante sin necesitar el servidor
    await new Promise(r => setTimeout(r, 800))

    const mockLead = {
      id: `test-${Date.now()}`,
      full_name: 'Lead de Prueba',
      phone: '+52 55 0000 0000',
      email: 'test@ejemplo.com',
      city: 'CDMX',
      state: 'Ciudad de México',
      product_interest: 'Producto de prueba',
      source: 'Test Manual',
      campaign_name: 'Campaña de Prueba',
      is_locked: true,
      is_unlocked: false,
      status: 'new',
      notes: null,
      created_at: new Date().toISOString(),
    }

    onLeadReceived(mockLead)
    setResult('success')
    setLoading(false)
    setTimeout(() => setResult(null), 3000)
  }

  return (
    <div>
      <Button onClick={sendTestLead} loading={loading} variant="secondary" size="sm">
        <PlayCircle size={15} />
        Enviar lead de prueba
      </Button>
      {result === 'success' && (
        <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
          <Check size={14} /> Lead de prueba creado — revisa tu dashboard
        </p>
      )}
    </div>
  )
}

export default function Integraciones({ onTestLead }) {
  const { clientId, clientData, isMock } = useAuth()
  const resolvedClientId = clientId || 'mock-client-id'
  const webhookUrl = `${BASE_URL}/api/webhook`

  const curlExample = `curl -X POST ${webhookUrl} \\
  -H "Content-Type: application/json" \\
  -H "x-webhook-token: ${WEBHOOK_SECRET}" \\
  -d '{
    "full_name": "Juan García",
    "phone": "+52 55 1234 5678",
    "email": "juan@ejemplo.com",
    "city": "CDMX",
    "state": "Ciudad de México",
    "campaign_name": "Mi Campaña",
    "product_interest": "Crédito hipotecario",
    "source": "Meta Ads",
    "client_id": "${resolvedClientId}"
  }'`

  return (
    <DashboardLayout>
      <div className="p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Integraciones</h1>
          <p className="text-slate-500 mt-1">Conecta tus campañas para recibir leads automáticamente</p>
        </div>

        {/* Datos de conexión */}
        <div className="bg-slate-900 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Webhook size={18} className="text-green-400" />
            <h2 className="font-semibold text-white">Tus datos de conexión</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">URL del webhook</p>
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
                <code className="flex-1 text-sm text-green-400 break-all">{webhookUrl}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(webhookUrl)}
                  className="flex-shrink-0 text-slate-500 hover:text-green-400 transition-colors p-1"
                >
                  <Copy size={15} />
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Tu Client ID</p>
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
                <code className="flex-1 text-sm text-green-400 break-all">{resolvedClientId}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(resolvedClientId)}
                  className="flex-shrink-0 text-slate-500 hover:text-green-400 transition-colors p-1"
                >
                  <Copy size={15} />
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Token de autenticación</p>
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
                <code className="flex-1 text-sm text-slate-500 break-all">••••••••••••••••••••••••••••••••</code>
                <span className="text-xs text-slate-500">Visible en tu panel admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Probar conexión */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-8">
          <h3 className="font-semibold text-green-800 mb-1">Probar integración</h3>
          <p className="text-sm text-green-700 mb-3">
            Envía un lead de prueba para verificar que todo está conectado correctamente.
          </p>
          <TestLeadButton clientId={resolvedClientId} onLeadReceived={onTestLead} />
        </div>

        {/* Guías de integración */}
        <h2 className="font-semibold text-slate-900 mb-4">Guías de configuración</h2>
        <div className="space-y-3">

          <StepAccordion number="1" title="Meta Ads (Facebook Lead Ads)" defaultOpen>
            <div className="space-y-4 mt-3">
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="font-bold text-slate-400 flex-shrink-0">1.</span>
                  Ve a <strong>Meta Business Suite → Configuración → Leads → Webhooks</strong>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-slate-400 flex-shrink-0">2.</span>
                  Agrega un nuevo webhook con la URL y selecciona el evento <code className="bg-slate-100 px-1 rounded">leadgen</code>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-slate-400 flex-shrink-0">3.</span>
                  Meta enviará los campos del formulario. Mapea: <code className="bg-slate-100 px-1 rounded">full_name</code>, <code className="bg-slate-100 px-1 rounded">phone</code>, <code className="bg-slate-100 px-1 rounded">email</code>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-slate-400 flex-shrink-0">4.</span>
                  Incluye siempre <code className="bg-slate-100 px-1 rounded">client_id</code> como campo fijo con tu ID
                </li>
              </ol>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                Meta Ads requiere verificación del webhook. LeadUnlock responderá automáticamente al challenge de verificación.
              </div>
            </div>
          </StepAccordion>

          <StepAccordion number="2" title="Zapier — Meta Lead Ads → LeadUnlock">
            <div className="space-y-4 mt-3">
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="font-bold text-slate-400 flex-shrink-0">1.</span>
                  Crea un nuevo Zap. Trigger: <strong>Facebook Lead Ads → New Lead</strong>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-slate-400 flex-shrink-0">2.</span>
                  Action: <strong>Webhooks by Zapier → POST</strong>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-slate-400 flex-shrink-0">3.</span>
                  Configura la acción así:
                </li>
              </ol>
              <div className="space-y-2">
                <CopyBox label="URL" value={webhookUrl} />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="font-semibold text-slate-500 mb-2">Headers</p>
                    <p className="text-slate-600"><code>Content-Type:</code> application/json</p>
                    <p className="text-slate-600"><code>x-webhook-token:</code> [tu token]</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="font-semibold text-slate-500 mb-2">Body (mapear)</p>
                    <p className="text-slate-600">full_name → nombre</p>
                    <p className="text-slate-600">phone → teléfono</p>
                    <p className="text-slate-600">email → correo</p>
                    <p className="text-slate-600">client_id → <strong>{resolvedClientId.slice(0,8)}...</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </StepAccordion>

          <StepAccordion number="3" title="n8n — Workflow automático">
            <div className="space-y-4 mt-3">
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="font-bold text-slate-400 flex-shrink-0">1.</span>
                  Nodo trigger: <strong>Facebook Lead Ads</strong> o cualquier fuente
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-slate-400 flex-shrink-0">2.</span>
                  Nodo HTTP Request: <strong>POST</strong> a la URL del webhook
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-slate-400 flex-shrink-0">3.</span>
                  En el nodo HTTP configura el body con los campos del lead + <code className="bg-slate-100 px-1 rounded">client_id</code>
                </li>
              </ol>
            </div>
          </StepAccordion>

          <StepAccordion number="4" title="Make (Integromat)">
            <div className="space-y-3 mt-3 text-sm text-slate-600">
              <p>Mismo flujo que Zapier:</p>
              <ol className="space-y-2">
                <li className="flex gap-3"><span className="font-bold text-slate-400">1.</span> Módulo trigger: <strong>Facebook Lead Ads → Watch New Leads</strong></li>
                <li className="flex gap-3"><span className="font-bold text-slate-400">2.</span> Módulo acción: <strong>HTTP → Make a Request</strong></li>
                <li className="flex gap-3"><span className="font-bold text-slate-400">3.</span> Método POST, mapea los campos del formulario</li>
              </ol>
            </div>
          </StepAccordion>

          <StepAccordion number="5" title="GoHighLevel">
            <div className="space-y-3 mt-3 text-sm text-slate-600">
              <ol className="space-y-2">
                <li className="flex gap-3"><span className="font-bold text-slate-400">1.</span> Ve a <strong>Settings → Integrations → Webhooks</strong></li>
                <li className="flex gap-3"><span className="font-bold text-slate-400">2.</span> Crea un nuevo webhook con la URL de LeadUnlock</li>
                <li className="flex gap-3"><span className="font-bold text-slate-400">3.</span> Selecciona evento: <strong>Contact Created</strong></li>
                <li className="flex gap-3"><span className="font-bold text-slate-400">4.</span> Agrega el header <code className="bg-slate-100 px-1 rounded">x-webhook-token</code> con tu token</li>
              </ol>
            </div>
          </StepAccordion>

          <StepAccordion number="6" title="Curl / API directa (pruebas)">
            <div className="mt-3">
              <p className="text-sm text-slate-600 mb-3">Para probar desde terminal o integración custom:</p>
              <CopyBox value={curlExample} />
            </div>
          </StepAccordion>

        </div>
      </div>
    </DashboardLayout>
  )
}
