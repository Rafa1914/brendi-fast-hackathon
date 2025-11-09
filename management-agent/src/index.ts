import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './router';
import { httpLogger } from './utils/httpLogger';
import { logger } from './utils/logger';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(httpLogger);

app.use('/agent-api', router);

app.listen(PORT, () => {
  logger.info(`Agent rodando na porta ${PORT}`, { context: 'Server' });
});

