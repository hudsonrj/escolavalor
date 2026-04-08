import { Building2, Users, GraduationCap, Clock, School, MapPin, Network } from 'lucide-react';
import type { Escola } from '../types';

interface EscolaInfoProps {
  escola: Escola;
}

export function EscolaInfo({ escola }: EscolaInfoProps) {
  const getNivelLabel = (nivel: string) => {
    const labels: Record<string, string> = {
      'educacao_infantil': 'Educação Infantil',
      'fundamental_i': 'Fundamental I',
      'fundamental_ii': 'Fundamental II',
      'ensino_medio': 'Ensino Médio',
    };
    return labels[nivel] || nivel;
  };

  const getTurnoLabel = (turno: string) => {
    const labels: Record<string, string> = {
      'manha': 'Manhã',
      'tarde': 'Tarde',
      'noite': 'Noite',
      'integral': 'Integral',
    };
    return labels[turno] || turno;
  };

  return (
    <div className="space-y-6">
      {/* Rede e Localização */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-indigo-600" />
          Informações da Unidade
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {escola.rede_ensino && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
              <div className="flex items-center gap-2 mb-2">
                <Network className="h-5 w-5 text-indigo-600" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rede</p>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{escola.rede_ensino}</p>
            </div>
          )}

          {escola.endereco_completo && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Endereço</p>
              </div>
              <p className="text-sm text-gray-900 dark:text-white">{escola.endereco_completo}</p>
              {escola.bairro && <p className="text-sm text-gray-600 dark:text-gray-400">{escola.bairro}</p>}
              {escola.cep && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">CEP: {escola.cep}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Números da Escola */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Estrutura
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {escola.total_professores && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <GraduationCap className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{escola.total_professores}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Professores</p>
            </div>
          )}

          {escola.total_alunos && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{escola.total_alunos}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Alunos</p>
            </div>
          )}

          {escola.total_salas && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
              <School className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{escola.total_salas}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Salas</p>
            </div>
          )}
        </div>
      </div>

      {/* Níveis e Turnos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {escola.niveis_ensino && escola.niveis_ensino.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <School className="h-5 w-5 text-orange-600" />
              Níveis de Ensino
            </h4>
            <div className="space-y-2">
              {escola.niveis_ensino.map((nivel, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded text-sm"
                >
                  <span className="text-orange-600">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">{getNivelLabel(nivel)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {escola.turnos && escola.turnos.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-600" />
              Turnos Oferecidos
            </h4>
            <div className="space-y-2">
              {escola.turnos.map((turno, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-700 rounded text-sm"
                >
                  <Clock className="h-4 w-4 text-cyan-600" />
                  <span className="text-gray-700 dark:text-gray-300">{getTurnoLabel(turno)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ensino Integral */}
      {escola.ensino_integral && (
        <div className="border border-cyan-200 dark:border-cyan-700 rounded-lg p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-cyan-600" />
            <p className="font-semibold text-gray-900 dark:text-white">Ensino Integral</p>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{escola.ensino_integral}</p>
        </div>
      )}
    </div>
  );
}
