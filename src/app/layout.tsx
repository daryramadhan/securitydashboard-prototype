import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'PT. JISS - Security Operations & Personnel Management',
  description: 'Internal Security Operations & Deployment Management Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f6f8fa] text-slate-900 min-h-screen antialiased flex flex-row">
        <AppProvider>
          {/* Sidebar Left */}
          <Sidebar />

          {/* Main Content Area Right */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 w-full">
              {children}
            </main>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
