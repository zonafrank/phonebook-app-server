const mongoose = require("mongoose");

const url = `mongodb+srv://echezona:FantasyTvigt1974@cluster0.xhujs.mongodb.net/phonebook-app?retryWrites=true&w=majority`;
mongoose
  .connect(url)
  .then(() => {
    console.log("connected to MongoDB database");
  })
  .catch((error) => {
    console.error("Error connecting to database");
    console.error(error.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Person = mongoose.model("Person", personSchema);

module.exports = Person;
