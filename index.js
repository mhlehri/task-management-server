const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// credentials
const user = process.env.DB_USER;
const pass = process.env.DB_PASS;

const taskSchema = new mongoose.Schema({
  title: String,
  deadline: String,
  priority: String,
  description: String,
  email: String,
  category: { type: String, default: "todo" },
});
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  img: String,
});
const Tasks = mongoose.model("Tasks", taskSchema);
const Users = mongoose.model("Users", userSchema);

// DB connect
mongoose.connect(
  `mongodb+srv://${user}:${pass}@cluster0.yynznjj.mongodb.net/` +
    "TaskDB?retryWrites=true&w=majority"
);

// api
const run = async () => {
  try {
    app.post("/addTask", async (req, res) => {
      const task = req.body;
      const TaskDoc = new Tasks(task);
      const result = await TaskDoc.save();
      // console.log(result);
      res.send(result);
    });
    // get tasks
    app.get("/tasks", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const result = await Tasks.find({ email });
      res.send(result);
      console.log(result);
    });

    try {
      app.post("/addUser", async (req, res) => {
        const user = req.body;
        const userEmail = user.email;
        const find = await Users.findOne({ email: userEmail });
        if (find) {
          return;
        }
        const userDoc = new Users(user);
        const result = await userDoc.save();
        res.send(result);
      });
    } catch (error) {
      return console.log(error);
    }

    app.put("/updateTask", async (req, res) => {
      const email = req.query.email;
      const tasks = req.body;
      console.log("e,", email);
      console.log("updated", tasks);
      const update = {
        $set: {
          category: tasks.category,
        },
      };
      const doc = await Tasks.findOneAndUpdate({ _id: tasks._id }, update);
      res.send(doc);
    });
  } catch (error) {
    console.log(error.message);
  }
};

run().catch((error) => {
  console.log(error.message);
});

app.get("/", function (req, res) {
  res.send("task-management is working...");
});

// listening
app.listen(port, () => {
  console.log("listening on port" + port);
});
