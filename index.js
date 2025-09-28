require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { todo } = require("./db");
const { createTodo, updateTodo } = require("./types");
const { success } = require("zod");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/todo", async (req, res) => {
  const parsed = createTodo.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ msg: "Invalid input", errors: parsed.error.issues });
  }

  try {
    const newTodo = await todo.create({
      title: parsed.data.title,
      description: parsed.data.description,
      completed: false,
    });
    res.status(201).json({ msg: "Todo created", data: newTodo });
  } catch (err) {
    res.status(500).json({ msg: "Database error", error: err.message });
  }
});

// Get all todos
app.get("/todos", async (_req, res) => {
  try {
    const todos = await todo.find({});
    res.json({ todos });
  } catch (err) {
    res.status(500).json({ msg: "Database error", error: err.message });
  }
});


app.get("/todo/:id", async function(req,res){
  try{
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
        success: false,
        msg: "Invalid Id format",
    });
}

    const todo1 = await todo.findById(id);
    res.status(200).json({
      success: true,
      msg: "Todo Found",
      todo1,
    })
  }

  catch(err){
    console.error(err);
    res.status(500).json({
      msg: "Server Error",
    })
  }

})

// Mark a todo as completed
app.put("/completed", async (req, res) => {
  const parsed = updateTodo.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ msg: "Invalid input", errors: parsed.error.issues });
  }

  try {
    const updated = await todo.findByIdAndUpdate(
      parsed.data.id,
      {title: parsed.data.title,
      description :parsed.data.description,
       completed: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ msg: "Todo not found" });
    res.json({ msg: "Todo marked successfully", data: updated });
  } catch (err) {
    res.status(500).json({ msg: "Database error", error: err.message });
  }
});


app.delete("/todo/delete", async function(req,res){
  const {id} = req.body;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
        success: false,
        msg: "Invalid Id format",
    });
  }

  const deleted = await todo.findByIdAndDelete(id);

  if(!deleted){
    return res.status(404).json({
      success: false,
      msg: "Todo not found",
    });
  }
  res.status(200).json({
    success: true,
    msg: "Todo deleted",
  })

})

// app.delete("/todo/delete/:id", async function(req, res) {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({
//       success: false,
//       msg: "Invalid Id format",
//     });
//   }

//   const deleted = await todo.findByIdAndDelete(id);

//   if (!deleted) {
//     return res.status(404).json({
//       success: false,
//       msg: "Todo not found",
//     });
//   }

//   res.status(200).json({
//     success: true,
//     msg: "Todo deleted",
//   });
// });


app.listen(3000, () => console.log("Server running on port 3000"));

