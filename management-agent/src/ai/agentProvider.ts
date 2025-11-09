import { IAgentProvider } from './interface/IAgentProvider';
import OpenAiAgentProvider from './providers/openAiAgentProvider';

class AgentProviderFactory {
  private static instance: IAgentProvider | null = null;

  static getInstance(): IAgentProvider {
    if (!this.instance) {
      const provider = process.env.AI_PROVIDER || 'openai';
      
      switch (provider) {
        case 'openai':
          this.instance = new OpenAiAgentProvider();
          break;
        default:
          throw new Error(`AI Provider não suportado: ${provider}`);
      }
    }
    
    return this.instance;
  }

  static setInstance(provider: IAgentProvider): void {
    this.instance = provider;
  }
}

export default AgentProviderFactory.getInstance();

