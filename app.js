// app.js

const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

// Setup Express view engine and static file serving
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Serve the index page
app.get('/', (req, res) => {
    res.render('index');
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
            model: 'gpt-3.5-turbo',  // Using the latest available model
            messages: [
                { role: 'user', content: userMessage },
            ],
            max_tokens: 100,
            temperature: 0.7,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
        });

        // Extracting bot's reply from the API response
        const botReply = response.data.choices[0].message.content.trim();

        // Render the response with the user input and bot reply
        res.render('index', { userMessage, botReply });
    } catch (error) {
        console.error(error);
        res.render('index', { error: 'Error generating response. Please try again later.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
