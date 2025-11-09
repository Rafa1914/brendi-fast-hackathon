import { Router } from 'express';
import AgentRouter from './agent';

const router = Router();

router.use('/agent', AgentRouter);

export default router;

