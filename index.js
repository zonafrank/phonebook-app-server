const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.set("json spaces", 2);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const requestLogger = (request, response, next) => {
  console.table(`Method: ${request.method}, Path: ${request.path}`);
  console.log("Body", request.body);
  next();
};

app.use(requestLogger);

const getNextId = () => {
  const currentIds = persons.map((p) => p.id);
  let nextId;

  do {
    nextId = Math.ceil(Math.random() * 1000000);
  } while (currentIds.includes(nextId));

  return nextId;
};

app.get("/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${
      persons.length
    } people.</p><p>${new Date()}</p>`
  );
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const personFound = persons.find((p) => p.id === id);
  if (personFound) {
    return response.json(personFound);
  }
  response.status(404).end();
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);
  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const { body } = request;

  if (!(body.name && body.number)) {
    return response
      .status(400)
      .json({ error: "You must provide a name and phone number" });
  }

  const nameInDb = persons.find(
    (p) => p.name.toLowerCase() === body.name.toLowerCase()
  );
  if (nameInDb) {
    return response.status(400).json({ error: "name must be unique" });
  }

  const personObject = {
    name: body.name,
    number: body.number,
    id: getNextId(),
  };

  persons = persons.concat(personObject);
  response.json(personObject);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = 3003;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
