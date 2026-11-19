import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="text-8xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          404
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Page Not Found
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-200 max-w-md">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold btn-hover hover:shadow-lg"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
