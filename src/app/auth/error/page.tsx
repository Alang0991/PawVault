import Link from "next/link"

interface ErrorPageProps {
  searchParams?: {
    error?: string | null
    message?: string | null
  }
}

export default function AuthErrorPage({ searchParams }: ErrorPageProps) {
  const errorCode = searchParams?.error
  const message = searchParams?.message || errorCode || "An unexpected error occurred."

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white/90 p-10 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold mb-4">Authentication Error</h1>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Link href="/auth/signin" className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100">
            Back to Sign In
          </Link>
          <Link href="/" className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
