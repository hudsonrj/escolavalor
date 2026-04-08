import { describe, test, expect, mock, spyOn } from 'bun:test';
import { logger, log } from '../../src/utils/logger';

describe('Logger', () => {
  test('deve criar log estruturado JSON', () => {
    const consoleSpy = spyOn(console, 'log');

    logger.info('system', 'Teste', { foo: 'bar' });

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test('log entry deve conter todos os campos obrigatórios', () => {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'info' as const,
      source: 'system' as const,
      message: 'Teste',
      meta: { foo: 'bar' },
    };

    expect(entry).toHaveProperty('timestamp');
    expect(entry).toHaveProperty('level');
    expect(entry).toHaveProperty('source');
    expect(entry).toHaveProperty('message');
    expect(entry).toHaveProperty('meta');
  });

  test('deve aceitar todos os níveis de log', () => {
    const consoleSpy = spyOn(console, 'log');

    logger.info('system', 'Info');
    logger.warn('system', 'Warn');
    logger.error('system', 'Error');
    logger.debug('system', 'Debug');

    expect(consoleSpy).toHaveBeenCalledTimes(4);

    consoleSpy.mockRestore();
  });

  test('deve aceitar todas as fontes', () => {
    const sources: Array<'crawler' | 'api' | 'score' | 'db' | 'system'> = [
      'crawler',
      'api',
      'score',
      'db',
      'system',
    ];

    for (const source of sources) {
      expect(() => logger.info(source, 'Test')).not.toThrow();
    }
  });
});
