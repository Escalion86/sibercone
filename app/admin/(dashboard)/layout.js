import AdminDashboardShell from '@/components/admin/AdminDashboardShell'

export const metadata = {
  title: 'Админ-панель — Sibercone',
}

export default function AdminLayout({ children }) {
  return <AdminDashboardShell>{children}</AdminDashboardShell>
}
