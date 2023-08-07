const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const authMiddleware = require('./middleware/authMiddleware'); // Path to your authMiddleware

const app = express();
const PORT = process.ENV.PORT || 3000;

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
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body;

    try {
        const user = await prisma.user.findUnique({where: {username} });
        if (!user){
            return res.status(404).json({message: "User not found!"});
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch){
            res.status(401).json({message: 'Invalid password'});
        }

        res.json({message : 'Login successful'});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

app.get('/profile', authMiddleware, (req, res) => {
    const { username } = req.user;
    res.json({ message: `Welcome to your profile, ${username}!` });
  });

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});