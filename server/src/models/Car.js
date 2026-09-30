import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  make: {
    type: String,
    required: [true, 'La marque est obligatoire'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Le modele est obligatoire'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'L\'annee est obligatoire'],
    min: [1900, 'L\'annee doit etre posterieure a 1900'],
    max: [new Date().getFullYear() + 1, 'L\'annee ne peut pas etre dans le futur']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est obligatoire'],
    min: [0, 'Le prix ne peut pas etre negatif']
  },
  mileage: {
    type: Number,
    required: [true, 'Le kilometrage est obligatoire'],
    min: [0, 'Le kilometrage ne peut pas etre negatif']
  },
  color: {
    type: String,
    required: [true, 'La couleur est obligatoire'],
    trim: true
  },
  fuelType: {
    type: String,
    required: [true, 'Le type de carburant est obligatoire'],
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'CNG']
  },
  transmission: {
    type: String,
    required: [true, 'Le type de boite de vitesses est obligatoire'],
    enum: ['Manual', 'Automatic', 'CVT', 'Semi-Automatic']
  },
  engineSize: {
    type: String,
    required: [true, 'La cylindree est obligatoire']
  },
  bodyType: {
    type: String,
    required: [true, 'La carrosserie est obligatoire'],
    enum: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Pickup', 'Van']
  },
  doors: {
    type: Number,
    required: [true, 'Le nombre de portes est obligatoire'],
    min: [2, 'Le vehicule doit avoir au moins 2 portes'],
    max: [5, 'Le vehicule ne peut pas avoir plus de 5 portes']
  },
  seats: {
    type: Number,
    required: [true, 'Le nombre de places est obligatoire'],
    min: [2, 'Le vehicule doit avoir au moins 2 places'],
    max: [9, 'Le vehicule ne peut pas avoir plus de 9 places']
  },
  images: [{
    type: String,
    required: [true, 'Au moins une image du vehicule est obligatoire']
  }],
  description: {
    type: String,
    required: [true, 'La description du vehicule est obligatoire'],
    minlength: [20, 'La description doit contenir au moins 20 caracteres']
  },
  features: [{
    type: String,
    trim: true
  }],
  condition: {
    type: String,
    required: [true, 'L\'etat du vehicule est obligatoire'],
    enum: ['Excellent', 'Good', 'Fair', 'Poor']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    required: [true, 'La localisation est obligatoire']
  },
  contactNumber: {
    type: String,
    required: [true, 'Le numero de contact est obligatoire']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better search performance
carSchema.index({ make: 1, model: 1, year: 1 });
carSchema.index({ price: 1 });
carSchema.index({ color: 1 });
carSchema.index({ fuelType: 1 });
carSchema.index({ bodyType: 1 });
carSchema.index({ seller: 1 });
carSchema.index({ isAvailable: 1 });
carSchema.index({ isFeatured: 1 });
carSchema.index({ createdAt: -1 });

const Car = mongoose.model('Car', carSchema);

export default Car;
