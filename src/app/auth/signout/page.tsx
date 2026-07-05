import Link from "next/link"

export default function SignOutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-blue-100 p-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white/90 p-10 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold mb-4">Signed out</h1>
        <p className="text-sm text-muted-foreground mb-6">
          You have been signed out successfully. Come back anytime.
        </p>
        <div className="flex justify-end gap-3">
          <Link href="/auth/signin" className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100">
            Sign in again
          </Link>
          <Link href="/" className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
