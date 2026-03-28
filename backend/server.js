const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const User = require('./models/User');

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Token generator
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Routes
app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        user = new User({ username, password, role });
        await user.save();
        
        res.status(201).json({ 
            username: user.username, 
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        res.json({ 
            username: user.username, 
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
