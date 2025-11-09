import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export function httpLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  let logged = false;

  // Log da requisição recebida
  logger.debug(`Requisição recebida: ${req.method} ${req.path}`, {
    context: 'HTTP',
    metadata: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined,
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
      },
    },
  });

  const logResponse = () => {
    if (logged) return;
    logged = true;
    const duration = Date.now() - startTime;
    
    logger.httpRequest(
      req.method,
      req.path,
      res.statusCode,
      duration,
      {
        context: 'HTTP',
        metadata: {
          query: req.query,
        },
      }
    );
  };

  // Intercepta o método res.json para capturar a resposta
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    logResponse();
    return originalJson(body);
  };

  // Intercepta o método res.send para capturar a resposta
  const originalSend = res.send.bind(res);
  res.send = function (body: any) {
    logResponse();
    return originalSend(body);
  };

  // Intercepta o evento finish para garantir que sempre logue
  res.on('finish', logResponse);

  next();
}

