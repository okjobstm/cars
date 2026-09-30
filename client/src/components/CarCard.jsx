import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HeartIcon, BoltIcon, CalendarIcon } from '@heroicons/react/24/outline'

const CarCard = ({ car }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="group bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-700 hover:shadow-2xl transition-all"
        >
            {/* Image Banner */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    src={car.images[0] || 'https://via.placeholder.com/400x300'}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                    <button className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white hover:text-black transition-colors">
                        <HeartIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="px-3 py-1 text-xs font-semibold bg-white text-black rounded-full uppercase tracking-wider">
                        {car.condition}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                            {car.make} {car.model}
                        </h3>
                        <p className="text-zinc-500 text-sm">{car.year} • {car.transmission}</p>
                    </div>
                    <p className="text-xl font-bold text-white">
                        ₹{(car.price / 100000).toFixed(1)}L
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <BoltIcon className="w-4 h-4" />
                        <span>{car.fuelType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{car.mileage.toLocaleString()} km</span>
                    </div>
                </div>

                <Link
                    to={`/cars/${car._id}`}
                    className="block w-full py-3 text-center rounded-xl border border-zinc-700 text-zinc-300 font-medium hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                >
                    View Details
                </Link>
            </div>
        </motion.div>
    )
}

export default CarCard
