import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Админ-панель — Sibercone',
}

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">{children}</div>
    </div>
  )
}
