import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, CheckCircle, ArrowRight, Lock, Unlock, BarChart3, Shield, Clock, RotateCcw, Users, Menu, X } from 'lucide-react'

function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">LeadUnlock</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-3">
          <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors px-3 py-2">
            Iniciar sesión
          </Link>
          <Link to="/register" className="bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Empezar ahora
          </Link>
        </div>

        {/* Mobile: solo botón + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link to="/register" className="bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            Empezar
          </Link>
          <button onClick={() => setOpen(o => !o)} className="text-slate-400 hover:text-white p-2 transition-colors">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden bg-slate-950 border-t border-slate-800 px-5 py-4 flex flex-col gap-3">
          <Link to="/login" onClick={() => setOpen(false)} className="text-slate-300 py-3 text-sm border-b border-slate-800 text-center">
            Iniciar sesión
          </Link>
          <Link to="/register" onClick={() => setOpen(false)} className="bg-green-500 text-white text-sm font-semibold py-3 rounded-xl text-center">
            Activar mi cuenta — $100
          </Link>
        </div>
      )}
    </nav>
  )
}

function Hero() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent" />
      <div className="max-w-6xl mx-auto px-5 relative">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium px-4 py-2 rounded-full mb-6 md:mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Conecta con Meta Ads en minutos
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white leading-tight mb-5 md:mb-6">
            Sin gastar $2,000 en sistemas
            <span className="text-green-400"> complicados de marketing</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-7 md:mb-8 leading-relaxed">
            Empieza con <strong className="text-white">$100 reembolsables</strong> y recibe tus leads de Meta Ads directo en tu dashboard.
            Solo pagas por los contactos que quieres abrir.{' '}
            <strong className="text-white">Sin mensualidades. Solo pagas lo que necesitas.</strong>
          </p>

          {/* Chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {['✓ Desde $100 para empezar', '✓ Sin mensualidades', '✓ Pagas solo por lead', '✓ $100 reembolsables'].map(item => (
              <span key={item} className="text-xs sm:text-sm bg-green-500/10 border border-green-500/20 text-green-300 px-3 py-1.5 rounded-full">
                {item}
              </span>
            ))}
          </div>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base sm:text-lg w-full sm:w-auto justify-center"
          >
            Empezar con $100 <ArrowRight size={20} />
          </Link>
          <p className="text-slate-500 text-xs sm:text-sm mt-4">
            Pago único · reembolsable al llegar a $1,000 en leads
          </p>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      icon: Zap,
      step: '01',
      title: 'Conecta tu campaña de Meta',
      desc: 'Vinculamos tu cuenta de Meta Ads con LeadUnlock. Cada nuevo lead llega directo a tu dashboard. Tarda menos de 5 minutos.',
      color: 'text-green-400 bg-green-500/10',
    },
    {
      icon: Lock,
      step: '02',
      title: 'Ve quién llegó',
      desc: 'Verás el nombre, ciudad e interés de cada persona. Los datos de contacto están protegidos hasta que decidas abrirlos.',
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      icon: Unlock,
      step: '03',
      title: 'Abre los que te interesan',
      desc: 'Paga solo por los leads que quieres contactar. Ves el teléfono, el email y haces seguimiento desde la misma plataforma.',
      color: 'text-purple-400 bg-purple-500/10',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4">Así de simple funciona</h2>
          <p className="text-base md:text-xl text-slate-500">Sin complicaciones técnicas ni configuraciones largas</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {steps.map((step) => (
            <div key={step.step} className="flex md:flex-col gap-5 md:gap-0 bg-slate-50 rounded-2xl p-5 md:p-8 border border-slate-100">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 md:mb-6 ${step.color}`}>
                <step.icon size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1 md:mb-3 tracking-widest">PASO {step.step}</div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ActivationModel() {
  return (
    <section className="py-16 md:py-24 bg-slate-950">
      <div className="max-w-4xl mx-auto px-5">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Empieza con $100 —{' '}
            <span className="text-green-400">y te los devolvemos</span>
          </h2>
          <p className="text-slate-400 text-base md:text-xl leading-relaxed max-w-2xl mx-auto">
            Para activar LeadUnlock pagas $100 una sola vez. Eso es todo lo que necesitas para empezar a recibir y abrir leads.{' '}
            <strong className="text-white">Cuando hayas comprado $1,000 en leads, te devolvemos los $100 completos.</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
          {[
            { number: '01', title: 'Pagas $100 al activar', desc: 'Un solo pago para arrancar. Sin mensualidades ni sorpresas.' },
            { number: '02', title: 'Empiezas a abrir leads', desc: 'Cada lead que abres suma hacia tu meta de $1,000.' },
            { number: '03', title: 'Llegas a $1,000 → te devolvemos $100', desc: 'Cuando acumulas $1,000 en leads comprados, regresa tu inversión.' },
          ].map((item) => (
            <div key={item.number} className="flex sm:flex-col gap-4 sm:gap-0 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 sm:mb-4">
                <span className="text-green-400 text-xs font-bold">{item.number}</span>
              </div>
              <div>
                <p className="text-white font-semibold mb-1 text-sm">{item.title}</p>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 md:p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <RotateCcw size={18} className="text-green-400" />
          </div>
          <div>
            <p className="text-green-300 font-semibold mb-1 text-sm md:text-base">¿Por qué los $100?</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              No es una tarifa de acceso — es para asegurarnos de trabajar con personas comprometidas a hacer crecer su negocio.
              Y como muestra de eso, te los regresamos cuando llegas a $1,000 en leads abiertos.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    { icon: BarChart3, title: 'Todo en un dashboard', desc: 'Ve todos tus leads en un solo lugar. Filtra por campaña, estado o fecha.' },
    { icon: Shield, title: 'Contactos protegidos', desc: 'El teléfono y email de cada lead solo se muestran cuando decides abrirlo.' },
    { icon: Clock, title: 'Llegan solos', desc: 'Conectas una vez con Meta Ads y los leads llegan automáticamente. Sin trabajo manual.' },
    { icon: Users, title: 'Seguimiento fácil', desc: 'Agrega notas, cambia el estado y lleva un historial de cada contacto.' },
  ]

  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4">Todo lo que necesitas para trabajar tus leads</h2>
          <p className="text-base md:text-xl text-slate-500">Sin complicaciones. Sin contratos.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 hover:shadow-md transition-all">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-4 md:mb-5">
                <f.icon size={20} className="text-green-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 md:mb-2 text-sm md:text-base">{f.title}</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-md mx-auto px-5">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4">Un solo precio para empezar</h2>
          <p className="text-base md:text-xl text-slate-500">Sin planes confusos. Sin letra pequeña.</p>
        </div>

        <div className="rounded-2xl border-2 border-green-500 bg-slate-950 p-6 md:p-8 shadow-2xl shadow-green-500/10">
          <div className="inline-flex items-center bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
            ÚNICO PLAN
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1">LeadUnlock</h3>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-green-400">$100</span>
            <span className="text-xs md:text-sm text-slate-400">activación única · reembolsable</span>
          </div>
          <p className="text-slate-400 text-sm mb-6">Luego pagas solo por los leads que abres, desde $12 c/u</p>

          <ul className="space-y-2.5 md:space-y-3 mb-7 md:mb-8">
            {[
              'Recibe leads ilimitados de Meta Ads',
              'Ve nombre, ciudad e interés de cada lead',
              'Abre solo los contactos que te interesan',
              'Teléfono y email completos al desbloquear',
              'Seguimiento y notas por lead',
              'Conecta con Zapier, n8n o Make',
              '$100 de vuelta cuando llegas a $1,000 en leads',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <CheckCircle size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300 text-sm">{f}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/register"
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm md:text-base"
          >
            Activar mi cuenta — $100 <ArrowRight size={16} />
          </Link>
          <p className="text-center text-slate-500 text-xs mt-3">
            Pago único. Sin suscripción mensual.
          </p>
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-16 md:py-24 bg-slate-950">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
          ¿Tienes campañas corriendo en Meta?
        </h2>
        <p className="text-slate-400 text-base md:text-xl mb-8 md:mb-10">
          Entonces ya tienes leads. Activa LeadUnlock y empieza a verlos hoy.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base md:text-lg w-full sm:w-auto"
        >
          Activar mi cuenta <ArrowRight size={20} />
        </Link>
        <p className="text-slate-600 text-xs sm:text-sm mt-4">$100 de activación · reembolsable a los $1,000 en leads</p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-10">
      <div className="max-w-6xl mx-auto px-5 flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-white">LeadUnlock</span>
        </div>
        <p className="text-slate-500 text-sm text-center">
          © {new Date().getFullYear()} LeadUnlock. Todos los derechos reservados.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Privacidad</a>
          <a href="#" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Términos</a>
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <ActivationModel />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
