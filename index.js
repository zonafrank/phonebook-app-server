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

app.use(express.static("build"));

app.get("/info", async (request, response, next) => {
  try {
    const persons = await Person.find({});

    response.send(
      `<p>Phonebook has info for ${
        persons.length
      } people.</p><p>${new Date()}</p>`
    );
  } catch (error) {
    next(error);
  }
});

app.get("/api/persons", async (request, response, next) => {
  try {
    const persons = await Person.find({});
    response.json(persons);
  } catch (error) {
    next(error);
  }
});

app.get("/api/persons/:id", async (request, response, next) => {
  try {
    const id = request.params.id;
    const dbResponse = await Person.findById(id);

    if (dbResponse) {
      return response.json(dbResponse);
    }
    response.status(404).end();
  } catch (error) {
    next(error);
  }
});

app.put("/api/persons/:id", async (request, response, next) => {
  try {
    const id = request.params.id;
    const body = request.body;
    const updatedPerson = await Person.findByIdAndUpdate(
      id,
      {
        name: body.name,
        number: body.number,
      },
      { new: true, runValidators: true, context: "query" }
    );

    if (updatedPerson) {
      return response.json(updatedPerson);
    }
    response.status(404).end();
  } catch (error) {
    next(error);
  }
});

app.delete("/api/persons/:id", async (request, response, next) => {
  try {
    const id = request.params.id;
    await Person.findByIdAndRemove(id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.post("/api/persons", async (request, response, next) => {
  try {
    const { body } = request;

    if (!(body.name && body.number)) {
      return response
        .status(400)
        .json({ error: "You must provide a name and phone number" });
    }

    const foundPerson = await Person.find({ name: body.name });

    if (foundPerson.length) {
      return response.status(400).send({
        error: `Name must be unique. ${body.name} already exists in the database.`,
      });
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    });

    const savedPerson = await person.save();
    response.json(savedPerson);
  } catch (error) {
    next(error);
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "manformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
