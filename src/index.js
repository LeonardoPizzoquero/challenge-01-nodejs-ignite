const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findUser = users.find((user) => user.username === username);

  if (!findUser) {
    return response.status(401).json({ error: 'User not found' });
  }

  request.user = findUser;

  return next();
} 

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const findUsername = users.find((user) => user.username === username);

  if (findUsername) {
    return response.status(400).json({ error: 'Username already exists' });
  }

  const newUser = { 
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = { 
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo); 
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const findTodoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (findTodoIndex === -1) {
    return response.status(404).json({ error: 'Todo do not exists' });
  }

  user.todos[findTodoIndex] = { 
    ...user.todos[findTodoIndex], 
    title, 
    deadline 
  };

  return response.status(200).send(user.todos[findTodoIndex])
}); 

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params; 
  const { user } = request;

  const findTodoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (findTodoIndex === -1) {
    return response.status(404).json({ error: 'Todo do not exists' });
  }

  user.todos[findTodoIndex] = { 
    ...user.todos[findTodoIndex], 
    done: true 
  };

  return response.status(200).send(user.todos[findTodoIndex])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params; 
  const { user } = request;

  const findTodoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (findTodoIndex === -1) {
    return response.status(404).json({ error: 'Todo do not exists' });
  }

  user.todos = user.todos.filter((todo) => todo.id !== id);

  return response.status(204).send()
});

module.exports = app;