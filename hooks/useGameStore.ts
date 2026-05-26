import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface GameStats {
  matches: number;   // partidas completas
  correct: number;   // acertos totais
  streak: number;    // sequência atual de acertos
  maxStreak: number; // maior sequência já registrada
}

const STATS_KEY = 'hq_stats_v1';
const STARS_KEY = 'hq_stars_v1';

const DEFAULT_STATS: GameStats = {
  matches: 0,
  correct: 0,
  streak: 0,
  maxStreak: 0,
};

export function useGameStore() {
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  const [starsMap, setStarsMap] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  // Carrega do storage na montagem
  useEffect(() => {
    (async () => {
      try {
        const [rawStats, rawStars] = await Promise.all([
          AsyncStorage.getItem(STATS_KEY),
          AsyncStorage.getItem(STARS_KEY),
        ]);
        if (rawStats) setStats(JSON.parse(rawStats));
        if (rawStars) setStarsMap(JSON.parse(rawStars));
      } catch (_) {
        // storage indisponível — continua com defaults
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  /**
   * Salva o resultado de uma partida completa.
   *
   * @param correctCount  acertos nesta partida
   * @param totalCount    total de perguntas
   * @param mode          'multiple' | 'free'
   * @param level         número do nível (1-8)
   */
  const saveResult = useCallback(
    async (correctCount: number, totalCount: number, mode: string, level: string) => {
      // --- calcula estrelas (0-3) ---
      const pct = totalCount > 0 ? correctCount / totalCount : 0;
      const newStars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;

      // --- atualiza stats ---
      setStats((prev) => {
        const allCorrect = correctCount === totalCount;
        const newStreak = allCorrect ? prev.streak + 1 : 0;
        const updated: GameStats = {
          matches: prev.matches + 1,
          correct: prev.correct + correctCount,
          streak: newStreak,
          maxStreak: Math.max(prev.maxStreak, newStreak),
        };
        AsyncStorage.setItem(STATS_KEY, JSON.stringify(updated)).catch(() => {});
        return updated;
      });

      // --- atualiza estrelas (só aumenta, nunca diminui) ---
      const key = `${mode}-${level}`;
      setStarsMap((prev) => {
        const current = prev[key] ?? 0;
        if (newStars <= current) return prev;
        const updated = { ...prev, [key]: newStars };
        AsyncStorage.setItem(STARS_KEY, JSON.stringify(updated)).catch(() => {});
        return updated;
      });

      return newStars;
    },
    [],
  );

  /** Retorna as estrelas salvas para um nível (0-3). */
  const getLevelStars = useCallback(
    (mode: string, level: number) => starsMap[`${mode}-${level}`] ?? 0,
    [starsMap],
  );

  /** Precisão percentual (0-100), arredondada. */
  const accuracy =
    stats.matches > 0
      ? Math.round((stats.correct / (stats.matches * 10)) * 100) // assume 10 perguntas/partida
      : 0;

  return { stats, accuracy, getLevelStars, saveResult, loaded };
}
