import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, TrendingUp, Shield, Zap, Users, Star } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <div className="absolute inset-0 bg-grid-slate-200/[0.05] dark:bg-grid-slate-800/[0.05]" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <Badge className="gradient-bg text-white border-none animate-pulse-slow">
              <Sparkles className="h-3 w-3 mr-1" />
              New: Creator Program Live
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="gradient-text">Discover Amazing</span>
              <br />
              <span className="text-gray-900 dark:text-white">Digital Products</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The premier marketplace for creators. Buy and sell 3D models, textures, plugins, and more from talented artists worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-bg text-white hover:opacity-90 transition-all hover:scale-105">
                Start Exploring
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                Become a Creator
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: "4s" }} />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose PawVault?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Built for creators, by creators. We provide everything you need to succeed in the digital marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Industry-standard encryption and secure payment processing for every transaction.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:-translate-y-1 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Instant Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get immediate access to your purchases with our lightning-fast download system.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:-translate-y-1 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Creator Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Comprehensive tools and analytics to help creators grow their business.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all hover:-translate-y-1 group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Growing Community</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join thousands of creators and buyers in our thriving marketplace ecosystem.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">10K+</div>
              <div className="text-white/80">Active Creators</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">50K+</div>
              <div className="text-white/80">Digital Products</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">1M+</div>
              <div className="text-white/80">Downloads</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">4.9</div>
              <div className="text-white/80 flex items-center justify-center gap-1">
                Average Rating
                <Star className="h-4 w-4 fill-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Join thousands of creators and buyers already using PawVault. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-bg text-white hover:opacity-90 transition-all">
                Create Free Account
              </Button>
              <Button size="lg" variant="outline" className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
