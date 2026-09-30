import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline';

const initialCarForm = {
  make: '',
  model: '',
  year: '',
  price: '',
  mileage: '',
  color: '',
  fuelType: 'Petrol',
  transmission: 'Automatic',
  engineSize: '',
  bodyType: 'Sedan',
  doors: 4,
  seats: 5,
  description: '',
  features: '',
  condition: 'Excellent',
  location: '',
  contactNumber: ''
};

export default function AddCarModal({ open, onClose, onCreated }) {
  const [carForm, setCarForm] = useState(initialCarForm);
  const [carImages, setCarImages] = useState([]);
  const [carSubmitting, setCarSubmitting] = useState(false);
  const [carError, setCarError] = useState('');
  const [carSuccess, setCarSuccess] = useState('');

  const resetAndClose = () => {
    setCarForm(initialCarForm);
    setCarImages([]);
    setCarError('');
    setCarSuccess('');
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarError('');
    setCarSuccess('');

    if (!carImages.length) {
      setCarError('Please select at least one image.');
      return;
    }

    const required = ['make', 'model', 'year', 'price', 'mileage', 'color', 'engineSize', 'description', 'location', 'contactNumber'];
    for (const field of required) {
      if (!carForm[field]) {
        setCarError(`Field ${field} is required.`);
        return;
      }
    }

    try {
      setCarSubmitting(true);
      const fd = new FormData();
      Object.entries(carForm).forEach(([k, v]) => {
        if (k === 'features') {
          v.split(',').map(s => s.trim()).filter(Boolean).forEach(f => fd.append('features', f));
        } else {
          fd.append(k, v);
        }
      });
      carImages.forEach(img => fd.append('images', img));

      const res = await axios.post('/api/cars', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      if (res.data?._id) {
        setCarSuccess('Car created successfully.');
        onCreated?.(res.data);
        setTimeout(() => { resetAndClose(); }, 1000);
      }
    } catch (err) {
      setCarError(err.response?.data?.message || 'Failed to create car');
    } finally {
      setCarSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl glass-card max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="heading-md mb-0">Add New Vehicle</h3>
                <p className="text-sm text-zinc-400">Fill in the details to create a new key listing</p>
              </div>
              <button
                onClick={resetAndClose}
                className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
              {carError && (
                <div className="mb-6 p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 text-sm font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {carError}
                </div>
              )}
              {carSuccess && (
                <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 text-sm font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {carSuccess}
                </div>
              )}

              <form id="add-car-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Basic Info */}
                <div className="space-y-6">
                  <div className="pb-2 border-b border-white/5">
                    <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Vehicle Details</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Make</label>
                      <input className="input-field" value={carForm.make} onChange={e => setCarForm({ ...carForm, make: e.target.value })} placeholder="Toyota" required />
                    </div>
                    <div>
                      <label className="label">Model</label>
                      <input className="input-field" value={carForm.model} onChange={e => setCarForm({ ...carForm, model: e.target.value })} placeholder="Camry" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Year</label>
                      <input type="number" className="input-field" value={carForm.year} onChange={e => setCarForm({ ...carForm, year: e.target.value })} placeholder="2023" required />
                    </div>
                    <div>
                      <label className="label">Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-zinc-500">₹</span>
                        <input type="number" className="input-field pl-8" value={carForm.price} onChange={e => setCarForm({ ...carForm, price: e.target.value })} placeholder="2500000" required />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Mileage (km)</label>
                      <input type="number" className="input-field" value={carForm.mileage} onChange={e => setCarForm({ ...carForm, mileage: e.target.value })} placeholder="15000" required />
                    </div>
                    <div>
                      <label className="label">Color</label>
                      <input className="input-field" value={carForm.color} onChange={e => setCarForm({ ...carForm, color: e.target.value })} placeholder="Midnight Black" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Fuel Type</label>
                      <div className="relative">
                        <select className="input-field appearance-none" value={carForm.fuelType} onChange={e => setCarForm({ ...carForm, fuelType: e.target.value })}>
                          {['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'CNG'].map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="label">Transmission</label>
                      <div className="relative">
                        <select className="input-field appearance-none" value={carForm.transmission} onChange={e => setCarForm({ ...carForm, transmission: e.target.value })}>
                          {['Manual', 'Automatic', 'CVT', 'Semi-Automatic'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Body Type</label>
                      <div className="relative">
                        <select className="input-field appearance-none" value={carForm.bodyType} onChange={e => setCarForm({ ...carForm, bodyType: e.target.value })}>
                          {['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Pickup', 'Van'].map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="label">Condition</label>
                      <div className="relative">
                        <select className="input-field appearance-none" value={carForm.condition} onChange={e => setCarForm({ ...carForm, condition: e.target.value })}>
                          {['Excellent', 'Good', 'Fair', 'Poor'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Engine Size</label>
                    <input className="input-field" value={carForm.engineSize} onChange={e => setCarForm({ ...carForm, engineSize: e.target.value })} placeholder="2.5L 4-Cylinder" required />
                  </div>
                </div>

                {/* Right Column: Additional Info & Images */}
                <div className="space-y-6">
                  <div className="pb-2 border-b border-white/5">
                    <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Specs & Images</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Doors</label>
                      <input type="number" className="input-field" value={carForm.doors} onChange={e => setCarForm({ ...carForm, doors: e.target.value })} required />
                    </div>
                    <div>
                      <label className="label">Seats</label>
                      <input type="number" className="input-field" value={carForm.seats} onChange={e => setCarForm({ ...carForm, seats: e.target.value })} required />
                    </div>
                  </div>

                  <div>
                    <label className="label">Location</label>
                    <input className="input-field" value={carForm.location} onChange={e => setCarForm({ ...carForm, location: e.target.value })} placeholder="Mumbai, MH" required />
                  </div>

                  <div>
                    <label className="label">Contact Number</label>
                    <input className="input-field" value={carForm.contactNumber} onChange={e => setCarForm({ ...carForm, contactNumber: e.target.value })} placeholder="+91 98765 43210" required />
                  </div>

                  <div>
                    <label className="label">Features</label>
                    <input className="input-field" value={carForm.features} onChange={e => setCarForm({ ...carForm, features: e.target.value })} placeholder="Bluetooth, Sunroof, Backup Camera (comma separated)" />
                  </div>

                  <div>
                    <label className="label">Description</label>
                    <textarea className="input-field min-h-[100px]" value={carForm.description} onChange={e => setCarForm({ ...carForm, description: e.target.value })} placeholder="Detailed description of the vehicle..." required />
                  </div>

                  <div>
                    <label className="label mb-3">Images (Max 5)</label>
                    <div className="border border-dashed border-zinc-700 bg-zinc-900/30 rounded-2xl p-6 hover:bg-zinc-800/50 hover:border-zinc-500 transition-all text-center cursor-pointer relative group">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => setCarImages(Array.from(e.target.files).slice(0, 5))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <PhotoIcon className="w-10 h-10 text-zinc-600 mx-auto mb-3 group-hover:scale-110 group-hover:text-zinc-400 transition-all" />
                      <p className="text-sm text-zinc-400">Click to upload or drag and drop</p>
                      <p className="text-xs text-zinc-600 mt-1">SVG, PNG, JPG or GIF</p>
                    </div>

                    {carImages.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {carImages.map((f, i) => (
                          <div key={i} className="bg-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-zinc-700">
                            <span className="text-xs text-zinc-300 truncate max-w-[150px]">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-zinc-900/50 flex justify-end gap-3 z-10">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-6 py-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors font-medium border border-transparent hover:border-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-car-form"
                disabled={carSubmitting}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {carSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>Create Listing</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
