import { Link } from '@tanstack/react-router'

import { useState } from 'react'
import {
  Home,
  Menu,
  Radio,
  Truck,
  Users,
  X,
} from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [groupedExpanded, setGroupedExpanded] = useState<
    Record<string, boolean>
  >({})

  return (
    <>
      <header className="px-4 py-3 flex items-center bg-zinc-900 border-b border-zinc-800 text-white">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="ml-3 flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-100">
              Cebu Metro Logistics
            </h1>
            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
              B2B Delivery
            </p>
          </div>
        </Link>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-zinc-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-zinc-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">Cebu Metro</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          <p className="px-3 py-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Main
          </p>
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors mb-1 text-sm"
            activeProps={{
              className:
                'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors mb-1 text-sm',
            }}
          >
            <Home size={18} />
            <span className="font-medium">Home</span>
          </Link>

          <Link
            to="/dispatcher"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors mb-1 text-sm"
            activeProps={{
              className:
                'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors mb-1 text-sm',
            }}
          >
            <Radio size={18} />
            <span className="font-medium">Dispatcher</span>
          </Link>

          <Link
            to="/riders"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors mb-1 text-sm"
            activeProps={{
              className:
                'flex items-center gap-3 px-3 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 transition-colors mb-1 text-sm',
            }}
          >
            <Users size={18} />
            <span className="font-medium">Riders</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>System Online</span>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
