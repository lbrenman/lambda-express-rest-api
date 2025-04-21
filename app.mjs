import express from 'express';
import axios from 'axios';
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
const client = new TranslateClient({ region: "us-east-1" });

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

app.get('/translate', async (req, res) => {
    const input = {
        Text: req.query.text,
        SourceLanguageCode: req.query.sourcelanguage,
        TargetLanguageCode: req.query.targetlanguage,
        Settings: {
            Formality: "INFORMAL",
            Profanity: "MASK",
            Brevity: "ON",
        }
    };
    const command = new TranslateTextCommand(input);
    const ttResponse = await client.send(command);

    const response = {
        "SourceText": input.Text,
        "SourceLanguageCode": ttResponse.SourceLanguageCode,
        "TargetLanguageCode": ttResponse.TargetLanguageCode,
        "TranslatedText": ttResponse.TranslatedText
    }
    res.json(response);
});

export default app;