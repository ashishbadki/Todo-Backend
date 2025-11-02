// types.js
const { z } = require("zod");

const createTodo = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

const updateTodo = z.object({
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
});

module.exports = { createTodo, updateTodo };
