import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import CarCard from '../components/CarCard'
import Select from '../components/Select'

const CarListing = () => {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    make: '',
    bodyType: '',
    condition: ''
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCars: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [allowOverflow, setAllowOverflow] = useState(false)

  useEffect(() => {
    fetchCars()
  }, [filters, pagination.currentPage])

  useEffect(() => {
    if (!showFilters) setAllowOverflow(false)
  }, [showFilters])

  const fetchCars = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 9,
        ...filters
      })

      const response = await axios.get(`/api/cars?${params}`)
      setCars(response.data.cars)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching cars:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleSelectChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      const response = await axios.get(`/api/cars/search?q=${searchQuery}`)
      setCars(response.data)
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCars: response.data.length,
        hasNextPage: false,
        hasPrevPage: false
      })
    } catch (error) {
      console.error('Error searching cars:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      make: '',
      bodyType: '',
      condition: ''
    })
    setSearchQuery('')
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const goToPage = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Inventory</h1>
          <p className="text-zinc-400">
            Showing {cars.length} of {pagination.totalCars} premium vehicles
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Search collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full sm:w-80 bg-zinc-900 border border-zinc-800 text-white rounded-full py-3 px-5 pl-11 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />

            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  fetchCars()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full border transition-all ${showFilters
              ? 'bg-white text-black border-white'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600 hover:text-white'
              }`}
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 48 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            onAnimationComplete={() => setAllowOverflow(true)}
            className={allowOverflow ? "overflow-visible" : "overflow-hidden"}
          >
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Refine Search</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-zinc-400 hover:text-white transition-colors hover:underline"
                >
                  Reset All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Make</label>
                  <input
                    type="text"
                    name="make"
                    value={filters.make}
                    onChange={handleFilterChange}
                    className="input-field rounded-full"
                    placeholder="e.g. Porsche"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Price Range (₹)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      className="input-field rounded-full"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      className="input-field rounded-full"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Select
                    label="Body Type"
                    value={filters.bodyType}
                    onChange={(val) => handleSelectChange('bodyType', val)}
                    placeholder="All Types"
                    options={[
                      { value: '', label: 'All Types' },
                      { value: 'Sedan', label: 'Sedan' },
                      { value: 'SUV', label: 'SUV' },
                      { value: 'Coupe', label: 'Coupe' },
                      { value: 'Convertible', label: 'Convertible' },
                      { value: 'Sports', label: 'Sports' }
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <Select
                    label="Condition"
                    value={filters.condition}
                    onChange={(val) => handleSelectChange('condition', val)}
                    placeholder="All Conditions"
                    options={[
                      { value: '', label: 'All Conditions' },
                      { value: 'Excellent', label: 'Excellent' },
                      { value: 'Good', label: 'Good' },
                      { value: 'Like New', label: 'Like New' }
                    ]}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-zinc-900 h-[420px] rounded-2xl animate-pulse">
              <div className="h-[280px] bg-zinc-800 rounded-t-2xl" />
              <div className="p-5 space-y-4">
                <div className="h-6 bg-zinc-800 rounded w-3/4" />
                <div className="h-4 bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : cars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center">
          <MagnifyingGlassIcon className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-2">No vehicles found</h3>
          <p className="text-zinc-500">
            Your search did not match any vehicles. Try different keywords or filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-6 text-white hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="p-3 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            <div className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full font-medium text-zinc-300">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>

            <button
              onClick={() => goToPage(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="p-3 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CarListing
