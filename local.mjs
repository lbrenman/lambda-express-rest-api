import app from './app.mjs';
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Local server running on http://localhost:${port}`);
});