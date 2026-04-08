import { describe, test, expect } from 'bun:test';
import { WEIGHTS, validateWeights, getWeightsInfo } from '../../src/score/weights';

describe('Weights', () => {
  test('soma dos pesos deve ser 1.0', () => {
    const soma = Object.values(WEIGHTS).reduce((acc, w) => acc + w, 0);
    expect(Math.abs(soma - 1.0)).toBeLessThan(0.0001);
  });

  test('validateWeights não deve lançar exceção', () => {
    expect(() => validateWeights()).not.toThrow();
  });

  test('getWeightsInfo deve retornar informações corretas', () => {
    const info = getWeightsInfo();

    expect(info.soma).toBeCloseTo(1.0);
    expect(info.enem.peso).toBe(WEIGHTS.enem);
    expect(info.olimpiadas.peso).toBe(WEIGHTS.olimpiadas);
    expect(info.aprovacao.peso).toBe(WEIGHTS.aprovacao);
    expect(info.ideb.peso).toBe(WEIGHTS.ideb);
  });

  test('todos os pesos devem ser positivos', () => {
    expect(WEIGHTS.enem).toBeGreaterThan(0);
    expect(WEIGHTS.olimpiadas).toBeGreaterThan(0);
    expect(WEIGHTS.aprovacao).toBeGreaterThan(0);
    expect(WEIGHTS.ideb).toBeGreaterThan(0);
  });
});
