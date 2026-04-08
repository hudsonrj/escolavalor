/**
 * Pipeline do Crawler
 *
 * IMPORTANTE: Este módulo SEMPRE deve rodar em processo isolado via Bun.spawn()
 * Nunca chamar funções deste módulo diretamente no processo principal
 */

import { chromium, type Browser, type Page } from 'playwright';
import { logger } from '../utils/logger';

export interface CrawlerConfig {
  concurrency: number;
  timeoutPage: number;
  timeoutTotal: number;
}

export interface CrawlerResult {
  success: boolean;
  url: string;
  data?: unknown;
  error?: string;
}

/**
 * Configuração padrão do crawler
 */
export const DEFAULT_CONFIG: CrawlerConfig = {
  concurrency: parseInt(process.env.CRAWLER_CONCURRENCY || '10'),
  timeoutPage: parseInt(process.env.CRAWLER_TIMEOUT_PAGE || '30000'),
  timeoutTotal: parseInt(process.env.CRAWLER_TIMEOUT_TOTAL || '14400000'),
};

/**
 * Lê robots.txt de uma origem
 */
export async function lerRobotsTxt(baseUrl: string): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/robots.txt`);
    if (!response.ok) {
      logger.warn('crawler', `robots.txt não encontrado em ${baseUrl}`);
      return [];
    }

    const content = await response.text();
    const disallowedPaths: string[] = [];

    for (const line of content.split('\n')) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.startsWith('disallow:')) {
        const path = trimmed.substring('disallow:'.length).trim();
        if (path) {
          disallowedPaths.push(path);
        }
      }
    }

    logger.info('crawler', `robots.txt lido de ${baseUrl}`, {
      disallowed: disallowedPaths.length,
    });

    return disallowedPaths;
  } catch (error) {
    logger.error('crawler', `Erro ao ler robots.txt de ${baseUrl}`, { error });
    return [];
  }
}

/**
 * Valida se uma URL é permitida pelo robots.txt
 */
export function isUrlAllowed(url: string, disallowedPaths: string[]): boolean {
  const urlObj = new URL(url);
  const path = urlObj.pathname;

  for (const disallowed of disallowedPaths) {
    if (path.startsWith(disallowed)) {
      return false;
    }
  }

  return true;
}

/**
 * Valida URLs em paralelo via HEAD request
 */
export async function validarUrls(
  urls: string[],
  concurrency: number
): Promise<string[]> {
  const validUrls: string[] = [];
  const chunks: string[][] = [];

  // Dividir URLs em chunks para paralelização
  for (let i = 0; i < urls.length; i += concurrency) {
    chunks.push(urls.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (url) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          return url;
        }
      } catch (error) {
        logger.debug('crawler', `URL inválida: ${url}`, { error });
      }
      return null;
    });

    const results = await Promise.all(promises);
    validUrls.push(...results.filter((url): url is string => url !== null));
  }

  logger.info('crawler', 'URLs validadas', {
    total: urls.length,
    valid: validUrls.length,
  });

  return validUrls;
}

/**
 * Extrai JSON-LD de uma página
 */
export async function extrairJsonLd(page: Page): Promise<unknown[]> {
  try {
    const ldJsonData = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      return Array.from(scripts).map((script) => {
        try {
          return JSON.parse(script.textContent || '{}');
        } catch {
          return null;
        }
      }).filter((data) => data !== null);
    });

    return ldJsonData;
  } catch (error) {
    logger.error('crawler', 'Erro ao extrair JSON-LD', { error });
    return [];
  }
}

/**
 * Retry com backoff exponencial
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000,
  maxDelayMs = 30000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts - 1) {
        // Calcular delay com jitter
        const exponentialDelay = baseDelayMs * 2 ** attempt;
        const jitter = Math.random() * 1000;
        const delay = Math.min(exponentialDelay + jitter, maxDelayMs);

        logger.warn('crawler', `Tentativa ${attempt + 1} falhou, retry em ${delay}ms`, {
          error: lastError.message,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Scraper genérico com Playwright
 */
export async function scrape(
  url: string,
  config: CrawlerConfig = DEFAULT_CONFIG
): Promise<CrawlerResult> {
  let browser: Browser | undefined;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Configurar timeout
    page.setDefaultTimeout(config.timeoutPage);

    // Navegar para URL
    await page.goto(url, { waitUntil: 'networkidle' });

    // Tentar extrair JSON-LD primeiro
    const jsonLdData = await extrairJsonLd(page);

    await browser.close();

    logger.info('crawler', `Scraping concluído: ${url}`, {
      hasJsonLd: jsonLdData.length > 0,
    });

    return {
      success: true,
      url,
      data: jsonLdData.length > 0 ? jsonLdData : null,
    };
  } catch (error) {
    logger.error('crawler', `Erro ao fazer scraping de ${url}`, { error });

    if (browser) {
      await browser.close();
    }

    return {
      success: false,
      url,
      error: (error as Error).message,
    };
  }
}

/**
 * Pipeline completo de crawling
 */
export async function executarPipeline(
  baseUrl: string,
  urls: string[],
  config: CrawlerConfig = DEFAULT_CONFIG
): Promise<CrawlerResult[]> {
  const startTime = Date.now();

  logger.info('crawler', 'Iniciando pipeline', {
    baseUrl,
    totalUrls: urls.length,
  });

  // 1. Ler robots.txt
  const disallowedPaths = await lerRobotsTxt(baseUrl);

  // 2. Filtrar URLs permitidas
  const allowedUrls = urls.filter((url) => isUrlAllowed(url, disallowedPaths));

  logger.info('crawler', 'URLs filtradas por robots.txt', {
    total: urls.length,
    allowed: allowedUrls.length,
  });

  // 3. Validar URLs em paralelo
  const validUrls = await validarUrls(allowedUrls, config.concurrency);

  // 4. Scraping com retry
  const results: CrawlerResult[] = [];

  for (const url of validUrls) {
    try {
      const result = await retryWithBackoff(() => scrape(url, config));
      results.push(result);

      // Verificar timeout total
      if (Date.now() - startTime > config.timeoutTotal) {
        logger.warn('crawler', 'Timeout total atingido, parando pipeline');
        break;
      }
    } catch (error) {
      results.push({
        success: false,
        url,
        error: (error as Error).message,
      });
    }
  }

  const duration = Date.now() - startTime;
  const successCount = results.filter((r) => r.success).length;

  logger.info('crawler', 'Pipeline concluído', {
    duration: `${duration}ms`,
    total: results.length,
    success: successCount,
    failed: results.length - successCount,
  });

  return results;
}
