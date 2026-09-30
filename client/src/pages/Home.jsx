import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import axios from 'axios'
import CarCard from '../components/CarCard'

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState([])

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await axios.get('/api/cars?limit=3')
        setFeaturedCars(res.data.cars)
      } catch (err) {
        console.error(err)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section - Immersive */}
      <section className="relative h-[calc(100vh-2rem)] w-[calc(100%-2rem)] mx-auto mt-4 rounded-3xl overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop"
            alt="Arrière-plan principal"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-black/30" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-6">
              Roulez <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">Extraordinaire.</span>
            </h1>
            <p className="text-xl text-zinc-300 mb-8 max-w-xl leading-relaxed">
              Une collection d'ingénierie automobile, la plus prestigieuse au monde.
              Trouvez votre véhicule idéal dès aujourd'hui.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/cars" className="btn-primary flex items-center gap-2">
                Parcourir la collection
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link to="/register" className="btn-outline bg-black/20 backdrop-blur-sm border-white/20 text-white hover:bg-white hover:text-black">
                Devenir membre
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Arrivés en vedette</h2>
            <p className="text-zinc-500">Les nouveautés de notre showroom.</p>
          </div>
          <Link to="/cars" className="hidden md:flex items-center gap-2 btn-outline bg-black/20 backdrop-blur-sm border-white/20 text-white hover:bg-white hover:text-black">
            Voir tout le stock <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCars.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link to="/cars" className="btn-outline inline-flex items-center gap-2">
            Voir tout le stock <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Value Proposition - Clean Grid */}
      <section className="py-24 bg-zinc-900 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Excellence vérifiée</h3>
              <p className="text-zinc-400 leading-relaxed">
                Chaque véhicule de notre stock passe une inspection rigoureuse de 150 points garantissant un état irréprochable et une perfection mécanique.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Service premium</h3>
              <p className="text-zinc-400 leading-relaxed">
                De l'essai à la livraison, profitez de notre service de conciergerie sur-mesure qui respecte votre temps et vos préférences.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Sourcing international</h3>
              <p className="text-zinc-400 leading-relaxed">
                Nous sillonnons le monde pour trouver des configurations rares et des éditions limitées introuvables ailleurs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
