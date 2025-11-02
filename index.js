
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const { todo } = require("./db");
const { createTodo, updateTodo } = require("./types");

const app = express();
app.use(cors());
app.use(express.json());

// Swagger definition (OpenAPI)
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Todo API",
    version: "1.0.0",
    description: "Simple Todo API with Express and MongoDB",
  },
  servers: [
    {
      url: process.env.BASE_URL || "http://localhost:3000",
    },
  ],
  components: {
    schemas: {
      Todo: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          completed: { type: "boolean" },
        },
      },
      CreateTodo: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
      },
      UpdateTodo: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/todo": {
      post: {
        summary: "Create a todo",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateTodo" } },
          },
        },
        responses: {
          "201": { description: "Created" },
          "400": { description: "Invalid input" },
        },
      },
    },
    "/todos": {
      get: {
        summary: "Get all todos",
        responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "object" } } } } },
      },
    },
    "/todo/{id}": {
      get: {
        summary: "Get todo by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK" }, "400": { description: "Invalid id" }, "404": { description: "Not found" } },
      },
    },
    "/completed": {
      put: {
        summary: "Mark a todo completed",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateTodo" } } },
        },
      },
    },
    "/todo/delete": {
      delete: {
        summary: "Delete a todo (by id in body)",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] } } } },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: [], // no external JSDoc scanning; definitions provided inline above
};

const swaggerSpec = swaggerJsdoc(options);
// Enable the interactive explorer and serve the Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Redirect root to the API docs to make it easy for clients to open the UI
app.get("/", (_req, res) => res.redirect("/api-docs"));

// Routes
app.post("/todo", async (req, res) => {
  const parsed = createTodo.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ msg: "Invalid input", errors: parsed.error.issues });
  }

  try {
    const newTodo = await todo.create({ title: parsed.data.title, description: parsed.data.description, completed: false });
    res.status(201).json({ msg: "Todo created", data: newTodo });
  } catch (err) {
    res.status(500).json({ msg: "Database error", error: err.message });
  }
});

app.get("/todos", async (_req, res) => {
  try {
    const todos = await todo.find({});
    res.json({ todos });
  } catch (err) {
    res.status(500).json({ msg: "Database error", error: err.message });
  }
});

app.get("/todo/:id", async function (req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, msg: "Invalid Id format" });
    }

    const todo1 = await todo.findById(id);
    if (!todo1) return res.status(404).json({ success: false, msg: "Todo not found" });
    res.status(200).json({ success: true, msg: "Todo Found", todo1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

app.put("/completed", async (req, res) => {
  const parsed = updateTodo.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ msg: "Invalid input", errors: parsed.error.issues });
  }

  try {
    const updated = await todo.findByIdAndUpdate(parsed.data.id, { title: parsed.data.title, description: parsed.data.description, completed: true }, { new: true });
    if (!updated) return res.status(404).json({ msg: "Todo not found" });
    res.json({ msg: "Todo marked successfully", data: updated });
  } catch (err) {
    res.status(500).json({ msg: "Database error", error: err.message });
  }
});

app.delete("/todo/delete", async function (req, res) {
  const { id } = req.body;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, msg: "Invalid Id format" });
  }

  const deleted = await todo.findByIdAndDelete(id);

  if (!deleted) {
    return res.status(404).json({ success: false, msg: "Todo not found" });
  }
  res.status(200).json({ success: true, msg: "Todo deleted" });
});

// Connect to MongoDB (if MONGO_URI provided) and start server
const PORT = process.env.PORT || 3000;
const start = async () => {
  const mongoUri = process.env.MONGO_URI;
 try {
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
} catch (err) {
  console.error("MongoDB connection error:", err.message);
  // If DB is required, exit process
  // process.exit(1);
}


  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();

