import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">KhaledAun Admin</h1>
              <div className="flex space-x-4">
                <Link href="/cms/hero-titles" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Hero Titles
                </Link>
                <Link href="/cms/experiences" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Experiences
                </Link>
                <Link href="/cms/hero-media" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Hero Media
                </Link>
                <Link href="/posts" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Posts
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/" className="text-blue-600 hover:text-blue-900 text-sm">
                View Site →
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}