require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

app.use(cors());
app.use(express.json());
app.set("json spaces", 2);

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

app.use(express.static("build"));

app.get("/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${
      persons.length
    } people.</p><p>${new Date()}</p>`
  );
});

app.get("/api/persons", async (request, response) => {
  const persons = await Person.find({});
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

app.post("/api/persons", async (request, response) => {
  const { body } = request;

  if (!(body.name && body.number)) {
    return response
      .status(400)
      .json({ error: "You must provide a name and phone number" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  const savedPerson = await person.save();
  response.json(savedPerson);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
