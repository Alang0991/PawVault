import Link from "next/link"
import { Github, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-2xl font-bold gradient-text">Pawvault</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The premier marketplace for digital creators. Discover, buy, and sell amazing digital products.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-purple-600 transition-colors">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/browse" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/creators" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Find Creators
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/featured" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Featured
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="text-gray-600 hover:text-purple-600 transition-colors">
                  API Docs
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin */}
          <div>
            <h3 className="font-semibold mb-4">Admin</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/moderation" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Moderation
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-600 hover:text-purple-600 transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/license" className="text-gray-600 hover:text-purple-600 transition-colors">
                  License Agreement
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Pawvault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
