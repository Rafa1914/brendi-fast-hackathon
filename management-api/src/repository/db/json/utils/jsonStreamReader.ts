import * as fs from 'fs';
// @ts-ignore - stream-json não tem tipos oficiais
import { parser } from 'stream-json';
// @ts-ignore - stream-json não tem tipos oficiais
import { streamArray } from 'stream-json/streamers/StreamArray';
// @ts-ignore - stream-chain não tem tipos oficiais
import { chain } from 'stream-chain';

/**
 * Lê um array JSON de forma contínua usando streaming
 * @param filePath Caminho do arquivo JSON
 * @param itemProcessor Função para processar cada item do array
 * @param onError Callback opcional para tratar erros de parse de itens individuais
 * @param onPipelineError Callback opcional para tratar erros do pipeline (parser)
 * @returns Promise com array de itens processados
 */
export async function readJsonArrayStream<TInput, TOutput>(
  filePath: string,
  itemProcessor: (item: TInput) => TOutput,
  onError?: (error: unknown, item: TInput, index: number) => void,
  onPipelineError?: (error: unknown) => void
): Promise<TOutput[]> {
  return new Promise((resolve, reject) => {
    const results: TOutput[] = [];
    let itemIndex = 0;
    const pipeline = chain([
      fs.createReadStream(filePath),
      parser(),
      streamArray(),
    ]);

    pipeline.on('data', (data: { key: number; value: TInput }) => {
      try {
        const processed = itemProcessor(data.value);
        results.push(processed);
      } catch (error: unknown) {
        // Em caso de erro no parse de um item específico, continua normalmente
        if (onError) {
          onError(error, data.value, itemIndex);
        } else {
          // Log silencioso se não houver callback de erro
          console.warn(`Erro ao processar item no índice ${itemIndex}:`, error);
        }
        // Continua processando os próximos itens
      }
      itemIndex++;
    });

    pipeline.on('end', () => {
      resolve(results);
    });

    pipeline.on('error', (error: unknown) => {
      // Se houver callback para erro do pipeline, chama e retorna o que foi processado
      if (onPipelineError) {
        onPipelineError(error);
        // Retorna os itens já processados ao invés de rejeitar
        resolve(results);
      } else {
        // Erros críticos do pipeline (ex: arquivo não encontrado) ainda rejeitam a promise
        // Mas erros de parsing podem ser tratados de forma mais resiliente
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Parser cannot parse') || errorMessage.includes('expected')) {
          // Erro de parsing - retorna o que foi processado até agora
          console.warn('Erro no parser do JSON, retornando itens processados até o momento:', error);
          resolve(results);
        } else {
          // Outros erros críticos (arquivo não encontrado, etc) rejeitam
          reject(error);
        }
      }
    });
  });
}

