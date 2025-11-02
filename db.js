// db.js (or models/todo.js)
const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
}, { timestamps: true });

const Todo = mongoose.model("Todo", todoSchema); // model name: Todo

module.exports = { Todo };
