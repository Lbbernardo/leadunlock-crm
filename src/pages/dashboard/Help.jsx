import { useState } from 'react'
import { ChevronDown, ChevronUp, MessageCircle, Mail, Unlock, DollarSign, Zap, BarChart3, Lock, RotateCcw } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'

const FAQS = [
  {
    category: 'Cómo funciona',
    icon: Zap,
    color: 'text-green-500 bg-green-50',
    items: [
      {
        q: '¿Cómo llegan los leads a mi dashboard?',
        a: 'Nuestro equipo crea y gestiona una campaña de Meta Ads personalizada para tu negocio. Cada persona que responde tu anuncio aparece automáticamente en tu dashboard. No tienes que hacer nada técnico.',
      },
      {
        q: '¿Cuánto tiempo tarda en llegar el primer lead?',
        a: 'Una vez activada tu cuenta, creamos tu campaña en 24-48 horas. Los primeros leads suelen llegar en las primeras 48-72 horas después de lanzar la campaña.',
      },
      {
        q: '¿Qué veo antes de abrir un lead?',
        a: 'Puedes ver el nombre, la ciudad y el tipo de producto que le interesa. El teléfono y el email están protegidos hasta que decides desbloquear ese contacto.',
      },
    ],
  },
  {
    category: 'Pagos y precios',
    icon: DollarSign,
    color: 'text-blue-500 bg-blue-50',
    items: [
      {
        q: '¿Cuánto cuesta abrir un lead?',
        a: 'El precio de cada lead depende del costo de la campaña que lo generó. El mínimo es $12 por lead. Solo pagas por los leads que tú decides abrir — los que no te interesan no te cuestan nada.',
      },
      {
        q: '¿Para qué son los $100 de activación?',
        a: 'Los $100 son un pago único para activar tu cuenta y arrancar tu campaña personalizada. No es una mensualidad. Y lo mejor: cuando hayas gastado $1,000 en leads, te los devolvemos completos.',
      },
      {
        q: '¿Cuándo me devuelven los $100?',
        a: 'Cuando el total de leads que hayas desbloqueado sume $1,000 o más, nuestro equipo te devuelve los $100 de activación. Es nuestra forma de reconocer tu compromiso.',
      },
      {
        q: '¿Hay mensualidades o suscripciones?',
        a: 'No. Solo pagas los $100 de activación una sola vez, y después únicamente pagas por los leads que quieres abrir. Sin mensualidades, sin contratos.',
      },
    ],
  },
  {
    category: 'Tus leads',
    icon: BarChart3,
    color: 'text-purple-500 bg-purple-50',
    items: [
      {
        q: '¿Qué pasa si un lead no me sirve?',
        a: 'Simplemente no lo desbloqueas y no te cobra nada. Solo pagas por los contactos que tú decides abrir.',
      },
      {
        q: '¿Puedo agregar notas a un lead?',
        a: 'Sí. Al entrar al detalle de un lead desbloqueado puedes agregar notas internas y cambiar el estado (nuevo, contactado, interesado, cerrado, etc.) para llevar tu seguimiento.',
      },
      {
        q: '¿Los leads son exclusivos para mí?',
        a: 'Sí. La campaña está diseñada específicamente para tu negocio y los leads que llegan a tu dashboard son solo tuyos.',
      },
    ],
  },
  {
    category: 'Tu cuenta',
    icon: Lock,
    color: 'text-orange-500 bg-orange-50',
    items: [
      {
        q: '¿Puedo cambiar la información de mi campaña?',
        a: 'Sí. Escríbenos por soporte y nuestro equipo ajusta la campaña según tus necesidades. Podemos cambiar la audiencia, el área geográfica o el enfoque del anuncio.',
      },
      {
        q: '¿Qué pasa si quiero pausar mi cuenta?',
        a: 'Contáctanos por soporte y pausamos tu campaña sin costo adicional. Tus leads guardados siguen disponibles en tu dashboard.',
      },
    ],
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-medium text-slate-900 text-sm leading-relaxed">{q}</span>
        {open
          ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
          : <ChevronDown size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-slate-100">
          <p className="text-slate-600 text-sm leading-relaxed pt-3">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function Help() {
  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Centro de ayuda</h1>
          <p className="text-slate-500 mt-1">Todo lo que necesitas saber para sacarle el máximo a tus leads</p>
        </div>

        {/* Resumen rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Zap, label: 'Tu campaña lista', desc: 'en 24-48h tras activar', color: 'bg-green-50 text-green-600' },
            { icon: Unlock, label: 'Paga desde $12', desc: 'solo por leads que abres', color: 'bg-blue-50 text-blue-600' },
            { icon: RotateCcw, label: '$100 de vuelta', desc: 'al llegar a $1,000 en leads', color: 'bg-purple-50 text-purple-600' },
          ].map(item => (
            <div key={item.label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <item.icon size={17} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQs por categoría */}
        <div className="space-y-8 mb-10">
          {FAQS.map(section => (
            <div key={section.category}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${section.color}`}>
                  <section.icon size={16} />
                </div>
                <h2 className="font-semibold text-slate-900">{section.category}</h2>
              </div>
              <div className="space-y-2">
                {section.items.map(item => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contactar soporte */}
        <div className="bg-slate-900 rounded-2xl p-6 md:p-8">
          <h2 className="text-lg font-bold text-white mb-1">¿No encontraste lo que buscabas?</h2>
          <p className="text-slate-400 text-sm mb-6">Nuestro equipo responde en menos de 24 horas.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="mailto:soporte@unlocklead.click"
              className="flex items-center gap-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm group-hover:text-green-400 transition-colors">Enviar email</p>
                <p className="text-slate-500 text-xs mt-0.5">soporte@unlocklead.click</p>
              </div>
            </a>
            <a
              href="https://wa.me/16304154252"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm group-hover:text-green-400 transition-colors">WhatsApp</p>
                <p className="text-slate-500 text-xs mt-0.5">Respuesta rápida</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
