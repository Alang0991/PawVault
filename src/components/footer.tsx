import Link from "next/link"
import { Github, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-bold">Pawvault</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              A creator marketplace for digital products. Buy and sell VRChat assets, 3D models, tools, and more.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Marketplace</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/browse" className="text-muted-foreground hover:text-foreground transition-colors">Browse</Link></li>
              <li><Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">Categories</Link></li>
              <li><Link href="/creators" className="text-muted-foreground hover:text-foreground transition-colors">Creators</Link></li>
              <li><Link href="/browse?free=true" className="text-muted-foreground hover:text-foreground transition-colors">Free products</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Creators</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/creator/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Creator dashboard</Link></li>
              <li><Link href="/store/create" className="text-muted-foreground hover:text-foreground transition-colors">Create a store</Link></li>
              <li><Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">Help center</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link href="/refund-policy" className="text-muted-foreground hover:text-foreground transition-colors">Refunds</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Pawvault</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="h-4 w-4" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Instagram className="h-4 w-4" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Youtube className="h-4 w-4" /></Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
