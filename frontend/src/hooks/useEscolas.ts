import { useQuery } from '@tanstack/react-query';
import { escolasService } from '../services/api';
import type { FilterParams } from '../types';

export function useEscolas(params?: FilterParams) {
  return useQuery({
    queryKey: ['escolas', params],
    queryFn: () => escolasService.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useEscola(id: string) {
  return useQuery({
    queryKey: ['escola', id],
    queryFn: () => escolasService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useRanking(params?: { uf?: string; tipo?: string; municipio?: string; rede_ensino?: string; limit?: number }) {
  return useQuery({
    queryKey: ['ranking', params],
    queryFn: () => escolasService.getRanking(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCompareEscolas(ids: string[]) {
  return useQuery({
    queryKey: ['compare', ids],
    queryFn: () => escolasService.compareEscolas(ids),
    enabled: ids.length >= 2 && ids.length <= 4,
    staleTime: 1000 * 60 * 5,
  });
}
