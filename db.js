const mongoose = require("mongoose"); 

mongoose.connect("mongodb+srv://ashishbadki03_db_user:tlaIyKBCmtBzBYwI@todo-cluster.vhp2fni.mongodb.net/Tododb");
 const todoSchema = mongoose.Schema({ 
    title: String, description: String, completed: Boolean, 
}); 

const todo = mongoose.model('todos',  todoSchema); 

module.exports = { todo, };