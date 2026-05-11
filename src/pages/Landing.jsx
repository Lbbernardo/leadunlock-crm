import { Link } from 'react-router-dom'
import { Zap, CheckCircle, ArrowRight, Lock, Unlock, BarChart3, Shield, Clock, RotateCcw, Users } from 'lucide-react'

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">LeadUnlock</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors px-3 py-2">
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="bg-green-500 hover:bg-green-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Empezar ahora
          </Link>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="pt-32 pb-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent" />
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Conecta con Meta Ads en minutos
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Sin gastar $2,000 en sistemas
            <span className="text-green-400"> complicados de marketing</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 leading-relaxed">
            Empieza con <strong className="text-white">$100 reembolsables</strong> y recibe tus leads de Meta Ads directo en tu dashboard.
            Solo pagas por los contactos que quieres abrir.
            <strong className="text-white"> Sin mensualidades. Sin contratos. Solo pagas lo que necesitas.</strong>
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {['✓ Desde $100 para empezar', '✓ Sin mensualidades', '✓ Pagas solo por lead', '✓ $100 reembolsables'].map(item => (
              <span key={item} className="text-sm bg-green-500/10 border border-green-500/20 text-green-300 px-4 py-2 rounded-full">
                {item}
              </span>
            ))}
          </div>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-10 py-4 rounded-xl transition-colors text-lg"
          >
            Empezar con $100 <ArrowRight size={20} />
          </Link>
          <p className="text-slate-500 text-sm mt-5">
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
      desc: 'Vinculamos tu cuenta de Meta Ads con LeadUnlock. Cada nuevo lead que generes llega directo a tu dashboard. Tarda menos de 5 minutos.',
      color: 'text-green-400 bg-green-500/10',
    },
    {
      icon: Lock,
      step: '02',
      title: 'Ve quién llegó',
      desc: 'Verás el nombre, la ciudad y el interés de cada persona. Los datos de contacto están protegidos hasta que decidas abrirlos.',
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      icon: Unlock,
      step: '03',
      title: 'Abre los que te interesan',
      desc: 'Paga solo por los leads que quieres contactar. Ves el teléfono, el email y puedes hacer seguimiento desde la misma plataforma.',
      color: 'text-purple-400 bg-purple-500/10',
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Así de simple funciona</h2>
          <p className="text-xl text-slate-500">Sin complicaciones técnicas ni configuraciones largas</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.step} className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${step.color}`}>
                <step.icon size={28} />
              </div>
              <div className="text-xs font-bold text-slate-400 mb-3 tracking-widest">PASO {step.step}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ActivationModel() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-4">
            Empieza con $100 —<br />
            <span className="text-green-400">y te los devolvemos</span>
          </h2>
          <p className="text-slate-400 text-xl leading-relaxed">
            Para activar LeadUnlock pagas $100 una sola vez.
            Eso es todo lo que necesitas para empezar a recibir y abrir leads.
            <br />
            <strong className="text-white">Cuando hayas comprado $1,000 en leads, te devolvemos los $100 completos.</strong>
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            { number: '01', title: 'Pagas $100 al activar', desc: 'Un solo pago para arrancar. Sin mensualidades.' },
            { number: '02', title: 'Empiezas a abrir leads', desc: 'Cada lead que abres suma hacia tu meta de $1,000.' },
            { number: '03', title: 'Llegaste a $1,000 → te devolvemos $100', desc: 'Cuando acumulas $1,000 en leads comprados, regresa tu inversión inicial.' },
          ].map((item) => (
            <div key={item.number} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-green-400 text-xs font-bold">{item.number}</span>
              </div>
              <p className="text-white font-semibold mb-2 text-sm">{item.title}</p>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <RotateCcw size={18} className="text-green-400" />
          </div>
          <div>
            <p className="text-green-300 font-semibold mb-1">¿Por qué los $100?</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              No es una tarifa de acceso — es para asegurarnos de trabajar con personas comprometidas a hacer crecer su negocio. Y como muestra de eso, te los regresamos cuando llegas a $1,000 en leads abiertos.
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
    { icon: Users, title: 'Seguimiento fácil', desc: 'Agrega notas, cambia el estado del lead y lleva un historial de cada contacto.' },
  ]

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Todo lo que necesitas para trabajar tus leads</h2>
          <p className="text-xl text-slate-500">Sin complicaciones. Sin contratos.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-5">
                <f.icon size={22} className="text-green-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-md mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Un solo precio para empezar</h2>
          <p className="text-xl text-slate-500">Sin planes confusos. Sin letra pequeña.</p>
        </div>

        <div className="rounded-2xl border-2 border-green-500 bg-slate-950 p-8 shadow-2xl shadow-green-500/10">
          <div className="inline-flex items-center bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
            ÚNICO PLAN
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">LeadUnlock</h3>
          <div className="mb-1">
            <span className="text-4xl font-extrabold text-green-400">$100</span>
            <span className="text-sm text-slate-400 ml-2">activación única · reembolsable</span>
          </div>
          <p className="text-slate-400 text-sm mb-6">Luego pagas solo por los leads que abres, desde $12 c/u</p>

          <ul className="space-y-3 mb-8">
            {[
              'Recibe leads ilimitados de Meta Ads',
              'Ve nombre, ciudad e interés de cada lead',
              'Abre solo los contactos que te interesan',
              'Teléfono y email completos al desbloquear',
              'Seguimiento y notas por lead',
              'Conecta con Zapier, n8n o Make',
              '$100 de vuelta cuando llegas a $1,000 en leads',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300 text-sm">{f}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/register"
            className="block text-center bg-green-500 hover:bg-green-400 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Activar mi cuenta — $100
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
    <section className="py-24 bg-slate-950">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          ¿Tienes campañas corriendo en Meta?
        </h2>
        <p className="text-slate-400 text-xl mb-10">
          Entonces ya tienes leads. Activa LeadUnlock y empieza a verlos hoy.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-10 py-4 rounded-xl transition-colors text-lg"
        >
          Activar mi cuenta <ArrowRight size={20} />
        </Link>
        <p className="text-slate-600 text-sm mt-5">$100 de activación · reembolsable a los $1,000 en leads</p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-bold text-white">LeadUnlock</span>
        </div>
        <p className="text-slate-500 text-sm">
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
