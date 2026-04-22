/**
 * Serviço de chat usando Groq LLM
 */

import Groq from 'groq-sdk';
import { logger } from '../utils/logger';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  logger.warn('groq-chat', 'GROQ_API_KEY not set - chat functionality will be limited');
}

const groq = GROQ_API_KEY ? new Groq({
  apiKey: GROQ_API_KEY,
}) : null;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatContext {
  escolas?: any[];
  filtros?: any;
  historico?: any[];
}

const SYSTEM_PROMPT = `Você é um assistente especializado em ajudar pais a escolherem a melhor escola para seus filhos no Brasil.

Você tem acesso a um banco de dados completo de escolas com informações sobre:
- Desempenho acadêmico (ENEM, IDEB)
- Aprovações em universidades
- Olimpíadas e medalhas
- Mensalidades e custo-benefício
- Localização e infraestrutura
- Metodologias de ensino
- Inclusão e atendimento a necessidades especiais (autismo, TDAH, superdotação, altas habilidades)

Seu papel é:
1. Entender as necessidades da família e do aluno
2. Fazer perguntas relevantes para entender melhor o perfil
3. Sugerir escolas que se encaixem no perfil
4. Comparar opções considerando todos os aspectos
5. Ajudar em transições escolares minimizando impactos
6. Considerar necessidades especiais e neurodivergência

Seja empático, claro e objetivo. Use dados concretos quando disponíveis.`;

export async function chatCompletion(
  messages: ChatMessage[],
  context?: ChatContext,
  model: string = 'llama-3.3-70b-versatile'
): Promise<string> {
  if (!groq) {
    logger.warn('groq-chat', 'GROQ API not configured - returning mock response');
    return 'Chat functionality requires GROQ_API_KEY to be configured. Please add your GROQ API key to the .env file.';
  }

  try {
    // Adicionar contexto ao system prompt se houver
    const systemMessage: ChatMessage = {
      role: 'system',
      content: SYSTEM_PROMPT + (context ? `\n\nContexto da conversa:\n${JSON.stringify(context, null, 2)}` : ''),
    };

    const allMessages = [systemMessage, ...messages];

    logger.info('groq-chat', 'Enviando requisição para Groq', {
      model,
      messageCount: allMessages.length,
    });

    const completion = await groq.chat.completions.create({
      messages: allMessages,
      model,
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.9,
    });

    const response = completion.choices[0]?.message?.content || '';

    logger.info('groq-chat', 'Resposta recebida do Groq', {
      responseLength: response.length,
      tokensUsed: completion.usage,
    });

    return response;
  } catch (error) {
    logger.error('groq-chat', 'Erro ao chamar Groq API', { error });
    throw error;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  // Se GROQ não estiver configurado, usar hash simples
  if (!groq) {
    return simpleHash(text);
  }

  // Para embeddings, vamos usar uma abordagem simples por enquanto
  // Em produção, seria melhor usar um modelo de embeddings dedicado
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Generate a semantic representation of the following text as a JSON array of numbers.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0,
      max_tokens: 100,
    });

    // Por enquanto, vamos criar um embedding simples baseado em hash
    // Em produção, usar um modelo de embeddings real
    const hash = simpleHash(text);
    return hash;
  } catch (error) {
    logger.error('groq-chat', 'Erro ao gerar embedding', { error });
    return simpleHash(text);
  }
}

function simpleHash(str: string): number[] {
  // Gera um vetor de 384 dimensões baseado no texto
  // Esta é uma implementação simplificada - em produção usar modelo real
  const vec: number[] = new Array(384).fill(0);

  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const idx = charCode % 384;
    vec[idx] += (charCode / 1000);
  }

  // Normalizar
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  return vec.map(val => magnitude > 0 ? val / magnitude : 0);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  return magnitude > 0 ? dotProduct / magnitude : 0;
}
