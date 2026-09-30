import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import {
  MapPinIcon,
  CalendarIcon,
  ChartBarIcon,
  BeakerIcon,
  CogIcon,
  StarIcon,
  ArrowLeftIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  PhoneIcon,
  EnvelopeIcon,
  TruckIcon
} from '@heroicons/react/24/outline'

const CarDetail = () => {
  const { id } = useParams()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    fetchCarDetails()
    window.scrollTo(0, 0)
  }, [id])

  const fetchCarDetails = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/cars/${id}`)
      setCar(response.data)
    } catch (error) {
      setError('Failed to load car details')
      console.error('Error fetching car details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500"></div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <ShieldCheckIcon className="w-10 h-10 text-slate-500" />
        </div>
        <p className="text-xl text-slate-300 mb-6">{error || 'Vehicle not found'}</p>
        <Link to="/cars" className="btn-primary">
          Return to Inventory
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Navigation & Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <Link
            to="/cars"
            className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Inventory</span>
          </Link>
          <h1 className="heading-xl text-3xl md:text-5xl">
            {car.make} <span className="text-slate-400 font-normal">{car.model}</span>
          </h1>
          <div className="flex items-center gap-2 mt-2 text-slate-400">
            <MapPinIcon className="w-4 h-4 text-blue-500" />
            <span>{car.location}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ₹{car.price.toLocaleString()}
          </div>
          {car.condition === 'Excellent' && (
            <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm mt-2 border border-emerald-500/20">
              <CheckBadgeIcon className="w-4 h-4" />
              <span>Certified Excellent Condition</span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-2 rounded-2xl overflow-hidden"
          >
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-800 relative group">
              {car.images && car.images.length > 0 ? (
                <img
                  src={car.images[currentImageIndex]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/1200x800/1e293b/94a3b8?text=No+Image';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  No Image Available
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {car.images && car.images.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
                {car.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Specifications Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: CalendarIcon, label: 'Year', value: car.year },
              { icon: ChartBarIcon, label: 'Mileage', value: `${car.mileage.toLocaleString()} mi` },
              { icon: BeakerIcon, label: 'Fuel', value: car.fuelType },
              { icon: CogIcon, label: 'Transmission', value: car.transmission },
              { icon: TruckIcon, label: 'Body', value: car.bodyType },
              { icon: ShieldCheckIcon, label: 'Condition', value: car.condition },
            ].map((spec, i) => (
              <div key={i} className="glass-card p-4 flex flex-col items-center justify-center text-center group hover:bg-slate-800/60 transition-colors">
                <spec.icon className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-slate-400 text-xs uppercase tracking-wider mb-1">{spec.label}</span>
                <span className="text-slate-200 font-semibold">{spec.value}</span>
              </div>
            ))}
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8"
          >
            <h2 className="heading-lg mb-6 text-2xl">Vehicle Overview</h2>
            <p className="text-slate-300 leading-relaxed text-lg">
              {car.description}
            </p>
          </motion.div>

          {/* Features */}
          {car.features && car.features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-8"
            >
              <h2 className="heading-lg mb-6 text-2xl">Premium Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {car.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <StarIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-slate-300 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 sticky top-24"
          >
            <h3 className="heading-lg text-xl mb-6">Interested in this vehicle?</h3>

            <div className="space-y-4">
              <button className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg">
                <EnvelopeIcon className="w-5 h-5" />
                Inquire Now
              </button>

              <button className="w-full py-4 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2 font-medium">
                <PhoneIcon className="w-5 h-5" />
                Schedule Test Drive
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://ui-avatars.com/api/?name=Premium+Motors&background=3b82f6&color=fff"
                  alt="Dealer"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="font-bold text-white">Premium Motors</h4>
                  <p className="text-slate-400 text-sm">Verified Dealer</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-400">
                <p>✓ 150-Point Inspection</p>
                <p>✓ 12-Month Warranty</p>
                <p>✓ Financing Available</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default CarDetail
