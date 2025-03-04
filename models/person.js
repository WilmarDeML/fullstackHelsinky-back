const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

mongoose.connect(url)

  .then(result => {
    console.log(`connected to MongoDB, version ${result.version}`)
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: [3, 'name must be at least 3 characters'],
    required: [true, 'name is required'] },
  number: {
    type: String,
    minlength: [8, 'phone number must be at least 8 digits'],
    validate: {
      validator: function(v) {
        return /\d{2,3}-\d+/.test(v)
      },
      message: props => {
        return `${props.path} format must be XX-YYYY..., where 'XX' is 2-3 digits, and 'YYYY...' is one or more digits!`
      }
    },
    required: [true, 'phone number is required']
  }
})

personSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Person', personSchema)