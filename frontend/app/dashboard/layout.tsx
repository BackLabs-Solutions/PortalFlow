import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-mist">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
