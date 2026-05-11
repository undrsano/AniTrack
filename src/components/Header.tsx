import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, X, Menu, Tv2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { searchAnime } from '@/lib/anilist'
import { useDebounce } from '@/hooks/useDebounce'
import { useT } from '@/hooks/useT'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useAnimeTitles } from '@/hooks/useAnimeTitle'

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const t = useT()
  const debouncedSearch = useDebounce(searchValue, 350)

  const nav = [
    { to: '/', label: t.nav.home },
    { to: '/catalog', label: t.nav.catalog },
    { to: '/my-lists', label: t.nav.myLists },
    { to: '/recommendations', label: t.nav.recommendations },
  ]

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus()
  }, [searchOpen])

  const { data } = useQuery({
    queryKey: ['header-search', debouncedSearch],
    queryFn: () => searchAnime({ query: debouncedSearch }, 1, 6),
    enabled: debouncedSearch.length >= 2,
  })

  const results = data?.Page.media ?? []
  const getTitle = useAnimeTitles(results)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchValue.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchValue.trim())}`)
      setSearchOpen(false)
      setSearchValue('')
    }
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchValue('')
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-dark shadow-xl shadow-black/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center group-hover:shadow-lg group-hover:shadow-accent/40 transition-shadow">
              <Tv2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              Ani<span className="text-accent">Track</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <Search className="w-5 h-5" />
            </button>
            <LanguageSwitcher />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden pb-4 overflow-hidden"
            >
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                      isActive ? 'text-white bg-white/10' : 'text-white/60 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={closeSearch}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="max-w-2xl mx-auto mt-20 px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  ref={inputRef}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={t.search.placeholder}
                  className="w-full pl-12 pr-12 py-4 rounded-2xl glass-dark text-white placeholder-white/30 text-lg outline-none focus:border-accent/50 border border-white/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>

              {results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 glass-dark rounded-2xl overflow-hidden border border-white/10"
                >
                  {results.map((anime) => (
                    <Link
                      key={anime.id}
                      to={`/anime/${anime.id}`}
                      onClick={closeSearch}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <img
                        src={anime.coverImage.medium}
                        alt=""
                        className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-white truncate">
                          {getTitle(anime)}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {anime.format} · {anime.seasonYear ?? ''}
                        </p>
                      </div>
                      {anime.averageScore && (
                        <span className="ml-auto text-xs font-bold text-emerald-400 flex-shrink-0">
                          {(anime.averageScore / 10).toFixed(1)}
                        </span>
                      )}
                    </Link>
                  ))}
                  <button
                    onClick={handleSubmit as unknown as React.MouseEventHandler}
                    className="w-full px-4 py-3 text-sm text-accent hover:bg-white/5 transition-colors font-medium"
                  >
                    {t.search.showAll}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
