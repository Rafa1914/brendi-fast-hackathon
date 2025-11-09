import { Router } from 'express';
import { AgentController } from '../controller/agent';

const AgentRouter = Router();

AgentRouter.post('/chat', AgentController.chat);
AgentRouter.post('/insights', AgentController.generateInsights);

export default AgentRouter;

