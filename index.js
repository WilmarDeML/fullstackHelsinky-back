const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

require('dotenv').config()
const Person = require('./models/person')

const app = express();
const PORT = process.env.PORT || 3001

const persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

const getNewId = () => Math.floor(Math.random() * 100000000);

const formatWithBody = (tokens, req, res) => {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = tokens.status(req, res);
  const contentLength = tokens.res(req, res, 'content-length') ?? '-';
  const responseTime = tokens['response-time'](req, res);
  const body = method !== 'GET' ? JSON.stringify(req.body ?? '-') : '-';
  return `${method} ${url} ${status} ${contentLength} - ${responseTime}ms ${body}`;
};

app.use(cors())
app.use(express.json());
app.use(express.static('dist'))
app.use(morgan(formatWithBody));

app.get('/', (_req, res) => {
  res.send('<h1>Welcome to the phonebook!</h1>');
});

app.get('/info', (_req, res) => {
  res.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  `);
});

app.get('/api/persons', (_req, res) => {
  Person.find().then(persons => {
    res.json(persons);
  })
});

app.get('/api/persons/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const person = persons.find(p => p.id === id);

  if (!person) {
    res.statusMessage = 'Person not found';
    return res.status(404).end();
  }

  res.json(person);
});

app.post('/api/persons', (req, res) => {
  const newPerson = {id: getNewId(), ...req.body};

  if (!newPerson.name || !newPerson.number) {
    const message = newPerson.name ? 'Missing number' : 'Missing name';
    return res.status(400).json({error: message});
  }

  if (persons.find(p => p.name === newPerson.name)) {
    return res.status(400).json({error: 'Name must be unique'});
  }

  persons.push(newPerson);

  res.status(201).json(newPerson);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = persons.findIndex(p => p.id === id);

  if (index > -1) {
    persons.splice(index, 1);
  }

  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});