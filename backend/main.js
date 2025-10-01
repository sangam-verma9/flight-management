const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();


// const ticket = require("./routes/ticketRoute");
const user = require("./routes/userRoute");
// const movie = require("./routes/movieRoute");

// app.use("/api/v1", ticket);
app.use("/api/v1", user);
// app.use("/api/v1", movie);


module.exports = app;