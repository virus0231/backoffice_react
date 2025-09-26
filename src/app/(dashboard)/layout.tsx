import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='dashboard-container'>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className='dashboard-main'>
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className='dashboard-content'>
          {children}
        </main>
      </div>
    </div>
  );
}