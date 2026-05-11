import { Link } from 'react-router-dom'
import { Zap, CheckCircle, ArrowRight, Lock, Unlock, BarChart3, Shield, Clock, DollarSign, TrendingUp } from 'lucide-react'

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
            Crear cuenta gratis
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
            Recibe leads y paga
            <span className="text-green-400"> solo los que cierras</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 leading-relaxed">
            Tus campañas de Meta Ads generan leads. Nosotros los entregamos en tu dashboard.
            Solo pagas <strong className="text-white">desde $12 por lead</strong> para ver el contacto completo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg w-full sm:w-auto justify-center"
            >
              Empezar gratis <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-xl transition-colors text-lg w-full sm:w-auto justify-center"
            >
              Ver demo
            </Link>
          </div>
          <p className="text-slate-500 text-sm mt-5">
            Sin tarjeta de crédito · Sin instalación · Leads reales desde Meta
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
      title: 'Conecta tus campañas',
      desc: 'Vincula tu cuenta de Meta Ads o usa nuestro webhook con Zapier, Make o n8n. Tarda menos de 5 minutos.',
      color: 'text-green-400 bg-green-500/10',
    },
    {
      icon: Lock,
      step: '02',
      title: 'Recibe leads automáticamente',
      desc: 'Cada lead llega a tu dashboard con información básica visible: nombre, ciudad e interés. Sin costo.',
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      icon: Unlock,
      step: '03',
      title: 'Desbloquea los que te interesan',
      desc: 'Paga desde $12 por lead para ver teléfono, email y datos completos. El precio varía según el costo de la campaña.',
      color: 'text-purple-400 bg-purple-500/10',
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Cómo funciona</h2>
          <p className="text-xl text-slate-500">Tres pasos para tener leads listos para cerrar</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.step} className="relative">
              <div className="bg-slate-50 rounded-2xl p-8 h-full border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${step.color}`}>
                  <step.icon size={28} />
                </div>
                <div className="text-xs font-bold text-slate-400 mb-3 tracking-widest">PASO {step.step}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PriceExplainer() {
  return (
    <section className="py-20 bg-slate-950">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
          <TrendingUp size={13} />
          Precio justo basado en costo real
        </div>
        <h2 className="text-4xl font-bold text-white mb-6">
          El precio del lead refleja<br />
          <span className="text-green-400">lo que costó conseguirlo</span>
        </h2>
        <p className="text-slate-400 text-lg mb-12 leading-relaxed">
          No cobramos un precio fijo arbitrario. Cada lead tiene un precio basado en el costo real de la campaña que lo generó. Siempre mínimo $12, siempre transparente.
        </p>
        <div className="grid sm:grid-cols-3 gap-6 text-left">
          {[
            { label: 'Lead de campaña económica', cost: '$3 costo', price: '$12', note: 'precio mínimo garantizado' },
            { label: 'Lead de campaña estándar', cost: '$8 costo', price: '$24', note: '3× el costo de adquisición' },
            { label: 'Lead de nicho premium', cost: '$15 costo', price: '$45', note: '3× el costo de adquisición' },
          ].map((item) => (
            <div key={item.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm mb-3">{item.label}</p>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs text-slate-500">{item.cost}</span>
                <span className="text-2xl font-extrabold text-green-400">{item.price}</span>
              </div>
              <p className="text-xs text-slate-500 text-right">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    { icon: BarChart3, title: 'Dashboard en tiempo real', desc: 'Ve todos tus leads ordenados, filtrados por campaña, estado y fecha.' },
    { icon: Shield, title: 'Datos seguros', desc: 'Los contactos están protegidos hasta que decides desbloquearlos.' },
    { icon: Clock, title: 'Webhooks instantáneos', desc: 'Compatible con Meta Ads, Zapier, Make, n8n y GoHighLevel.' },
    { icon: DollarSign, title: 'Sin suscripción forzada', desc: 'Paga solo por los leads que abres. Sin mensualidad obligatoria.' },
  ]

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Todo lo que necesitas</h2>
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
  const plans = [
    {
      name: 'Gratis',
      price: '$0',
      period: 'siempre gratis',
      desc: 'Para ver leads entrantes sin compromiso',
      features: [
        'Recibe leads ilimitados',
        'Ver nombre, ciudad e interés',
        'Dashboard básico',
        'Webhook con Meta Ads, n8n, Zapier',
      ],
      cta: 'Empezar gratis',
      href: '/register',
      highlighted: false,
    },
    {
      name: 'Pay per Lead',
      price: 'Desde $12',
      period: 'por lead desbloqueado',
      desc: 'Paga solo por los contactos que quieres cerrar',
      features: [
        'Todo lo del plan gratis',
        'Teléfono y email completos',
        'Notas y seguimiento de status',
        'Historial de desbloqueos',
        'Precio basado en costo real de campaña',
        'Soporte por email',
      ],
      cta: 'Crear cuenta',
      href: '/register',
      highlighted: true,
    },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Precios simples y transparentes</h2>
          <p className="text-xl text-slate-500">Sin sorpresas. Sin letra pequeña.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border-2 transition-all ${
                plan.highlighted
                  ? 'border-green-500 bg-slate-950 shadow-2xl shadow-green-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'
              }`}
            >
              {plan.highlighted && (
                <div className="inline-flex items-center bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                  MÁS POPULAR
                </div>
              )}
              <h3 className={`text-2xl font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                {plan.name}
              </h3>
              <div className="mb-1">
                <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-green-400' : 'text-slate-900'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ml-1 ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                  {plan.period}
                </span>
              </div>
              <p className={`text-sm mb-6 ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                {plan.desc}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className={`text-sm ${plan.highlighted ? 'text-slate-300' : 'text-slate-600'}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to={plan.href}
                className={`block text-center font-semibold py-3 rounded-xl transition-colors ${
                  plan.highlighted
                    ? 'bg-green-500 hover:bg-green-400 text-white'
                    : 'border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-400 text-sm mt-8">
          ¿Volumen alto? <Link to="/register" className="text-green-600 hover:underline font-medium">Contáctanos</Link> para planes personalizados.
        </p>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Empieza a recibir leads hoy
        </h2>
        <p className="text-slate-400 text-xl mb-10">
          Crea tu cuenta gratis, conecta tu campaña y empieza a ver leads en minutos.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-10 py-4 rounded-xl transition-colors text-lg"
        >
          Crear cuenta gratis <ArrowRight size={20} />
        </Link>
        <p className="text-slate-600 text-sm mt-5">Sin tarjeta de crédito requerida</p>
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
      <PriceExplainer />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
