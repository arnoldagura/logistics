import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Radio,
  MapPin,
  Truck,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  Package,
  Route as RouteIcon,
  Building2,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-emerald-500/3 rounded-full blur-3xl" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative">
        {/* Navigation */}
        <nav className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-zinc-950 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-zinc-100">
                    Cebu Metro Logistics
                  </h1>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    B2B Delivery Network
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  System Online
                </span>
                <Link
                  to="/dispatcher"
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  <Radio className="h-4 w-4" />
                  Dispatch Center
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Content */}
              <div className="space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-medium text-cyan-400">
                    Now serving Metro Cebu
                  </span>
                </div>

                {/* Headline */}
                <div className="space-y-4">
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
                    <span className="text-zinc-100">B2B Deliveries</span>
                    <br />
                    <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                      Across Cebu Metro
                    </span>
                  </h2>
                  <p className="text-lg text-zinc-400 max-w-lg leading-relaxed">
                    Fast, reliable logistics connecting businesses in Cebu City,
                    Mandaue, and Lapu-Lapu. Real-time tracking, competitive pricing,
                    and a network of verified riders.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to="/dispatcher"
                    className="group flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-all hover:shadow-xl hover:shadow-cyan-500/30"
                  >
                    Open Dispatcher
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <button className="flex items-center gap-2 px-6 py-3 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-zinc-100 font-medium rounded-lg transition-all hover:bg-zinc-800/50">
                    Get Quote
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-zinc-500">Verified Riders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-zinc-500">Same-Day Delivery</span>
                  </div>
                </div>
              </div>

              {/* Right - Stats Terminal */}
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-transparent to-violet-500/20 rounded-2xl blur-xl opacity-50" />

                <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm overflow-hidden">
                  {/* Terminal header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/50">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                    </div>
                    <span className="text-xs font-mono text-zinc-500 ml-2">
                      network_status.sh
                    </span>
                  </div>

                  {/* Terminal content */}
                  <div className="p-6 space-y-6">
                    {/* Live stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <StatBlock
                        label="Active Zones"
                        value="3"
                        subtext="Metro Cebu"
                        color="cyan"
                      />
                      <StatBlock
                        label="Fleet Size"
                        value="50+"
                        subtext="Verified Riders"
                        color="emerald"
                      />
                      <StatBlock
                        label="Avg. Delivery"
                        value="45"
                        subtext="Minutes"
                        color="violet"
                      />
                      <StatBlock
                        label="Uptime"
                        value="99.9"
                        subtext="% Reliability"
                        color="amber"
                      />
                    </div>

                    {/* Zone status */}
                    <div className="space-y-2">
                      <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                        Zone Coverage
                      </p>
                      <div className="space-y-2">
                        <ZoneRow name="Cebu City" status="operational" areas="Ayala, IT Park, SM City" />
                        <ZoneRow name="Mandaue" status="operational" areas="Parkmall, Pacific Mall" />
                        <ZoneRow name="Lapu-Lapu" status="operational" areas="Mactan, JCentre Mall" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-zinc-800/50">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
                Platform Capabilities
              </p>
              <h3 className="text-3xl sm:text-4xl font-bold text-zinc-100">
                Built for Business Logistics
              </h3>
            </div>

            {/* Feature grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={<MapPin className="h-6 w-6" />}
                title="Real-Time Tracking"
                description="Monitor every delivery with live GPS updates. Know exactly where your packages are at all times."
                accentColor="cyan"
              />
              <FeatureCard
                icon={<RouteIcon className="h-6 w-6" />}
                title="Zone Coverage"
                description="Comprehensive coverage across Cebu City, Mandaue, and Lapu-Lapu with optimized routing."
                accentColor="violet"
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Express Delivery"
                description="Priority handling for urgent shipments. Get your packages delivered within hours, not days."
                accentColor="amber"
              />
              <FeatureCard
                icon={<Package className="h-6 w-6" />}
                title="Competitive Pricing"
                description="Transparent, distance-based pricing in PHP. No hidden fees, just fair rates for your business."
                accentColor="emerald"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-12 overflow-hidden">
              {/* Background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

              <div className="relative space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800/50">
                  <Building2 className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm text-zinc-400">For Business Partners</span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-bold text-zinc-100">
                  Ready to streamline your deliveries?
                </h3>
                <p className="text-zinc-400 max-w-2xl mx-auto">
                  Access our dispatcher dashboard to manage deliveries, assign riders,
                  and track shipments in real-time across Metro Cebu.
                </p>

                <Link
                  to="/dispatcher"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold rounded-lg transition-all hover:shadow-xl hover:shadow-cyan-500/30"
                >
                  <Radio className="h-5 w-5" />
                  Launch Dispatcher
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800/50 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-zinc-800 flex items-center justify-center">
                <Truck className="h-4 w-4 text-cyan-400" />
              </div>
              <span className="text-sm text-zinc-500">
                Cebu Metro Logistics
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-zinc-600">
              <span>Cebu City</span>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span>Mandaue</span>
              <span className="h-1 w-1 rounded-full bg-zinc-700" />
              <span>Lapu-Lapu</span>
            </div>
            <p className="text-xs text-zinc-600 font-mono">
              v1.0.0 • TanStack Start
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

// Stat Block Component
function StatBlock({
  label,
  value,
  subtext,
  color
}: {
  label: string
  value: string
  subtext: string
  color: 'cyan' | 'emerald' | 'violet' | 'amber'
}) {
  const colorClasses = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    violet: 'text-violet-400',
    amber: 'text-amber-400',
  }

  return (
    <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
      <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={cn('text-3xl font-bold font-mono tracking-tight', colorClasses[color])}>
        {value}
      </p>
      <p className="text-xs text-zinc-500 mt-1">{subtext}</p>
    </div>
  )
}

// Zone Row Component
function ZoneRow({
  name,
  status,
  areas
}: {
  name: string
  status: 'operational' | 'limited' | 'offline'
  areas: string
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
      <div className="flex items-center gap-3">
        <span className={cn(
          'h-2 w-2 rounded-full',
          status === 'operational' && 'bg-emerald-400',
          status === 'limited' && 'bg-amber-400',
          status === 'offline' && 'bg-zinc-600'
        )} />
        <span className="text-sm font-medium text-zinc-200">{name}</span>
      </div>
      <span className="text-xs text-zinc-500">{areas}</span>
    </div>
  )
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  accentColor,
}: {
  icon: React.ReactNode
  title: string
  description: string
  accentColor: 'cyan' | 'violet' | 'amber' | 'emerald'
}) {
  const colorClasses = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/40',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20 group-hover:border-violet-500/40',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40',
  }

  const glowClasses = {
    cyan: 'group-hover:shadow-cyan-500/10',
    violet: 'group-hover:shadow-violet-500/10',
    amber: 'group-hover:shadow-amber-500/10',
    emerald: 'group-hover:shadow-emerald-500/10',
  }

  return (
    <div className={cn(
      'group p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 transition-all duration-300',
      'hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-xl',
      glowClasses[accentColor]
    )}>
      <div className={cn(
        'h-12 w-12 rounded-lg border flex items-center justify-center mb-4 transition-colors',
        colorClasses[accentColor]
      )}>
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-zinc-100 mb-2">{title}</h4>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  )
}
