import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './router';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/agent-api', router);

app.listen(PORT, () => {
  console.log(`🤖 Agent rodando na porta ${PORT}`);
});

