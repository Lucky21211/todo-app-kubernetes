const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoHost = process.env.MONGO_HOST || 'localhost';
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoDB = process.env.MONGO_DB || 'todoapp';

const mongoURI = `mongodb://${mongoHost}:${mongoPort}/${mongoDB}`;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Todo Schema
const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Todo = mongoose.model('Todo', todoSchema);

// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Todo App is running' });
});

// 1. GET /todos - Get all todos
app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. POST /todos - Create new todo
app.post('/todos', async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        
        const todo = new Todo({
            title,
            description: description || ''
        });
        
        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. GET /todos/:id - Get single todo
app.get('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. PUT /todos/:id - Update todo
app.put('/todos/:id', async (req, res) => {
    try {
        const { title, description, completed } = req.body;
        const updateData = {};
        
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (completed !== undefined) updateData.completed = completed;
        
        const todo = await Todo.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. DELETE /todos/:id - Delete todo
app.delete('/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Todo app listening on port ${PORT}`);
    console.log(`MongoDB URI: ${mongoURI}`);
});