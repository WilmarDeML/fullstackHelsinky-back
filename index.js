const express = require('express');
const app = express();
const PORT = 3001

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
  res.json(persons);
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});