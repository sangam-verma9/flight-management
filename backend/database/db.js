const mongoose = require("mongoose");
const connectdb = () => {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("db connect successfully..");
    })
    .catch((err) => {
      console.log(err);
    });
};
module.exports = connectdb;