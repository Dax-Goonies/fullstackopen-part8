const mongoose = require('mongoose')
require('dotenv').config()

const connectToDatabase = async (uri) => {
  console.log('connecting to database URI:', uri)

  try {
    await mongoose.connect(uri)
    console.log('connected to MongoDB')
  } catch (error) {
    console.log('error connecting to MongoDB:', error.message)
    process.exit(1)
  }
}

module.exports = connectToDatabase