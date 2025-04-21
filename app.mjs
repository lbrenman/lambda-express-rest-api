import express from 'express';
import axios from 'axios';
const app = express();

app.use(express.json());

app.get('/hello', (req, res) => {
    res.json({ message: 'Hello from Express on Lambda!' });
});

app.post("/echo", (req, res) => {
    res.setHeader('content-type', 'application/json');
    res.json({ youSent: req.body });
});

app.get('/async', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    res.json({ message: 'Async operation completed' });
});

app.get('/apod', async (req, res) => {
    const response = await axios.get('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
    res.json(response.data);
});

export default app;