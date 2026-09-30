import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { UserIcon, CameraIcon } from '@heroicons/react/24/outline'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [formData, setFormData] = useState({ username: '', email: '', profilePicture: null })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [previewImage, setPreviewImage] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username || '', email: user.email || '', profilePicture: null })
      if (user.profilePicture) setPreviewImage(user.profilePicture)
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }))
      const reader = new FileReader()
      reader.onload = () => setPreviewImage(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('username', formData.username)
      formDataToSend.append('email', formData.email)
      if (formData.profilePicture) formDataToSend.append('profilePicture', formData.profilePicture)
      const result = await updateProfile(formDataToSend)
      setMessage(result.success ? 'Profil mis à jour avec succès !' : result.message || 'Échec de la mise à jour du profil')
    } catch {
      setMessage('Une erreur est survenue lors de la mise à jour du profil')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-300">Connectez-vous pour voir votre profil.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Profil</h1>
        <p className="text-gray-400 mt-2">Gérez les informations de votre compte</p>
      </div>

      {/* Profile Picture */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 mx-auto">
            {previewImage ? (
              <img src={previewImage} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UserIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-2 rounded-full cursor-pointer hover:from-blue-600 hover:to-indigo-700 transition-all">
            <CameraIcon className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-lg ${message.includes('succès')
              ? 'bg-green-900 border border-green-600 text-green-300'
              : 'bg-red-900 border border-red-600 text-red-300'
            }`}>
            {message}
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
            Nom d'utilisateur
          </label>
          <input
            id="username" name="username" type="text" required
            value={formData.username} onChange={handleChange}
            className="input-field" placeholder="Votre nom d'utilisateur"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Adresse e-mail
          </label>
          <input
            id="email" name="email" type="email" required
            value={formData.email} onChange={handleChange}
            className="input-field" placeholder="Votre adresse e-mail"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
            Role
          </label>
          <div
            id="role"
            className="input-field opacity-60 cursor-not-allowed capitalize"
            style={{ userSelect: 'none' }}
          >
            {user.role || 'user'}
          </div>
          <p className="text-sm text-gray-500 mt-1">Le role ne peut pas etre modifie</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Mise a jour...' : 'Mettre a jour'}
        </button>
      </form>

      {/* Account Info */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Informations du compte</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Membre depuis :</span>
            <span className="text-gray-200">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Derniere mise a jour :</span>
            <span className="text-gray-200">
              {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR') : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
