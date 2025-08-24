import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

// Load env variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Sample data
const users = [
  {
    name: 'Admin',
    email: 'admin@cici.com',
    password: bcrypt.hashSync('password', 10),
    isAdmin: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
];

const products = [
  {
    name: 'Risol Mayo',
    description: 'Risoles renyah berisi mayones krim, sayuran, dan abon ayam yang lezat.',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    category: 'snacks',
    price: 15000,
    inStock: 25,
    isFeatured: true,
  },
  {
    name: 'Lontong Sayur',
    description: 'Lontong dengan kuah sayur santan dan telur rebus yang gurih.',
    image: 'https://images.pexels.com/photos/5737241/pexels-photo-5737241.jpeg',
    category: 'rice-dishes',
    price: 25000,
    inStock: 15,
    isFeatured: true,
  },
  {
    name: 'Onde-Onde',
    description: 'Bola ketan berisi kacang hijau manis dan ditaburi wijen.',
    image: 'https://images.pexels.com/photos/7474372/pexels-photo-7474372.jpeg',
    category: 'desserts',
    price: 12000,
    inStock: 30,
    isFeatured: false,
  },
  {
    name: 'Kue Cucur',
    description: 'Kue tradisional Indonesia dari gula merah dan tepung beras.',
    image: 'https://images.pexels.com/photos/6210959/pexels-photo-6210959.jpeg',
    category: 'desserts',
    price: 10000,
    inStock: 20,
    isFeatured: false,
  },
  {
    name: 'Bakwan Jagung',
    description: 'Gorengan jagung renyah dengan sayuran dan bumbu rempah.',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    category: 'snacks',
    price: 8000,
    inStock: 35,
    isFeatured: true,
  },
  {
    name: 'Es Cendol',
    description: 'Minuman es tradisional dengan cendol hijau dan santan.',
    image: 'https://images.pexels.com/photos/4397298/pexels-photo-4397298.jpeg',
    category: 'drinks',
    price: 18000,
    inStock: 12,
    isFeatured: true,
  },
  {
    name: 'Klepon',
    description: 'Kue tradisional berisi gula merah dan kelapa parut.',
    image: 'https://images.pexels.com/photos/7474372/pexels-photo-7474372.jpeg',
    category: 'desserts',
    price: 10000,
    inStock: 40,
    isFeatured: true,
  },
  {
    name: 'Gado-Gado',
    description: 'Salad sayuran Indonesia dengan bumbu kacang yang khas.',
    image: 'https://images.pexels.com/photos/5737241/pexels-photo-5737241.jpeg',
    category: 'rice-dishes',
    price: 20000,
    inStock: 18,
    isFeatured: false,
  },
];

// Import data
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();

    // Insert users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Insert products
    await Product.insertMany(products);

    console.log('Data berhasil diimpor!'.green);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red);
    process.exit(1);
  }
};

// Delete all data
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();

    console.log('Data berhasil dihapus!'.red);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red);
    process.exit(1);
  }
};

// Run script based on command line arg
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}