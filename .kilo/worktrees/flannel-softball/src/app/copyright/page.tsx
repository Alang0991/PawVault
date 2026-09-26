import Link from "next/link"

export default function CopyrightPage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Copyright / DMCA</h1>
        <div className="prose dark:prose-invert">
          <p>PawVault respects intellectual property rights. If you believe your copyrighted work has been infringed, please submit a DMCA notice.</p>
          <p>To submit a DMCA notice, please contact us with the following information:</p>
          <ul>
            <li>Description of the copyrighted work</li>
            <li>URL of the infringing content</li>
            <li>Your contact information</li>
            <li>Statement of good faith</li>
          </ul>
          <p>
            <Link href="/" className="text-blue-600 hover:underline">Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
