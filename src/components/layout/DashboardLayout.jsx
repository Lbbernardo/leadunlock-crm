import Sidebar from './Sidebar'

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#070b10] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
