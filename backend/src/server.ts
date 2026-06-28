import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import showsRouter from './routes/shows';
import episodesRouter from './routes/episodes';
import chatRouter from './routes/chat';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/', showsRouter);
app.use('/', episodesRouter);
app.use('/', chatRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Showrunner backend running on port ${PORT}`);
});
