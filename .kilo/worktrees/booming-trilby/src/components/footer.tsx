import Link from "next/link"
import { Github, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-surface/60">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-pink-500 via-violet-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-bold text-text-primary">PawVault</span>
            </Link>
            <p className="text-sm text-text-secondary max-w-xs">
              A creator marketplace for digital products. Buy and sell VRChat
              assets, 3D models, tools, and more.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-text-primary mb-3">
              Marketplace
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/browse"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Browse
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/creators"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Creators
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?free=true"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Free products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-text-primary mb-3">
              Creators
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/creator/dashboard"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Creator dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/store/create"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Create a store
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Help center
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-text-primary mb-3">
              Community
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/feedback"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Feedback
                </Link>
              </li>
              <li>
                <Link
                  href="/roadmap"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Roadmap
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Changelog
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-text-primary mb-3">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  Refunds
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} PawVault
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <Youtube className="h-4 w-4" />
            </Link>
            <Link
              href="#"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
