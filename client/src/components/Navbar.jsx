import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  UserIcon,
  CogIcon,
  ArrowRightStartOnRectangleIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Browse Cars', path: '/cars', icon: MagnifyingGlassIcon },
  ]

  return (
    <motion.nav
      initial={{ y: -100, x: '-50%', opacity: 0 }}
      animate={{ y: 0, x: '-50%', opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-3 left-1/2 z-50 w-[90%] md:w-auto min-w-[320px] rounded-full border border-zinc-800 bg-zinc-900/90 backdrop-blur-xl shadow-2xl shadow-black/50"
    >
      <div className="px-4 md:px-6">
        <div className="flex h-14 items-center justify-between gap-4 md:gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/carDekho-logo.png"
              alt="CarDekho"
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 rounded-full"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-950/50 rounded-full px-2 py-1 border border-white/5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${location.pathname === link.path
                  ? 'bg-zinc-800 text-white shadow-lg shadow-black/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="p-2 rounded-full text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                      title="Admin Dashboard"
                    >
                      <CogIcon className="h-5 w-5" />
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 pl-1 pr-3 py-1 bg-zinc-800 rounded-full border border-zinc-700 hover:border-zinc-600 transition-colors"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700 text-zinc-300">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-zinc-200">{user.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    title="Logout"
                  >
                    <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-sm font-bold bg-white text-black rounded-full hover:bg-zinc-200 transition-all shadow-lg shadow-white/10"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-full bg-white text-black px-6 py-2.5 text-sm font-bold shadow-lg shadow-white/10 transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white md:hidden"
            >
              <span className="sr-only">Open menu</span>
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-800 bg-slate-900 md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium ${location.pathname === link.path
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Link>
              ))}

              <div className="my-4 h-px bg-slate-800" />

              {user ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium text-slate-500 uppercase">Account</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.username}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-slate-400 hover:bg-slate-800 hover:text-amber-400"
                    >
                      <CogIcon className="h-5 w-5" />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-base font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400"
                  >
                    <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="mt-4 flex flex-col gap-3 px-3">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav >
  )
}

export default Navbar
