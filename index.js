const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const authMiddleware = require('./authMiddleware'); // Path to your authMiddleware
const jwt = require('jsonwebtoken'); // Import the jsonwebtoken library

const app = express();
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient(); // Initialize PrismaClient instance
app.use(express.json());

app.post('/register', async (req, res)=> {
    const {username, password} = req.body;

    try {
        hashedPassword = await bcrypt.hash(password,10);
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        });

        res.json({message : 'User registered successfully', user});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Error registering user'});
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Create a JWT token
        const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET);

        // Return the JWT token as a response
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

app.get('/profile', authMiddleware, (req, res) => {
    console.log('Authenticated user:', req.user); // Logging the authenticated user information
    console.log('Decoded token data:', req.decodedToken); // Logging the decoded token data

    const username = req.user;
    res.json({ message: `Welcome to your profile, ${username}!` });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});