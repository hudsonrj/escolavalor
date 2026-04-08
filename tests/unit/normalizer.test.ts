import { describe, test, expect } from 'bun:test';
import { normalizar, calcularPontosOlimpiada, validarNormalizado } from '../../src/score/normalizer';

describe('Normalizer', () => {
  describe('normalizar', () => {
    test('deve normalizar ENEM corretamente', () => {
      const resultado = normalizar({
        fonte: 'enem',
        valor_original: 650,
        escala_original: '0-1000',
      });

      expect(resultado).toBe(6.5);
    });

    test('deve normalizar IDEB corretamente', () => {
      const resultado = normalizar({
        fonte: 'ideb',
        valor_original: 7.5,
        escala_original: '0-10',
      });

      expect(resultado).toBe(7.5);
    });

    test('deve normalizar aprovação universitária corretamente', () => {
      const resultado = normalizar({
        fonte: 'aprovacao_univ',
        valor_original: 85,
        escala_original: '0-100',
      });

      expect(resultado).toBe(8.5);
    });

    test('deve normalizar olimpíadas corretamente', () => {
      const resultado = normalizar({
        fonte: 'olimpiadas',
        valor_original: 5,
        escala_original: '0-10',
        max_historico: 10,
      });

      expect(resultado).toBe(5);
    });

    test('deve garantir valores entre 0 e 10', () => {
      const resultadoAlto = normalizar({
        fonte: 'enem',
        valor_original: 1500,
        escala_original: '0-1000',
      });

      expect(resultadoAlto).toBe(10);

      const resultadoBaixo = normalizar({
        fonte: 'enem',
        valor_original: -100,
        escala_original: '0-1000',
      });

      expect(resultadoBaixo).toBe(0);
    });
  });

  describe('calcularPontosOlimpiada', () => {
    test('deve retornar pontos corretos por nível', () => {
      expect(calcularPontosOlimpiada('ouro')).toBe(3.0);
      expect(calcularPontosOlimpiada('prata')).toBe(2.0);
      expect(calcularPontosOlimpiada('bronze')).toBe(1.0);
      expect(calcularPontosOlimpiada('mencao')).toBe(0.5);
    });
  });

  describe('validarNormalizado', () => {
    test('deve validar valores normalizados corretos', () => {
      expect(validarNormalizado(5.5)).toBe(true);
      expect(validarNormalizado(0)).toBe(true);
      expect(validarNormalizado(10)).toBe(true);
    });

    test('deve rejeitar valores fora da faixa', () => {
      expect(validarNormalizado(-1)).toBe(false);
      expect(validarNormalizado(11)).toBe(false);
    });
  });
});
