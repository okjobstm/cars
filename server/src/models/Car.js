import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  make: {
    type: String,
    required: [true, 'Car make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Car year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  price: {
    type: Number,
    required: [true, 'Car price is required'],
    min: [0, 'Price cannot be negative']
  },
  mileage: {
    type: Number,
    required: [true, 'Car mileage is required'],
    min: [0, 'Mileage cannot be negative']
  },
  color: {
    type: String,
    required: [true, 'Car color is required'],
    trim: true
  },
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'CNG']
  },
  transmission: {
    type: String,
    required: [true, 'Transmission type is required'],
    enum: ['Manual', 'Automatic', 'CVT', 'Semi-Automatic']
  },
  engineSize: {
    type: String,
    required: [true, 'Engine size is required']
  },
  bodyType: {
    type: String,
    required: [true, 'Body type is required'],
    enum: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Pickup', 'Van']
  },
  doors: {
    type: Number,
    required: [true, 'Number of doors is required'],
    min: [2, 'Car must have at least 2 doors'],
    max: [5, 'Car cannot have more than 5 doors']
  },
  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [2, 'Car must have at least 2 seats'],
    max: [9, 'Car cannot have more than 9 seats']
  },
  images: [{
    type: String,
    required: [true, 'At least one car image is required']
  }],
  description: {
    type: String,
    required: [true, 'Car description is required'],
    minlength: [20, 'Description must be at least 20 characters']
  },
  features: [{
    type: String,
    trim: true
  }],
  condition: {
    type: String,
    required: [true, 'Car condition is required'],
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
    required: [true, 'Car location is required']
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required']
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
