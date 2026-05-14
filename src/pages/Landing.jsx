import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'motion/react'
import {
  Unlock, ArrowRight, Lock, BarChart3, Shield, Users, Menu, X,
  CheckCircle, TrendingUp, Check, MessageSquare, Phone, Rocket,
  Star, ChevronDown, DollarSign, Zap, FileText, HeartHandshake,
  Car, Home, Activity, BadgeCheck
} from 'lucide-react'

/* ─── Helpers ─── */
function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
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
    { name: 'Maria L.', city: 'Houston, TX', tag: 'Auto', locked: true },
  ]
  return (
    <div className="relative w-full max-w-[500px] mx-auto">
      <div className="absolute -inset-16 bg-green-500/[0.06] blur-3xl rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
        className="relative bg-[#0c1018] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
      >
        {/* Window bar */}
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-[#0a0e15]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1">
              <div className="w-5 h-5 bg-green-500 rounded-md flex items-center justify-center">
                <Unlock size={9} className="text-white" />
              </div>
              <span className="text-white/50 text-[11px]">app.unlocklead.click</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-[10px] font-medium">Live</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-white/[0.04]">
          {[
            { label: 'Leads', value: '1,248' },
            { label: 'ROI', value: '4.2x' },
            { label: 'Entregados', value: '+10K' },
          ].map((s) => (
            <div key={s.label} className="bg-[#0c1018] px-3 py-3 text-center">
              <p className="text-white font-black text-base leading-none">{s.value}</p>
              <p className="text-white/25 text-[9px] mt-0.5 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Lead list */}
        <div className="p-3.5 space-y-2">
          {leads.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
                l.locked
                  ? 'bg-white/[0.015] border-white/[0.04]'
                  : 'bg-green-500/[0.07] border-green-500/20'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  l.locked ? 'bg-white/[0.04] text-white/15' : 'bg-green-500/20 text-green-400'
                }`}>
                  {l.locked ? <Lock size={10} /> : l.name[0]}
                </div>
                <div>
                  <p className={`text-xs font-semibold ${l.locked ? 'text-white/15' : 'text-white'}`}>
                    {l.locked ? '••••• •••••' : l.name}
                  </p>
                  <p className="text-white/20 text-[10px]">{l.locked ? '•••••••, ••' : l.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                  l.locked ? 'bg-white/[0.04] text-white/15' : 'bg-green-500/20 text-green-400'
                }`}>
                  {l.tag}
                </span>
                {!l.locked && (
                  <div className="w-5 h-5 bg-green-500 rounded-md flex items-center justify-center">
                    <Check size={9} className="text-white" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action row */}
        <div className="px-3.5 pb-3.5 flex gap-2">
          <div className="flex-1 bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2 flex items-center gap-2">
            <Lock size={10} className="text-white/20" />
            <span className="text-white/20 text-xs">3 leads bloqueados</span>
          </div>
          <button className="bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-green-500/30">
            <Unlock size={10} />
            Abrir
          </button>
        </div>
      </motion.div>

      {/* Floating: new lead notification */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -top-5 -right-6 bg-white rounded-2xl shadow-2xl border border-neutral-100 px-3.5 py-2.5 flex items-center gap-2.5"
      >
        <div className="w-7 h-7 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <TrendingUp size={13} className="text-green-600" />
        </div>
        <div>
          <p className="text-[10px] text-neutral-400 font-medium leading-none mb-0.5">Esta semana</p>
          <p className="text-sm font-black text-neutral-900 leading-none">+24 leads</p>
        </div>
      </motion.div>

      {/* Floating: new lead alert */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.35, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="absolute -bottom-5 -left-6 bg-[#0c1018] border border-green-500/25 rounded-2xl shadow-2xl px-3.5 py-2.5 flex items-center gap-2.5"
      >
        <div className="w-7 h-7 bg-green-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
          <Phone size={12} className="text-green-400" />
        </div>
        <div>
          <p className="text-[10px] text-white/25 font-medium leading-none mb-0.5">Nuevo lead</p>
          <p className="text-sm font-bold text-white leading-none">Carlos M. — FL</p>
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
    { label: 'Preguntas frecuentes', href: '#faq' },
  ]
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b10]/90 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
            <Unlock size={14} className="text-white" />
          </div>
          <div>
            <span className="font-black text-white text-base tracking-tight block leading-tight">LeadUnlock</span>
            <span className="text-[9px] text-white/30 font-medium tracking-wide uppercase">Seguros · Insurance Leads</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href}
              className="text-white/45 hover:text-white text-sm transition-colors px-3.5 py-2 rounded-lg hover:bg-white/5">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Link to="/login" className="text-white/45 hover:text-white text-sm transition-colors px-4 py-2">
            Iniciar sesión
          </Link>
          <Link to="/register"
            className="bg-green-500 hover:bg-green-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 flex items-center gap-1.5">
            Empezar ahora
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <Link to="/register" className="bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-xl">
            Empezar
          </Link>
          <button onClick={() => setOpen(o => !o)} className="text-white/45 hover:text-white p-2">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-[#070b10] border-t border-white/[0.06] overflow-hidden"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {navLinks.map((l) => (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)}
                  className="text-white/55 hover:text-white py-3 text-sm border-b border-white/[0.05] transition-colors">
                  {l.label}
                </a>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                <Link to="/login" onClick={() => setOpen(false)}
                  className="text-white/55 py-2.5 text-sm text-center border border-white/10 rounded-xl">
                  Iniciar sesión
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}
                  className="bg-green-500 text-white text-sm font-bold py-3 rounded-xl text-center">
                  Activar mi cuenta — $100
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

/* ─── Hero ─── */
function Hero() {
  const pills = ['Final Expense · Medicare · Whole Life', 'Meta Ads incluido', 'Desde $12/lead', '$100 reembolsable']
  return (
    <section className="pt-28 pb-20 md:pt-36 md:pb-32 bg-[#070b10] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_65%_20%,rgba(34,197,94,0.09),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_15%_80%,rgba(59,130,246,0.05),transparent)]" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.028) 1px, transparent 0)',
        backgroundSize: '38px 38px'
      }} />

      <div className="max-w-6xl mx-auto px-5 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center">

          {/* LEFT */}
          <div className="max-w-xl">
            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-semibold px-4 py-2 rounded-full mb-8 tracking-wide">
                <Shield size={12} className="text-green-400" />
                Exclusivo para agentes de seguros en EE.UU.
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1 className="text-[2.6rem] sm:text-5xl lg:text-[3.2rem] xl:text-[3.6rem] font-black tracking-tight leading-[1.04] text-white mb-6">
                Leads a tu ritmo,{' '}
                <span className="text-green-400">sin compromisos</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.18}>
              <p className="text-white/45 text-lg leading-relaxed mb-8">
                Diseñada para agentes independientes de seguros que quieren clientes sin pagar mensualidades ni contratos. Empieza por $100, abre solo los leads que necesitas y crece a tu propio ritmo.
              </p>
            </FadeIn>

            <FadeIn delay={0.26}>
              <div className="flex flex-wrap gap-2 mb-9">
                {pills.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1.5 bg-white/[0.05] border border-white/10 text-white/60 text-xs font-medium px-3.5 py-1.5 rounded-full">
                    <Check size={10} className="text-green-400" />
                    {p}
                  </span>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.34}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5">
                <Link to="/register"
                  className="group flex items-center gap-2.5 bg-green-500 hover:bg-green-400 text-white font-black px-8 py-4 rounded-xl transition-all text-base shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5">
                  Empezar ahora — $100
                  <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="text-white/30 hover:text-white/65 text-sm transition-colors">
                  Ya tengo cuenta →
                </Link>
              </div>
              <p className="text-white/18 text-xs">
                Pago único · Los $100 son reembolsables al llegar a $1,000 en leads comprados
              </p>
            </FadeIn>
          </div>

          {/* RIGHT */}
          <div className="flex justify-center lg:justify-end">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Social proof numbers ─── */
function Stats() {
  const stats = [
    { value: '+10,000', label: 'Leads entregados' },
    { value: '4.2x', label: 'ROI promedio' },
    { value: '$12', label: 'Precio mínimo por lead' },
    { value: '24h', label: 'Campaña lista' },
  ]
  return (
    <section className="bg-[#070b10] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.05] rounded-2xl overflow-hidden border border-white/[0.06]">
          {stats.map(({ value, label }) => (
            <div key={label} className="bg-[#070b10] px-6 py-7 text-center">
              <p className="text-3xl font-black text-white mb-1.5 tracking-tight">{value}</p>
              <p className="text-white/30 text-xs font-medium uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    {
      step: '01', icon: Rocket,
      title: 'Activamos tu campaña',
      desc: 'Diseñamos y lanzamos una campaña de Meta Ads para tu nicho específico. Segmentación, copy y presupuesto — nosotros nos encargamos de todo.',
      circle: 'bg-green-500', iconBg: 'bg-green-50', iconColor: 'text-green-600',
      shadow: 'shadow-green-100',
    },
    {
      step: '02', icon: Lock,
      title: 'Los leads llegan a tu dashboard',
      desc: 'Cada persona que llena el formulario aparece automáticamente. Ves nombre, ciudad e interés antes de decidir si lo abres.',
      circle: 'bg-blue-500', iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
      shadow: 'shadow-blue-100',
    },
    {
      step: '03', icon: Unlock,
      title: 'Abre solo los que te interesan',
      desc: 'Pagas solo por los leads que decides ver. Al desbloquear obtienes teléfono y email completos para contactar de inmediato.',
      circle: 'bg-purple-500', iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
      shadow: 'shadow-purple-100',
    },
  ]

  const strip = [
    { icon: BadgeCheck, label: 'Sin contratos' },
    { icon: DollarSign, label: 'Sin mensualidades' },
    { icon: TrendingUp, label: 'Resultados medibles' },
    { icon: MessageSquare, label: 'Soporte humano' },
  ]

  return (
    <section id="como-funciona" className="bg-white">
      <div className="max-w-6xl mx-auto px-5 pt-20 pb-12 md:pt-28 md:pb-16">
        <FadeIn className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            <Zap size={11} />
            Proceso simple
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 mb-4">
            Así de simple funciona
          </h2>
          <p className="text-neutral-400 text-lg max-w-lg mx-auto">
            Sin configuraciones técnicas ni conocimiento de marketing
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {steps.map((step, i) => (
            <FadeIn key={step.step} delay={i * 0.12}>
              <div className={`bg-white border border-neutral-100 rounded-2xl p-8 h-full hover:shadow-lg ${step.shadow} transition-all duration-300 group relative`}>
                <div className="flex items-center gap-3 mb-7">
                  <div className={`w-9 h-9 ${step.circle} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-black">{step.step}</span>
                  </div>
                  <div className="h-px flex-1 bg-neutral-100 group-hover:bg-neutral-200 transition-colors" />
                </div>
                <div className={`w-12 h-12 ${step.iconBg} rounded-2xl flex items-center justify-center mb-5`}>
                  <step.icon size={22} className={step.iconColor} />
                </div>
                <h3 className="text-neutral-900 font-bold text-lg mb-3 leading-snug">{step.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.36}>
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {strip.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 justify-center">
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

/* ─── Nichos ─── */
function Nichos() {
  const list = [
    { icon: HeartHandshake, label: 'Final Expense' },
    { icon: Activity, label: 'Medicare / Medicaid' },
    { icon: Shield, label: 'Whole Life / UIL' },
    { icon: FileText, label: 'Anualidades' },
    { icon: Car, label: 'Seguros de auto' },
    { icon: Home, label: 'Bienes raíces' },
  ]
  return (
    <section className="bg-white border-t border-neutral-100">
      <div className="max-w-6xl mx-auto px-5 py-14 md:py-20">
        <FadeIn className="text-center mb-10">
          <p className="text-neutral-400 text-sm font-semibold uppercase tracking-widest mb-4">Trabajamos con tu nicho</p>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900">
            Leads para el sector que vendes
          </h2>
        </FadeIn>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {list.map((n, i) => (
            <FadeIn key={n.label} delay={i * 0.07}>
              <div className="flex flex-col items-center gap-3 bg-neutral-50 border border-neutral-100 rounded-2xl p-5 hover:border-green-200 hover:bg-green-50/50 transition-all group">
                <div className="w-10 h-10 bg-white border border-neutral-100 rounded-xl flex items-center justify-center shadow-sm group-hover:border-green-200 group-hover:shadow-green-100 transition-all">
                  <n.icon size={18} className="text-neutral-400 group-hover:text-green-600 transition-colors" />
                </div>
                <span className="text-neutral-600 text-xs font-semibold text-center leading-tight group-hover:text-green-700 transition-colors">{n.label}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Benefits ─── */
function Benefits() {
  const left = [
    {
      icon: BarChart3,
      title: 'Dashboard en tiempo real',
      desc: 'Ve todos tus leads en un solo lugar. Filtra por estado, campaña o fecha. Sin hojas de cálculo ni exportaciones.',
    },
    {
      icon: Shield,
      title: 'Datos protegidos hasta que decidas',
      desc: 'El teléfono y email del lead solo se revelan cuando tú lo desbloqueas. Tu inversión siempre está bajo control.',
    },
  ]
  const right = [
    {
      icon: Users,
      title: 'Seguimiento por lead',
      desc: 'Agrega notas, cambia estados (nuevo, contactado, cerrado) y lleva historial completo de cada contacto.',
    },
    {
      icon: TrendingUp,
      title: 'Métricas que importan',
      desc: 'Cuántos leads llegaron, cuántos abriste, cuánto invertiste y cuál es tu ROI. Todo calculado automáticamente.',
    },
  ]

  return (
    <section id="beneficios" className="py-20 md:py-28 bg-[#070b10]">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — text */}
          <div>
            <FadeIn>
              <span className="inline-block bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                Plataforma
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                Todo lo que necesitas para gestionar tus leads
              </h2>
              <p className="text-white/40 text-base leading-relaxed mb-10">
                Un CRM ligero diseñado para agentes de seguros y servicios financieros. Simple, rápido y sin curva de aprendizaje.
              </p>
            </FadeIn>

            <div className="space-y-4">
              {left.map((f, i) => (
                <FadeIn key={f.title} delay={i * 0.12}>
                  <div className="flex gap-4 p-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-white/[0.05] transition-colors group">
                    <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <f.icon size={17} className="text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
                      <p className="text-white/35 text-xs leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Right — cards */}
          <div className="space-y-4">
            {right.map((f, i) => (
              <FadeIn key={f.title} delay={0.2 + i * 0.12}>
                <div className="flex gap-4 p-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:bg-white/[0.05] transition-colors">
                  <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <f.icon size={17} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
                    <p className="text-white/35 text-xs leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}

            {/* Highlight card */}
            <FadeIn delay={0.44}>
              <div className="p-5 bg-green-500/[0.07] border border-green-500/25 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star size={17} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-green-300 font-semibold text-sm mb-1">Crédito de fidelidad</h3>
                    <p className="text-white/40 text-xs leading-relaxed">
                      Al comprar $1,000 en leads, te devolvemos $100 de crédito. Tu inversión inicial es 100% reembolsable.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Pricing ─── */
function Pricing() {
  const items = [
    'Campaña de Meta Ads personalizada para tu nicho',
    'Los leads llegan solos a tu dashboard',
    'Ve nombre, ciudad e interés antes de abrir',
    'Teléfono y email completos al desbloquear',
    'Notas y seguimiento por lead',
    'Sin mensualidades — solo pagas lo que abres',
    '$100 de crédito al llegar a $1,000 en leads',
    'Soporte directo con el equipo',
  ]
  return (
    <section id="precios" className="py-20 md:py-28 bg-[#070b10] border-t border-white/[0.06]">
      <div className="max-w-lg mx-auto px-5">
        <FadeIn className="text-center mb-12">
          <span className="inline-block bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            Precio
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Un solo plan. Sin letra pequeña.
          </h2>
          <p className="text-white/35 text-base">Sin suscripción mensual — pagas solo por lo que abres</p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="relative rounded-2xl overflow-hidden border border-green-500/25 bg-[#0c1018]">
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
            {/* BG glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-green-500/[0.06] blur-2xl rounded-full pointer-events-none" />

            <div className="relative p-7">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full mb-3 tracking-wide">
                    ✦ ÚNICO PLAN
                  </div>
                  <h3 className="text-xl font-black text-white">LeadUnlock</h3>
                </div>
                <div className="text-right">
                  <p className="text-white/25 text-xs mb-0.5">Activación</p>
                  <p className="text-4xl font-black text-white leading-none">$100</p>
                  <p className="text-green-400 text-xs font-semibold mt-1">reembolsable</p>
                </div>
              </div>

              <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
                <DollarSign size={15} className="text-green-400 flex-shrink-0" />
                <p className="text-white/55 text-xs leading-relaxed">
                  Luego pagas solo por los leads que abres —{' '}
                  <span className="text-white font-semibold">desde $12 por lead</span>
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {items.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-white/55 text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <Link to="/register"
                className="group flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-black py-4 rounded-xl transition-all text-sm shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5 mb-3">
                Activar mi cuenta — $100
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-center text-white/20 text-xs">
                Sin suscripción mensual · Cancela cuando quieras
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── FAQ ─── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className={`text-sm font-semibold transition-colors ${open ? 'text-green-600' : 'text-neutral-800 group-hover:text-neutral-900'}`}>
          {q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown size={18} className={`transition-colors ${open ? 'text-green-500' : 'text-neutral-300'}`} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="text-neutral-500 text-sm leading-relaxed pb-5">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FAQ() {
  const faqs = [
    {
      q: '¿Cuánto cuesta abrir un lead?',
      a: 'El precio mínimo es $12 por lead. Dependiendo del nicho y la campaña puede variar. Siempre verás el precio antes de decidir si lo abres — nunca hay sorpresas.',
    },
    {
      q: '¿Los $100 de activación son reembolsables?',
      a: 'Sí. Cuando hayas comprado $1,000 acumulados en leads, los $100 de activación regresan a tu cuenta como crédito. Es una muestra de que estamos comprometidos con tu éxito.',
    },
    {
      q: '¿Qué tan rápido empieza a llegar leads?',
      a: 'En 24 horas activamos tu campaña de Meta Ads. Los primeros leads suelen llegar dentro de los primeros 2-3 días. El volumen aumenta a medida que la campaña se optimiza.',
    },
    {
      q: '¿Necesito saber de marketing o Meta Ads?',
      a: 'No. Nosotros creamos, lanzamos y optimizamos la campaña por ti. Solo necesitas decinos tu nicho y zona geográfica. Tú recibes los leads, nosotros manejamos la tecnología.',
    },
    {
      q: '¿Qué información tiene cada lead?',
      a: 'Antes de abrir ves: nombre, ciudad y producto de interés. Al desbloquear obtienes: número de teléfono, email y cualquier información extra que hayan completado en el formulario.',
    },
    {
      q: '¿Puedo pausar o cancelar cuando quiera?',
      a: 'Sí. No hay contratos ni mensualidades obligatorias. Puedes pausar tu campaña en cualquier momento contactando al equipo. Tu crédito acumulado nunca expira.',
    },
    {
      q: '¿Para qué nichos trabajan?',
      a: 'Final Expense, Medicare/Medicaid, Whole Life, UIL, Anualidades, Seguros de auto y Bienes raíces. Si tienes otro nicho, contáctanos — trabajamos con la mayoría de sectores financieros y de seguros.',
    },
  ]
  return (
    <section id="faq" className="bg-white border-t border-neutral-100">
      <div className="max-w-3xl mx-auto px-5 py-20 md:py-28">
        <FadeIn className="text-center mb-14">
          <span className="inline-block bg-green-100 text-green-700 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
            Preguntas frecuentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 mb-3">
            Todo lo que necesitas saber
          </h2>
          <p className="text-neutral-400 text-base">
            ¿Tienes más dudas? Escríbenos por WhatsApp o email.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-white border border-neutral-100 rounded-2xl px-6 shadow-sm">
            {faqs.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── CTA ─── */
function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#070b10] border-t border-white/[0.06]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_110%,rgba(34,197,94,0.1),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_-10%,rgba(34,197,94,0.04),transparent)]" />

      <div className="max-w-3xl mx-auto px-5 py-24 md:py-32 text-center relative">
        <FadeIn>
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Empieza hoy
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 leading-tight">
            ¿Listo para recibir leads de calidad?
          </h2>
          <p className="text-white/40 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Activa tu cuenta con $100, nosotros creamos tu campaña, y los leads empiezan a llegar solos a tu dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register"
              className="group flex items-center gap-2.5 bg-green-500 hover:bg-green-400 text-white font-black px-10 py-4 rounded-xl transition-all text-base shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 w-full sm:w-auto justify-center">
              Activar mi cuenta — $100
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="text-white/35 hover:text-white/65 text-sm transition-colors">
              Ya tengo cuenta →
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            {['Sin contrato', 'Sin mensualidad', '$100 reembolsable', 'Soporte real'].map((t) => (
              <div key={t} className="flex items-center gap-2 text-white/25 text-xs">
                <CheckCircle size={12} className="text-green-500/60" />
                {t}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

/* ─── Footer ─── */
function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-[#050810] border-t border-white/[0.05]">
      <div className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
                <Unlock size={14} className="text-white" />
              </div>
              <span className="font-black text-white text-base tracking-tight">LeadUnlock</span>
            </div>
            <p className="text-white/25 text-sm leading-relaxed max-w-xs">
              La forma más directa de conseguir leads de calidad para agentes de seguros y servicios financieros en EE.UU.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Plataforma</p>
            <div className="space-y-2.5">
              {[
                { label: 'Cómo funciona', href: '#como-funciona' },
                { label: 'Beneficios', href: '#beneficios' },
                { label: 'Precios', href: '#precios' },
                { label: 'Preguntas frecuentes', href: '#faq' },
              ].map((l) => (
                <a key={l.label} href={l.href} className="block text-white/25 hover:text-white/60 text-sm transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Legal</p>
            <div className="space-y-2.5">
              <Link to="/privacy" className="block text-white/25 hover:text-white/60 text-sm transition-colors">
                Política de privacidad
              </Link>
              <a href="#" className="block text-white/25 hover:text-white/60 text-sm transition-colors">
                Términos de servicio
              </a>
              <Link to="/login" className="block text-white/25 hover:text-white/60 text-sm transition-colors">
                Iniciar sesión
              </Link>
              <Link to="/register" className="block text-white/25 hover:text-white/60 text-sm transition-colors">
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/18 text-xs">© {year} LeadUnlock. Todos los derechos reservados.</p>
          <p className="text-white/18 text-xs">Hecho para agentes que cierran más.</p>
        </div>
      </div>
    </footer>
  )
}

/* ─── Page ─── */
export default function Landing() {
  return (
    <div className="min-h-screen bg-[#070b10]">
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <Nichos />
      <Benefits />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
