import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import AddCarModal from '../components/AddCarModal'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  TruckIcon,
  EyeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'


const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('cars')
  const [cars, setCars] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddCar, setShowAddCar] = useState(false)
  const [editingCar, setEditingCar] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [carsRes, usersRes] = await Promise.all([
        axios.get('/api/cars?limit=100'),
        axios.get('/api/users')
      ])
      setCars(carsRes.data.cars)
      setUsers(usersRes.data.users ?? usersRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCar = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await axios.delete(`/api/cars/${carId}`)
        fetchData()
      } catch (error) {
        console.error('Error deleting car:', error)
      }
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${userId}`)
        fetchData()
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const stats = [
    { label: 'Total Cars', value: cars.length, icon: TruckIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Users', value: users.length, icon: UserGroupIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Total Value', value: `₹${(cars.reduce((acc, car) => acc + car.price, 0) / 10000000).toFixed(1)}Cr`, icon: CurrencyDollarIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-lg">Admin Dashboard</h1>
          <p className="text-slate-400">Manage your inventory and users</p>
        </div>
        <button
          onClick={() => setShowAddCar(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add New Car</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 flex items-center"
          >
            <div className={`p-4 rounded-xl mr-4 ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-700/50">
        {['cars', 'users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <span className="capitalize flex items-center gap-2">
              {tab === 'cars' ? <TruckIcon className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
              {tab}
            </span>
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500"></div>
            </div>
          ) : activeTab === 'cars' ? (
            <div className="glass-card overflow-hidden rounded-3xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-800/30">
                      <th className="p-4 pl-6 text-slate-400 font-medium text-sm">Car</th>
                      <th className="p-4 text-slate-400 font-medium text-sm">Price</th>
                      <th className="p-4 text-slate-400 font-medium text-sm">Year</th>
                      <th className="p-4 text-slate-400 font-medium text-sm">Condition</th>
                      <th className="p-4 pr-6 text-slate-400 font-medium text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {cars.map((car) => (
                      <tr key={car._id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                              {car.images?.[0] ? (
                                <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <TruckIcon className="w-6 h-6 text-slate-600 m-3" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-200">{car.make} {car.model}</div>
                              <div className="text-sm text-slate-500">{car.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300">₹{car.price.toLocaleString()}</td>
                        <td className="p-4 text-slate-300">{car.year}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${car.condition === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            car.condition === 'Good' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                            {car.condition}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                // Add edit logic here or in modal
                                alert("Edit functionality to be implemented fully with modal")
                              }}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCar(car._id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="glass-card overflow-hidden rounded-3xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-800/30">
                      <th className="p-4 pl-6 text-slate-400 font-medium text-sm">User</th>
                      <th className="p-4 text-slate-400 font-medium text-sm">Email</th>
                      <th className="p-4 text-slate-400 font-medium text-sm">Role</th>
                      <th className="p-4 pr-6 text-slate-400 font-medium text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex-shrink-0">
                              {user.profilePicture ? (
                                <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <UserIcon className="w-5 h-5 text-slate-500 m-2.5" />
                              )}
                            </div>
                            <div className="font-medium text-slate-200">{user.username}</div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-300">{user.email}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${user.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={user.role === 'admin'}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AddCarModal open={showAddCar} onClose={() => setShowAddCar(false)} onCreated={() => fetchData()} />
    </div>
  )
}

export default AdminPanel
