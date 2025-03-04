const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

require('dotenv').config()
const Person = require('./models/person')

const app = express()
const PORT = process.env.PORT || 3001

const formatWithBody = (tokens, req, res) => {
  const method = tokens.method(req, res)
  const url = tokens.url(req, res)
  const status = tokens.status(req, res)
  const contentLength = tokens.res(req, res, 'content-length') ?? '-'
  const responseTime = tokens['response-time'](req, res)
  const body = method !== 'GET' ? JSON.stringify(req.body ?? '-') : '-'
  return `${method} ${url} ${status} ${contentLength} - ${responseTime}ms ${body}`
}

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(formatWithBody))

app.get('/', (_req, res) => {
  res.send('<h1>Welcome to the phonebook!</h1>')
})

app.get('/info', (_req, res) => {
  Person.countDocuments().then(count => {
    res.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${new Date()}</p>
    `)
  })
})

app.get('/api/persons', (_req, res, next) => {
  Person.find()
    .then(persons => {
      res.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (!person) {
        res.statusMessage = 'Person not found'
        return res.status(404).end()
      }
      res.json(person)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const newPerson = new Person(req.body)

  if (!newPerson.name || !newPerson.number) {
    const message = newPerson.name ? 'Missing number' : 'Missing name'
    return res.status(400).json({ error: message })
  }

  Person.findOne({ name: newPerson.name })
    .then(foundPerson => {
      if (foundPerson) {
        return res.status(400).json({ error: 'Name must be unique' })
      }
      newPerson.save()
        .then(person => {
          res.status(201).json(person)
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {

  const id = req.params.id
  const newPerson = req.body

  if (!newPerson.name || !newPerson.number) {
    const message = newPerson.name ? 'Missing number' : 'Missing name'
    return res.status(400).json({ error: message })
  }

  Person.findByIdAndUpdate(id, newPerson, { new: true, runValidators: true, context: 'query' })
    .then(person => {
      if (!person) {
        res.statusMessage = 'Person not found'
        return res.status(404).end()
      }
      res.json(person)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(person => {
      res.status(204).end()
      console.info('Deleted: ', person)
    })
    .catch(error => next(error))
})

const errorHandler = (error, _request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    const errorMessage = 'Validation failed: '
      .concat(
        Object.keys(error.errors)
          .map(key => error.errors[key].properties.message)
          .join(', ')
      )
    return response.status(400).json({ error: errorMessage })
  }

  next(error)
}

const notFoundHandler = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})