const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Express view engine and static file serving
app.set('view engine', 'hbs');
app.set('views', './views'); // Use relative path to views folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the index page
app.get('/', (req, res) => {
    res.render('index', { userMessage: null, botReply: null, error: null });
});

// Handle the chat submission and get a response from OpenAI
app.post('/generate', async (req, res) => {
    const userMessage = req.body.prompt;

    if (!userMessage) {
        return res.render('index', { error: 'Please enter a message to continue.' });
    }

    try {
        // Sending request to OpenAI API
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: userMessage }],
            max_tokens: 100,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
        });

        // Extracting bot's reply from the API response
        const botReply = response.data.choices[0].message.content.trim();

        // Render the response with the user input and bot reply
        res.render('index', { userMessage, botReply });
    } catch (error) {
        console.error('Error communicating with OpenAI API:', error.response?.data || error.message);
        res.render('index', { error: 'Error generating response. Please try again later.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
