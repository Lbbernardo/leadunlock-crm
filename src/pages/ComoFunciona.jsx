import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'motion/react'
import {
  CreditCard, Settings, Megaphone, Lock, Unlock, Phone, BarChart3,
  MessageCircle, Zap, DollarSign, Clock, Star, ArrowRight, Check,
  ChevronLeft, Shield
} from 'lucide-react'

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

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
    title: 'Configuramos tu campaña en Meta',
    description:
      'Nuestro equipo crea tu campaña de Meta Ads en 24–48 horas. Personalizamos la audiencia, el área geográfica, el nicho (seguros de vida, IUL, anualidades, Medicare, etc.) y el contenido del anuncio.',
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
    color: 'bg-green-500/10 border-green-500/20 text-green-400',
  },
  {
    icon: Clock,
    title: 'Velocidad es clave',
    desc: 'Contactar en los primeros minutos puede triplicar tu tasa de respuesta.',
    color: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  },
  {
    icon: Star,
    title: 'Leads exclusivos',
    desc: 'Tu campaña es solo tuya. Los leads no se comparten con nadie más.',
    color: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  },
  {
    icon: Zap,
    title: 'Sin contratos',
    desc: 'Solo pagas por los leads que decides abrir. Sin suscripción mensual.',
    color: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  },
]

const colorMap = {
  green:  { icon: 'bg-green-500/10 border border-green-500/20 text-green-400',  badge: 'bg-green-500/10 text-green-400',  num: 'text-green-500/40' },
  blue:   { icon: 'bg-blue-500/10 border border-blue-500/20 text-blue-400',     badge: 'bg-blue-500/10 text-blue-400',    num: 'text-blue-500/40' },
  purple: { icon: 'bg-purple-500/10 border border-purple-500/20 text-purple-400', badge: 'bg-purple-500/10 text-purple-400', num: 'text-purple-500/40' },
  orange: { icon: 'bg-orange-500/10 border border-orange-500/20 text-orange-400', badge: 'bg-orange-500/10 text-orange-400', num: 'text-orange-500/40' },
  red:    { icon: 'bg-red-500/10 border border-red-500/20 text-red-400',        badge: 'bg-red-500/10 text-red-400',      num: 'text-red-500/40' },
}

export default function ComoFunciona() {
  return (
    <div className="min-h-screen bg-[#070b10]">
      {/* Navbar mínimo */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b10]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-black text-white text-base tracking-tight">LeadUnlock</span>
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-green-500/20"
          >
            Empezar — $100
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-5 pt-28 pb-24">
        {/* Back */}
        <FadeIn>
          <Link to="/" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-sm transition-colors mb-10">
            <ChevronLeft size={16} />
            Volver al inicio
          </Link>
        </FadeIn>

        {/* Header */}
        <FadeIn delay={0.05}>
          <div className="mb-14 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 mb-5">
              <Zap size={12} className="text-green-400" />
              <span className="text-green-400 text-xs font-semibold tracking-wide uppercase">Cómo funciona</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
              Tu sistema de leads,<br />paso a paso
            </h1>
            <p className="text-white/40 text-lg leading-relaxed">
              LeadUnlock es una plataforma creada para ayudar a agentes y asesores a conseguir leads interesados en productos financieros y de seguros. Sin montar el sistema desde cero.
            </p>
          </div>
        </FadeIn>

        {/* Highlights */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-16">
            {HIGHLIGHTS.map(h => (
              <div key={h.title} className={`rounded-2xl border p-4 flex flex-col gap-2 ${h.color}`}>
                <h.icon size={16} />
                <p className="font-bold text-white text-xs leading-tight">{h.title}</p>
                <p className="text-white/40 text-[11px] leading-snug">{h.desc}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Steps */}
        <div className="mb-16">
          {STEPS.map((step, i) => {
            const c = colorMap[step.color] || colorMap.green
            const isLast = i === STEPS.length - 1
            return (
              <FadeIn key={step.number} delay={0.05 + i * 0.06}>
                <div className="flex gap-6">
                  {/* Timeline */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                      <step.icon size={18} />
                    </div>
                    {!isLast && <div className="w-px flex-1 mt-3 mb-3 bg-white/[0.06]" />}
                  </div>

                  {/* Content */}
                  <div className={`${isLast ? 'pb-0' : 'pb-10'} pt-1 flex-1 min-w-0`}>
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <span className={`text-[10px] font-black tracking-widest ${c.num}`}>{step.number}</span>
                      <h3 className="font-bold text-white text-base">{step.title}</h3>
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${c.badge}`}>
                        {step.tag}
                      </span>
                    </div>
                    <p className="text-white/40 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>

        {/* Resumen final */}
        <FadeIn delay={0.2}>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 mb-10">
            <h2 className="text-white font-black text-xl mb-3">En pocas palabras</h2>
            <p className="text-white/50 text-base leading-relaxed mb-6">
              LeadUnlock te ayuda a tener tu propio CRM, campañas de Meta personalizadas y leads frescos listos para trabajar — sin tener que montar todo el sistema desde cero.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { icon: Shield, label: 'Tu campaña lista en 24h' },
                { icon: Unlock, label: 'Abre solo los leads que quieres' },
                { icon: DollarSign, label: '$100 de vuelta al llegar a $1,000' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3">
                  <div className="w-7 h-7 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon size={14} className="text-green-400" />
                  </div>
                  <span className="text-white/60 text-xs font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.25}>
          <div className="relative rounded-2xl overflow-hidden border border-green-500/20 bg-[#0c1018]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-green-500/[0.05] blur-2xl rounded-full pointer-events-none" />
            <div className="relative p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-white font-black text-xl mb-1">¿Listo para recibir leads?</h2>
                <p className="text-white/40 text-sm">Activa tu cuenta hoy y tu campaña estará lista en 24–48 horas.</p>
              </div>
              <div className="flex flex-col gap-3 items-center flex-shrink-0">
                <Link
                  to="/register"
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black px-8 py-4 rounded-xl transition-all shadow-lg shadow-green-500/25 whitespace-nowrap text-sm"
                >
                  Activar mi cuenta — $100
                  <ArrowRight size={15} />
                </Link>
                <div className="flex items-center gap-4">
                  {['Sin contrato', 'Reembolsable', 'Desde $12/lead'].map(t => (
                    <span key={t} className="flex items-center gap-1 text-white/20 text-[11px]">
                      <Check size={10} className="text-green-500/50" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Soporte */}
        <FadeIn delay={0.3}>
          <div className="mt-8 text-center">
            <p className="text-white/25 text-sm mb-3">¿Tienes preguntas? Escríbenos directamente.</p>
            <a
              href="https://wa.me/16304154252"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
            >
              <MessageCircle size={16} />
              Hablar con soporte por WhatsApp
            </a>
          </div>
        </FadeIn>
      </main>

      {/* Footer mínimo */}
      <footer className="border-t border-white/[0.05] bg-[#050810]">
        <div className="max-w-4xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs">© {new Date().getFullYear()} LeadUnlock. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-white/20 hover:text-white/50 text-xs transition-colors">Privacidad</Link>
            <Link to="/login" className="text-white/20 hover:text-white/50 text-xs transition-colors">Iniciar sesión</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
