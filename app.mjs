import express from 'express';
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

export default app;