import Car from '../models/Car.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';

const handleError = (res, error) => {
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(e => e.message).join(', ');
    return res.status(400).json({ message });
  }
  console.error(error);
  return res.status(500).json({ message: 'Server error' });
};

const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  // Extract public_id from URL
  const match = url.match(/\/upload\/[^\/]+\/([^\/]+(?:\/[^\/]+)*)/);
  if (match) {
    // Remove file extension and return public_id
    return match[1].replace(/\.[^/.]+$/, '');
  }
  return null;
};


const deleteImagesFromCloudinary = async (imageUrls) => {
  if (!imageUrls || !Array.isArray(imageUrls)) return;

  for (const imageUrl of imageUrls) {
    try {
      const publicId = extractPublicIdFromUrl(imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted image from Cloudinary: ${publicId}`);
      }
    } catch (error) {
      console.error(`Error deleting image from Cloudinary: ${error.message}`);
    }
  }
};


export const getCars = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 5, 100);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.color) {
      filter.color = { $regex: req.query.color, $options: 'i' };
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseInt(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseInt(req.query.maxPrice);
    }

    if (req.query.make) {
      filter.make = { $regex: req.query.make, $options: 'i' };
    }

    if (req.query.fuelType) {
      filter.fuelType = req.query.fuelType;
    }

    if (req.query.bodyType) {
      filter.bodyType = req.query.bodyType;
    }

    if (req.query.condition) {
      filter.condition = req.query.condition;
    }

    // Get total count for pagination
    const total = await Car.countDocuments(filter);

    // Get cars with pagination
    const cars = await Car.find(filter)
      .populate('seller', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      cars,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCars: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};


export const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('seller', 'username email');

    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};

export const createCar = async (req, res) => {
  try {

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      // Upload each image to Cloudinary
      for (const file of req.files) {
        const cloudinaryResponse = await uploadOnCloudinary(file.path);
        if (cloudinaryResponse && (cloudinaryResponse.url || cloudinaryResponse.secure_url)) {
          const imageUrl = cloudinaryResponse.secure_url || cloudinaryResponse.url;
          imageUrls.push(imageUrl);
        }
      }
    }

    // Check if at least one image was uploaded successfully
    if (imageUrls.length === 0) {
      return res.status(400).json({ message: 'At least one car image is required' });
    }

    const car = new Car({
      ...req.body,
      seller: req.user._id,
      images: imageUrls
    });

    const createdCar = await car.save();
    res.status(201).json(createdCar);
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};


export const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (car) {
      // Check if user is the seller or admin
      if (car.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to update this car' });
      }

      // Handle new image uploads
      let newImageUrls = [];
      if (req.files && req.files.length > 0) {
        // Upload each new image to Cloudinary
        for (const file of req.files) {
          const cloudinaryResponse = await uploadOnCloudinary(file.path);
          if (cloudinaryResponse && (cloudinaryResponse.url || cloudinaryResponse.secure_url)) {
            const imageUrl = cloudinaryResponse.secure_url || cloudinaryResponse.url;
            newImageUrls.push(imageUrl);
          }
        }
      }

      const updateData = { ...req.body };

      if (newImageUrls.length > 0) {
        // If req.body.images is provided, use that; otherwise, append new images to existing ones
        if (req.body.images && Array.isArray(req.body.images)) {
          updateData.images = [...req.body.images, ...newImageUrls];
        } else {
          updateData.images = [...car.images, ...newImageUrls];
        }
      }

      const updatedCar = await Car.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.json(updatedCar);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};


export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (car) {
      // Check if user is the seller or admin
      if (car.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to delete this car' });
      }

      // Delete images from Cloudinary before deleting the car
      if (car.images && car.images.length > 0) {
        await deleteImagesFromCloudinary(car.images);
      }

      await car.deleteOne();
      res.json({ message: 'Car removed' });
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};

export const getFeaturedCars = async (req, res) => {
  try {
    const featuredCars = await Car.find({ isFeatured: true })
      .populate('seller', 'username email')
      .limit(6);

    // Ensure we always return an array
    res.json(featuredCars || []);
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};

export const searchCars = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    if (q.length > 100) {
      return res.status(400).json({ message: 'Search query too long (max 100 characters)' });
    }

    const searchRegex = { $regex: q, $options: 'i' };

    const cars = await Car.find({
      $or: [
        { make: searchRegex },
        { model: searchRegex },
        { description: searchRegex },
        { features: searchRegex },
        { color: searchRegex },
      ]
    }).populate('seller', 'username email');

    res.json(cars);
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};


export const removeCarImages = async (req, res) => {
  try {
    const { imageUrls } = req.body; // Array of image URLs to remove

    if (!imageUrls || !Array.isArray(imageUrls)) {
      return res.status(400).json({ message: 'Image URLs array is required' });
    }

    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to modify this car' });
    }

    // Filter out the images to be removed
    const remainingImages = car.images.filter(img => !imageUrls.includes(img));

    // Check if at least one image remains
    if (remainingImages.length === 0) {
      return res.status(400).json({ message: 'At least one car image is required' });
    }

    // Delete removed images from Cloudinary
    await deleteImagesFromCloudinary(imageUrls);

    // Update the car with remaining images
    car.images = remainingImages;
    await car.save();

    res.json({
      message: 'Images removed successfully',
      remainingImages: car.images
    });
  } catch (error) {
    console.error(error);
    return handleError(res, error);
  }
};
