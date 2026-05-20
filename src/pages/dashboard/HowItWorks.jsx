import { CreditCard, Settings, Megaphone, Lock, Unlock, Phone, BarChart3, MessageCircle, Zap, DollarSign, Clock, Star } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'

const STEPS = [
  {
    number: '01',
    icon: CreditCard,
    title: 'Activas tu cuenta con $100',
    description:
      'Con ese pago único activamos tu CRM personalizado. No es una mensualidad ni un contrato — es el arranque de tu sistema completo. Lo mejor: cuando hayas desbloqueado $1,000 en leads, te devolvemos esos $100.',
    color: 'green',
    tag: 'Solo una vez',
  },
  {
    number: '02',
    icon: Settings,
    title: 'Configuramos tu campaña',
    description:
      'Nuestro equipo crea tu campaña de Meta Ads en 24–48 horas después de activar. Personalizamos la audiencia, el área geográfica, el nicho (seguros de vida, IUL, anualidades, Medicare, etc.) y el contenido del anuncio.',
    color: 'blue',
    tag: '24–48 horas',
  },
  {
    number: '03',
    icon: Megaphone,
    title: 'Meta muestra tu anuncio',
    description:
      'El algoritmo de Meta empieza a mostrar tu contenido a personas que tienen interés real en los productos que ofreces. Cuando alguien llena el formulario, el lead llega directo a tu plataforma.',
    color: 'purple',
    tag: 'Automático',
  },
  {
    number: '04',
    icon: Lock,
    title: 'El lead llega bloqueado',
    description:
      'Puedes ver el nombre, la ciudad y el producto de interés de cada prospecto sin costo. El teléfono y el email están protegidos hasta que decides si quieres abrirlo.',
    color: 'orange',
    tag: 'Vista previa gratis',
  },
  {
    number: '05',
    icon: Unlock,
    title: 'Desbloqueas el lead',
    description:
      'Si el prospecto te interesa, lo abres por un precio mínimo de $12. Una vez desbloqueado, ese lead es tuyo — tienes acceso completo a su información de contacto.',
    color: 'green',
    tag: 'Desde $12',
  },
  {
    number: '06',
    icon: Phone,
    title: 'Contactas lo más rápido posible',
    description:
      'Este paso es clave. Mientras más rápido contactes al prospecto después de que llenó el formulario, mayor es la probabilidad de que te recuerde y agende una cita contigo.',
    color: 'red',
    tag: 'Velocidad = cierres',
  },
  {
    number: '07',
    icon: BarChart3,
    title: 'Lo trabajas en tu CRM',
    description:
      'Desde tu dashboard puedes agregar notas, cambiar el estado del lead (nuevo, contactado, interesado, cerrado) y llevar un seguimiento completo de cada prospecto hasta el cierre.',
    color: 'blue',
    tag: 'Tu CRM, tu control',
  },
]

const HIGHLIGHTS = [
  {
    icon: DollarSign,
    title: '$100 de vuelta',
    desc: 'Al llegar a $1,000 en leads desbloqueados te devolvemos tu pago de activación.',
    color: 'text-green-400 bg-green-500/10 border-green-500/20',
  },
  {
    icon: Clock,
    title: 'Velocidad es clave',
    desc: 'Contactar en los primeros minutos puede triplicar tu tasa de respuesta.',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Star,
    title: 'Leads exclusivos',
    desc: 'Tu campaña es solo tuya. Los leads que llegan a tu dashboard no se comparten.',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: Zap,
    title: 'Sin contratos',
    desc: 'Solo pagas por los leads que decides abrir. Sin suscripción mensual.',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
]

const colorMap = {
  green: {
    ring: 'bg-green-500/10 border border-green-500/20 text-green-400',
    badge: 'bg-green-500/10 text-green-400',
    line: 'bg-green-500/30',
    number: 'text-green-500/30',
  },
  blue: {
    ring: 'bg-blue-500/10 border border-blue-500/20 text-blue-400',
    badge: 'bg-blue-500/10 text-blue-400',
    line: 'bg-blue-500/30',
    number: 'text-blue-500/30',
  },
  purple: {
    ring: 'bg-purple-500/10 border border-purple-500/20 text-purple-400',
    badge: 'bg-purple-500/10 text-purple-400',
    line: 'bg-purple-500/30',
    number: 'text-purple-500/30',
  },
  orange: {
    ring: 'bg-orange-500/10 border border-orange-500/20 text-orange-400',
    badge: 'bg-orange-500/10 text-orange-400',
    line: 'bg-orange-500/30',
    number: 'text-orange-500/30',
  },
  red: {
    ring: 'bg-red-500/10 border border-red-500/20 text-red-400',
    badge: 'bg-red-500/10 text-red-400',
    line: 'bg-red-500/30',
    number: 'text-red-500/30',
  },
}

export default function HowItWorks() {
  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 mb-4">
            <Zap size={12} className="text-green-400" />
            <span className="text-green-400 text-xs font-semibold tracking-wide uppercase">Cómo funciona</span>
          </div>
          <h1 className="text-2xl font-black text-white leading-tight">
            Tu sistema de leads,<br />paso a paso
          </h1>
          <p className="text-white/40 mt-2 text-sm leading-relaxed max-w-xl">
            LeadUnlock te da tu propio CRM, campañas de Meta personalizadas y leads frescos listos para trabajar — sin tener que montar el sistema desde cero.
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {HIGHLIGHTS.map(h => (
            <div key={h.title} className={`rounded-2xl border p-4 flex flex-col gap-2 ${h.color}`}>
              <h.icon size={16} />
              <p className="font-bold text-white text-xs leading-tight">{h.title}</p>
              <p className="text-white/40 text-[11px] leading-snug">{h.desc}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-0">
          {STEPS.map((step, i) => {
            const c = colorMap[step.color] || colorMap.green
            const isLast = i === STEPS.length - 1
            return (
              <div key={step.number} className="flex gap-5">
                {/* Timeline column */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${c.ring}`}>
                    <step.icon size={17} />
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 mt-2 mb-2 bg-white/[0.06]" />
                  )}
                </div>

                {/* Content */}
                <div className={`pb-8 ${isLast ? 'pb-0' : ''} pt-1 flex-1 min-w-0`}>
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-black tracking-widest ${c.number.replace('/30', '/50')}`}>
                      {step.number}
                    </span>
                    <h3 className="font-bold text-white text-sm">{step.title}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                      {step.tag}
                    </span>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA soporte */}
        <div className="mt-12 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-white font-bold mb-1">¿Tienes alguna duda?</h2>
          <p className="text-white/40 text-sm mb-5">Nuestro equipo responde en menos de 24 horas.</p>
          <a
            href="https://wa.me/16304154252"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-400 transition-colors text-white font-semibold text-sm px-5 py-3 rounded-xl"
          >
            <MessageCircle size={16} />
            Hablar con soporte por WhatsApp
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}
