import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'motion/react'
import {
  Unlock, ArrowRight, Lock, BarChart3, Shield, Users, Menu, X,
  CheckCircle, Zap, TrendingUp, Star, ChevronRight, Check,
  MessageSquare, Phone, Rocket
} from 'lucide-react'

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
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

/* ─── Dashboard Mockup ─── */
function DashboardMockup() {
  const leads = [
    { name: 'Carlos M.', city: 'Miami, FL', tag: 'Final Expense', locked: false },
    { name: 'Ana R.', city: 'Orlando, FL', tag: 'Medicare', locked: true },
    { name: 'John D.', city: 'Tampa, FL', tag: 'Whole Life', locked: true },
  ]
  return (
    <div className="relative w-full max-w-[480px]">
      {/* Glow behind card */}
      <div className="absolute -inset-10 bg-green-500/10 blur-3xl rounded-full" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30, rotateY: -6 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        className="relative bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        style={{ perspective: '1000px' }}
      >
        {/* Card header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-green-500 rounded-md flex items-center justify-center">
              <Unlock size={11} className="text-white" />
            </div>
            <span className="text-white text-sm font-semibold">Mi Dashboard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Live</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-px bg-white/5">
          {[
            { label: 'Leads generados', value: '1,248' },
            { label: 'ROI promedio', value: '4.2x' },
            { label: 'Leads entregados', value: '+10K' },
          ].map((s) => (
            <div key={s.label} className="bg-[#0d1117] px-3 py-3.5 text-center">
              <p className="text-white font-black text-lg leading-none">{s.value}</p>
              <p className="text-white/30 text-[10px] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Lead list */}
        <div className="p-4 space-y-2.5">
          {leads.map((l, i) => (
            <div key={i} className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 border ${l.locked ? 'bg-white/[0.02] border-white/5' : 'bg-green-500/5 border-green-500/20'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${l.locked ? 'bg-white/5 text-white/20' : 'bg-green-500/20 text-green-400'}`}>
                  {l.locked ? <Lock size={12} /> : l.name[0]}
                </div>
                <div>
                  <p className={`text-sm font-medium ${l.locked ? 'text-white/20' : 'text-white'}`}>
                    {l.locked ? '••••• •••••' : l.name}
                  </p>
                  <p className="text-white/25 text-[11px]">{l.locked ? '•••••••, ••' : l.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${l.locked ? 'bg-white/5 text-white/20' : 'bg-green-500/20 text-green-400'}`}>
                  {l.tag}
                </span>
                {!l.locked && (
                  <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Unlock button */}
        <div className="px-4 pb-4">
          <button className="w-full bg-green-500 hover:bg-green-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
            <Unlock size={13} />
            Desbloquear lead — $15
          </button>
        </div>
      </motion.div>

      {/* Floating stat badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5 border border-neutral-100"
      >
        <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
          <TrendingUp size={14} className="text-green-600" />
        </div>
        <div>
          <p className="text-[10px] text-neutral-400 font-medium">Esta semana</p>
          <p className="text-sm font-black text-neutral-900">+24 leads</p>
        </div>
      </motion.div>

      {/* Floating notification */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.1 }}
        className="absolute -bottom-4 -left-4 bg-[#0d1117] border border-green-500/30 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5"
      >
        <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center">
          <Phone size={13} className="text-green-400" />
        </div>
        <div>
          <p className="text-[10px] text-white/30 font-medium">Nuevo lead</p>
          <p className="text-sm font-bold text-white">Carlos M. — FL</p>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Navbar ─── */
function Navbar() {
  const [open, setOpen] = useState(false)
  const navLinks = [
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Beneficios', href: '#beneficios' },
    { label: 'Precios', href: '#precios' },
  ]
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b10]/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
            <Unlock size={15} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">LeadUnlock</span>
        </div>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-white/50 hover:text-white text-sm transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/login" className="text-white/50 hover:text-white text-sm transition-colors px-4 py-2">
            Iniciar sesión
          </Link>
          <Link to="/register" className="bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40">
            Empezar ahora →
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <Link to="/register" className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl">
            Empezar
          </Link>
          <button onClick={() => setOpen(o => !o)} className="text-white/50 hover:text-white p-2">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-[#070b10] border-t border-white/5 px-5 py-4 flex flex-col gap-2">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="text-white/60 py-3 text-sm border-b border-white/5">
              {l.label}
            </a>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} className="text-white/60 py-3 text-sm text-center">
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

/* ─── Hero ─── */
function Hero() {
  const pills = ['Sin mensualidades', 'Meta Ads incluido', 'Desde $12/lead', '$100 reembolsable']
  return (
    <section className="pt-28 pb-20 md:pt-36 md:pb-32 bg-[#070b10] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_60%_30%,rgba(34,197,94,0.08),transparent)]" />
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '36px 36px' }} />

      <div className="max-w-6xl mx-auto px-5 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — text */}
          <div>
            {/* Badge */}
            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium px-4 py-2 rounded-full mb-8">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Campañas de Meta Ads listas en 24 horas
              </div>
            </FadeIn>

            {/* Headline */}
            <FadeIn delay={0.1}>
              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.05] text-white mb-6">
                Sin gastar $2,000 en sistemas de{' '}
                <span className="text-green-400">marketing</span>{' '}
                complicados
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-white/50 text-lg leading-relaxed mb-8 max-w-lg">
                Nosotros creamos tu campaña de Meta Ads. Los leads llegan a tu dashboard y tú decides cuáles abrir. Solo pagas por los que te interesan.
              </p>
            </FadeIn>

            {/* Pills */}
            <FadeIn delay={0.3}>
              <div className="flex flex-wrap gap-2 mb-10">
                {pills.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium px-3.5 py-1.5 rounded-full">
                    <Check size={11} />
                    {p}
                  </span>
                ))}
              </div>
            </FadeIn>

            {/* CTA */}
            <FadeIn delay={0.4}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <Link
                  to="/register"
                  className="group flex items-center gap-2.5 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-xl transition-all text-base shadow-xl shadow-green-500/30 hover:shadow-green-500/50"
                >
                  Empezar ahora — $100
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="text-white/35 hover:text-white/70 text-sm transition-colors">
                  Ya tengo cuenta →
                </Link>
              </div>
              <p className="text-white/20 text-xs">
                Pago único · Los $100 son reembolsables al llegar a $1,000 en leads abiertos
              </p>
            </FadeIn>
          </div>

          {/* Right — dashboard mockup */}
          <FadeIn delay={0.2} className="flex justify-center lg:justify-end">
            <DashboardMockup />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    {
      step: '01',
      icon: Rocket,
      title: 'Activamos tu campaña',
      desc: 'Diseñamos y lanzamos una campaña de Meta Ads para tu nicho específico. Sin conocimiento técnico de tu parte.',
      circleColor: 'bg-green-500',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
    },
    {
      step: '02',
      icon: Lock,
      title: 'Los leads llegan solos',
      desc: 'Cada persona que responde tu anuncio aparece en tu dashboard. Ves nombre, ciudad e interés antes de decidir abrirlo.',
      circleColor: 'bg-blue-500',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      step: '03',
      icon: Unlock,
      title: 'Abre solo los que quieres',
      desc: 'Paga únicamente por los leads que te interesan. Al abrir ves teléfono y email completos.',
      circleColor: 'bg-purple-500',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
    },
  ]

  const strip = [
    { icon: Check, label: 'Sin contratos' },
    { icon: Check, label: 'Sin mensualidades' },
    { icon: TrendingUp, label: 'Resultados medibles' },
    { icon: MessageSquare, label: 'Soporte humano' },
  ]

  return (
    <section id="como-funciona" className="bg-white">
      <div className="max-w-6xl mx-auto px-5 py-20 md:py-28">
        <FadeIn className="text-center mb-16">
          <span className="inline-block bg-green-100 text-green-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            Proceso simple
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 mb-4">
            Así de simple funciona
          </h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Sin configuraciones largas ni conocimiento técnico requerido
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {steps.map((step, i) => (
            <FadeIn key={step.step} delay={i * 0.12}>
              <div className="bg-white border border-neutral-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow h-full">
                {/* Number circle */}
                <div className={`w-10 h-10 ${step.circleColor} rounded-full flex items-center justify-center mb-6`}>
                  <span className="text-white text-sm font-black">{step.step}</span>
                </div>
                {/* Icon */}
                <div className={`w-12 h-12 ${step.iconBg} rounded-2xl flex items-center justify-center mb-5`}>
                  <step.icon size={22} className={step.iconColor} />
                </div>
                <h3 className="text-neutral-900 font-bold text-lg mb-3">{step.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Feature strip */}
        <FadeIn delay={0.3}>
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-5 flex flex-wrap justify-around gap-5">
            {strip.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <item.icon size={12} className="text-green-600" />
                </div>
                <span className="text-neutral-700 text-sm font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── Benefits ─── */
function Benefits() {
  const features = [
    { icon: BarChart3, title: 'Dashboard en tiempo real', desc: 'Todos tus leads en un solo lugar. Filtra por estado, fecha o campaña sin complicaciones.' },
    { icon: Shield, title: 'Datos protegidos', desc: 'Teléfono y email solo se revelan cuando decides abrir el lead. Tu inversión está segura.' },
    { icon: Users, title: 'Seguimiento completo', desc: 'Agrega notas, cambia estados y lleva historial de cada contacto desde la plataforma.' },
    { icon: TrendingUp, title: 'Métricas claras', desc: 'Ve cuántos leads llegaron, cuántos abriste y cuánto invertiste. Sin hojas de cálculo.' },
  ]

  return (
    <section id="beneficios" className="py-20 md:py-28 bg-[#070b10] border-t border-white/5">
      <div className="max-w-6xl mx-auto px-5">
        <FadeIn className="text-center mb-16">
          <span className="inline-block bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            Plataforma
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Todo lo que necesitas</h2>
          <p className="text-white/40 text-lg">Sin contratos. Sin sorpresas.</p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 h-full hover:border-green-500/20 hover:bg-white/[0.05] transition-all group">
                <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center mb-5">
                  <f.icon size={18} className="text-green-400" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-2">{f.title}</h3>
                <p className="text-white/35 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ─── */
function Pricing() {
  return (
    <section id="precios" className="py-20 md:py-28 bg-[#070b10] border-t border-white/5">
      <div className="max-w-md mx-auto px-5">
        <FadeIn className="text-center mb-12">
          <span className="inline-block bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            Precio
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Un solo plan. Sin letra pequeña.</h2>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="relative rounded-2xl border border-green-500/30 bg-white/[0.03] p-7 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-green-500/60 to-transparent" />
            <div className="inline-flex items-center bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-5">
              ÚNICO PLAN
            </div>
            <h3 className="text-xl font-bold text-white mb-1">LeadUnlock</h3>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black text-white">$100</span>
              <span className="text-white/30 text-sm">activación · reembolsable</span>
            </div>
            <p className="text-white/30 text-sm mb-7">Luego pagas solo por los leads que abres, desde $12 c/u</p>
            <ul className="space-y-3 mb-8">
              {[
                'Campaña de Meta Ads personalizada para tu negocio',
                'Los leads llegan solos a tu dashboard',
                'Ve nombre, ciudad e interés antes de abrir',
                'Teléfono y email completos al desbloquear',
                'Seguimiento y notas por lead',
                'Sin mensualidades — pagas solo lo que abres',
                '$100 de vuelta cuando llegas a $1,000 en leads',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-white/60 text-sm">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="group flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold py-3.5 rounded-xl transition-all text-sm shadow-lg shadow-green-500/25"
            >
              Activar mi cuenta — $100
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-center text-white/20 text-xs mt-3">Pago único. Sin suscripción mensual.</p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section className="py-20 md:py-28 bg-[#070b10] border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(34,197,94,0.08),transparent)]" />
      <div className="max-w-2xl mx-auto px-5 text-center relative">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-5">
            ¿Listo para recibir leads de calidad?
          </h2>
          <p className="text-white/40 text-lg mb-10">
            Activa tu cuenta hoy. Nosotros creamos tu campaña y los leads empiezan a llegar solos.
          </p>
          <Link
            to="/register"
            className="group inline-flex items-center justify-center gap-2.5 bg-green-500 hover:bg-green-400 text-white font-bold px-10 py-4 rounded-xl transition-all text-base shadow-xl shadow-green-500/25 hover:shadow-green-500/40 w-full sm:w-auto"
          >
            Activar mi cuenta
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-white/20 text-xs mt-4">$100 de activación · reembolsable a los $1,000 en leads</p>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="bg-[#070b10] border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-5 flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
            <Unlock size={13} className="text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">LeadUnlock</span>
        </div>
        <p className="text-white/20 text-sm">© {new Date().getFullYear()} LeadUnlock. Todos los derechos reservados.</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="text-white/20 hover:text-white/50 text-sm transition-colors">Privacidad</Link>
          <a href="#" className="text-white/20 hover:text-white/50 text-sm transition-colors">Términos</a>
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#070b10]">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Benefits />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  )
}
