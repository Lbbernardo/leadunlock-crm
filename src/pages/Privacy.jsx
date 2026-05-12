import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">LeadUnlock</span>
          </Link>
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Privacidad</h1>
        <p className="text-slate-500 text-sm mb-10">Última actualización: 11 de mayo de 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Quiénes somos</h2>
            <p>
              LeadUnlock ("nosotros", "nuestro") es una plataforma de gestión y distribución de leads operada por Luis Baez. Nuestro sitio web es <strong>unlocklead.click</strong>. Esta política explica cómo recopilamos, usamos y protegemos la información de nuestros usuarios y de los contactos (leads) que se gestionan a través de nuestra plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Información que recopilamos</h2>
            <p className="mb-3"><strong>De nuestros clientes (usuarios de la plataforma):</strong></p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600">
              <li>Nombre y dirección de correo electrónico</li>
              <li>Información de pago (procesada de forma segura por Stripe; no almacenamos datos de tarjeta)</li>
              <li>Nombre de la empresa y preferencias de campaña</li>
            </ul>
            <p className="mt-4 mb-3"><strong>De los leads generados a través de formularios de Meta Ads:</strong></p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600">
              <li>Nombre completo</li>
              <li>Número de teléfono</li>
              <li>Correo electrónico</li>
              <li>Ciudad y estado</li>
              <li>Interés en producto o servicio</li>
            </ul>
            <p className="mt-4 text-sm text-slate-500">
              Esta información es proporcionada voluntariamente por el contacto al completar un formulario publicitario en Meta (Facebook/Instagram).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Cómo usamos la información</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Entregar leads a los clientes de LeadUnlock que han pagado por ese servicio</li>
              <li>Gestionar cuentas, facturación y acceso a la plataforma</li>
              <li>Enviar notificaciones relacionadas con la actividad de la cuenta</li>
              <li>Mejorar el funcionamiento y la seguridad de la plataforma</li>
            </ul>
            <p className="mt-4">No vendemos ni compartimos información personal con terceros con fines de marketing.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Integración con Meta (Facebook)</h2>
            <p>
              LeadUnlock se integra con Meta Ads a través de la API oficial de Facebook Lead Ads. Los leads capturados en formularios de Meta se transfieren automáticamente a nuestra plataforma mediante webhooks seguros. Esta transferencia se realiza bajo los términos de uso de la API de Meta y con el consentimiento del usuario al completar el formulario publicitario.
            </p>
            <p className="mt-3">
              No accedemos a información de perfiles de Facebook más allá de los datos del formulario de lead. El acceso a la API de Meta se gestiona mediante tokens de acceso con permisos mínimos necesarios (<code className="bg-slate-100 px-1 rounded text-sm">leads_retrieval</code>, <code className="bg-slate-100 px-1 rounded text-sm">pages_manage_metadata</code>).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Almacenamiento y seguridad</h2>
            <p>
              Los datos se almacenan en Supabase (PostgreSQL) con cifrado en reposo y en tránsito mediante TLS. El acceso a los datos está protegido por políticas de seguridad a nivel de fila (Row Level Security) que garantizan que cada cliente solo acceda a sus propios leads.
            </p>
            <p className="mt-3">
              Los pagos son procesados por Stripe. LeadUnlock no almacena números de tarjeta ni datos bancarios.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Retención de datos</h2>
            <p>
              Los datos de leads se conservan mientras la cuenta del cliente esté activa. Al cancelar la cuenta, los datos pueden ser eliminados a solicitud del titular dentro de los 30 días siguientes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Derechos del usuario</h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 mt-2">
              <li>Acceder a los datos que tenemos sobre ti</li>
              <li>Solicitar la corrección de datos incorrectos</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Retirar tu consentimiento en cualquier momento</li>
            </ul>
            <p className="mt-4">Para ejercer estos derechos, contáctanos en el correo indicado abajo.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Cookies</h2>
            <p>
              LeadUnlock utiliza cookies de sesión estrictamente necesarias para el funcionamiento de la autenticación. No utilizamos cookies de seguimiento ni publicidad de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Cambios a esta política</h2>
            <p>
              Podemos actualizar esta política ocasionalmente. Notificaremos los cambios importantes por correo electrónico a los clientes activos. El uso continuado de la plataforma después de los cambios implica aceptación de la política actualizada.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Contacto</h2>
            <p>Para preguntas sobre esta política de privacidad:</p>
            <div className="mt-3 bg-slate-50 rounded-xl p-4 text-sm">
              <p><strong>LeadUnlock</strong></p>
              <p className="text-slate-600 mt-1">Email: <a href="mailto:luisbaezbernardo@gmail.com" className="text-green-600 hover:underline">luisbaezbernardo@gmail.com</a></p>
              <p className="text-slate-600">Sitio web: <a href="https://unlocklead.click" className="text-green-600 hover:underline">unlocklead.click</a></p>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-16 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} LeadUnlock · <Link to="/privacy" className="hover:text-slate-600">Política de Privacidad</Link>
      </footer>
    </div>
  )
}
