import './ui/global.css';
import { lusitana } from './ui/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={lusitana.className}>
      <body>
        <div className="min-h-screen flex flex-col bg-gray-50">
          {/* <header className="border-b bg-white">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <Link href="/" className="text-lg font-bold text-gray-900">
                Midtrans Payment API
              </Link>
              <nav className="flex items-center gap-4">
                <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                  Home
                </Link>
                <Link
                  href="/login"
                  className="rounded bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-400"
                >
                  Dashboard
                </Link>
              </nav>
            </div>
          </header> */}

          <main className="flex-grow">
            {children}
          </main>

          <footer className="border-t bg-white">
            <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-600 sm:px-6 lg:px-8">
              © {new Date().getFullYear()} @wikosac — Flutter Midtrans Integration Project
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
