const app = require("./main");
const connectdb = require("./database/db");

connectdb();

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`server is listening at port no ${PORT}...`);
});