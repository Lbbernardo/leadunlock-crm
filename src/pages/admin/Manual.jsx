import { BookOpen, Users, CreditCard, Zap, Webhook, BarChart2, ShieldCheck, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'

const sections = [
  {
    icon: Zap,
    title: 'Modelo de negocio',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    content: [
      {
        heading: 'Cómo gana dinero LeadUnlock',
        body: `Los clientes pagan $100 de activación al registrarse. Ese dinero es reembolsable: cuando el cliente alcanza $1,000 acumulados en leads desbloqueados, los $100 se devuelven automáticamente o se aplican como crédito.

Cada lead tiene un costo de adquisición (lo que gastamos en Meta Ads). El cliente paga 3× ese costo de adquisición, con un mínimo de $12 por lead. Esta fórmula es interna — el cliente solo ve el precio final del lead.

Ejemplo: si un lead nos costó $5 de publicidad, el cliente paga $15. Si nos costó $20, el cliente paga $60.`,
      },
      {
        heading: 'Fórmula de precio',
        body: `precio_lead = max($12, acquisition_cost × 3)

Esta lógica está en AdminFinanzas y en la función unlock-lead de la API. NO se muestra al cliente en ningún lugar de la plataforma.`,
      },
    ],
  },
  {
    icon: Users,
    title: 'Ciclo de vida del cliente',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    content: [
      {
        heading: '1. Registro',
        body: `El cliente se registra en /register con email y contraseña. Se crea un registro en la tabla "users" (Supabase Auth) y otro en "clients" con status = "pending".`,
      },
      {
        heading: '2. Onboarding',
        body: `El cliente completa 4 pasos: ciudad, presupuesto mensual para leads, número de leads objetivo, y pago de $100 de activación.

Al pagar, se llama a /api/stripe/confirm-activation que:
- Crea un Stripe Customer vinculado al cliente
- Adjunta el método de pago al customer
- Guarda payment_method_last4 y payment_method_brand en la tabla clients
- El status del cliente cambia a "active"`,
      },
      {
        heading: '3. Campaña en Meta Ads',
        body: `Después del onboarding, TÚ (admin) creas la campaña en Meta Ads para ese cliente y conectas el formulario a Make.

FLUJO AUTOMATIZADO:
Meta Lead Ads → Make (us2.make.com) → /api/make-lead → Supabase → Dashboard

PASOS PARA CADA CLIENTE NUEVO:
1. Crear el formulario de Lead Ads en Meta Ads Manager para ese cliente
2. Obtener el Form ID del formulario (número largo en la URL o en el panel)
3. En LeadUnlock Admin → Campañas → registrar campaña con:
   - Nombre: cualquier nombre descriptivo
   - Cliente: el cliente correspondiente
   - Fuente: Meta Ads
   - Meta Form ID: el ID numérico del formulario de Meta
4. Make recoge los leads automáticamente cada 15 minutos
5. El lead aparece en el dashboard del cliente

Make escenario: "Integration Facebook Lead Ads, HTTP" en us2.make.com
Endpoint: POST https://unlocklead.click/api/make-lead`,
      },
      {
        heading: '4. Leads y desbloqueo',
        body: `Los leads llegan bloqueados (is_locked = true). El cliente los ve con nombre parcialmente oculto. Para ver los datos completos, el cliente paga el precio del lead (mínimo $12).

Al desbloquear se cobra al Stripe Customer guardado usando el payment method adjunto (cobro off-session).`,
      },
    ],
  },
  {
    icon: Webhook,
    title: 'Webhook y entrega de leads',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    content: [
      {
        heading: 'URL del webhook',
        body: `https://unlocklead.click/api/webhook

O con client_id directo:
https://unlocklead.click/api/webhook?client_id=UUID_DEL_CLIENTE`,
      },
      {
        heading: 'Campos que acepta',
        body: `{
  "name": "Juan Pérez",
  "email": "juan@gmail.com",
  "phone": "+1305...",
  "campaign_name": "LeadUnlock_MiamiAuto",
  "client_id": "uuid-opcional",
  "acquisition_cost": 5.00
}

El campo campaign_name se usa para auto-enrutar si no viene client_id. El sistema busca en la tabla campaigns una campaña activa con ese nombre.`,
      },
      {
        heading: 'Configurar una campaña',
        body: `En Cuentas (admin), entra al cliente → sección "Campañas". Crea una campaña con el mismo nombre que usarás en Meta Ads. Actívala.

En Meta Ads, en la sección "Instant Forms" o CRM integration, coloca la URL del webhook y mapea los campos: nombre, email, teléfono → name, email, phone.`,
      },
    ],
  },
  {
    icon: CreditCard,
    title: 'Pagos y Stripe',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    content: [
      {
        heading: 'Activación ($100)',
        body: `Se crea un PaymentIntent de $10,000 centavos (=$100) con setup_future_usage: "off_session". Esto indica a Stripe que guardará la tarjeta para cobros futuros sin que el cliente esté presente.

Tras el pago exitoso, confirm-activation guarda el stripe_customer_id en clients y adjunta el payment method al customer.`,
      },
      {
        heading: 'Desbloqueo de leads',
        body: `Al desbloquear un lead, la API crea un PaymentIntent con el precio del lead y el customer_id del cliente. El cobro se procesa off-session usando el método de pago guardado.

Si el cobro falla (tarjeta expirada, fondos insuficientes), el lead no se desbloquea y el cliente ve un error.`,
      },
      {
        heading: 'Reembolso de $100',
        body: `Cuando el cliente supera $1,000 en leads desbloqueados, se puede emitir un reembolso de $100 desde el dashboard de Stripe o aplicarlo como crédito manual en la cuenta.

Esto actualmente es un proceso manual — se puede automatizar en el futuro con un webhook de Stripe.`,
      },
    ],
  },
  {
    icon: BarChart2,
    title: 'Panel de admin',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    content: [
      {
        heading: 'Cuentas (/admin)',
        body: `Lista todos los clientes con su estado (pending/active), número de leads totales y desbloqueados, y total facturado.

Puedes entrar a cada cliente para ver su detalle, gestionar sus campañas, y ver todos sus leads.`,
      },
      {
        heading: 'Finanzas (/admin/finanzas)',
        body: `Muestra métricas globales:
- MRR estimado (suma de leads desbloqueados este mes)
- Total leads en plataforma y % desbloqueados
- Revenue por cliente
- Costo de adquisición promedio

Los datos vienen directamente de Supabase calculados en tiempo real.`,
      },
    ],
  },
  {
    icon: Trash2,
    title: 'Limpieza pendiente',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    content: [
      {
        heading: 'Cosas que no usamos y hay que limpiar',
        body: `1. WORKFLOW DE N8N — el escenario "LeadUnlock — Meta Ads Universal" en Railway ya no se usa.
   Tiene un Webhook Trigger, Code node y HTTP Request que fueron reemplazados por Make.
   Acción: pausar o eliminar ese workflow en n8n para no consumir recursos.

2. FACEBOOK LEAD ADS TRIGGER — el nodo de n8n que intentamos usar (Facebook Lead Ads Trigger)
   fue abandonado por inestable. Ya no existe en el workflow pero la credencial OAuth quedó en n8n.
   Acción: eliminar la credencial de Facebook en n8n → Credentials.

3. ENDPOINT /api/meta-webhook — creado para recibir leads directamente de Meta sin Make.
   No se usa porque la Facebook App necesita verificación de negocio para estar en Live mode.
   Puede quedarse como respaldo o eliminarse.
   Archivo: api/meta-webhook.js

4. VARIABLE META_VERIFY_TOKEN en Vercel — usada por /api/meta-webhook.
   Si se elimina ese endpoint, también eliminar esta variable.

5. CAMPAÑA "test" en LeadUnlock Admin — si creaste campañas de prueba durante el desarrollo,
   elimínalas desde Admin → Campañas para mantener el sistema limpio.

6. BUG PENDIENTE: clientes quedan en status "pending" después del onboarding.
   Fix: ejecutar en Supabase SQL Editor:
   CREATE POLICY "clients_own_update" ON public.clients FOR UPDATE USING (user_id = auth.uid());`,
      },
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Base de datos y seguridad',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    content: [
      {
        heading: 'Tablas principales',
        body: `users — cuentas de Supabase Auth (id, email, full_name, role)
clients — datos del cliente (user_id, company_name, status, stripe_customer_id, payment_method_*)
leads — leads recibidos (client_id, campaign_id, name, email, phone, is_locked, acquisition_cost)
campaigns — campañas por cliente (client_id, name, source, is_active)`,
      },
      {
        heading: 'RLS (Row Level Security)',
        body: `Cada cliente solo puede ver sus propios leads y campañas gracias a las políticas RLS de Supabase.

Los admins (role = "admin") tienen acceso completo desde el service role key usado en las API routes del servidor.`,
      },
      {
        heading: 'Variables de entorno requeridas',
        body: `VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
VITE_STRIPE_PUBLISHABLE_KEY
WEBHOOK_SECRET              — token para /api/webhook (x-webhook-token)
META_VERIFY_TOKEN           — token de verificación webhook Meta (leadunlock2026)
META_PAGE_ACCESS_TOKEN      — token de página Facebook (nunca expira, página RetiroLatino)`,
      },
      {
        heading: 'Columna meta_form_id en campaigns',
        body: `La tabla campaigns tiene una columna meta_form_id (TEXT) que conecta el formulario de Meta con el cliente.

SQL aplicado en Supabase:
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS meta_form_id TEXT;

Cuando llega un lead desde Make, el sistema busca en campaigns la fila con ese meta_form_id para saber a qué cliente asignarlo.`,
      },
    ],
  },
]

function Section({ section }) {
  const [openIdx, setOpenIdx] = useState(null)
  const Icon = section.icon

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className={`flex items-center gap-3 px-6 py-4 border-b border-slate-100 ${section.bg}`}>
        <Icon size={20} className={section.color} />
        <h2 className="font-bold text-slate-900">{section.title}</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {section.content.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="font-medium text-slate-800 text-sm">{item.heading}</span>
              {openIdx === i ? (
                <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
              )}
            </button>
            {openIdx === i && (
              <div className="px-6 pb-5">
                <pre className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 rounded-xl p-4 border border-slate-200">
                  {item.body}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Manual() {
  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={22} className="text-slate-700" />
            <h1 className="text-2xl font-bold text-slate-900">Manual de uso</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Documentación interna — visible solo para administradores. Cómo funciona LeadUnlock de principio a fin.
          </p>
        </div>

        <div className="space-y-4">
          {sections.map((section, i) => (
            <Section key={i} section={section} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
