import Link from "next/link"

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Acceptable Use Policy</h1>
        <div className="prose dark:prose-invert">
          <p>Last updated: July 1, 2026</p>
          <p>Furmarket is committed to providing a safe and respectful platform for all users.</p>
          <h2>Prohibited Content</h2>
          <ul>
            <li>Copyrighted material without permission</li>
            <li>Malware or harmful code</li>
            <li>NSFW or illegal content</li>
            <li>Harassment or abuse</li>
            <li>Spam or fraudulent activity</li>
          </ul>
          <p>
            <Link href="/" className="text-blue-600 hover:underline">Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
