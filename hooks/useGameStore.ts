import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface GameStats {
  matches: number;
  correct: number;
  streak: number;
  maxStreak: number;
}

const STATS_KEY = 'hq_stats_v1';
const STARS_KEY = 'hq_stars_v1';
const DEFAULT_STATS: GameStats = { matches: 0, correct: 0, streak: 0, maxStreak: 0 };

let _stats: GameStats = { ...DEFAULT_STATS };
let _starsMap: Record<string, number> = {};
let _listeners: Set<() => void> = new Set();

function notify() { _listeners.forEach((fn) => fn()); }

async function loadFromStorage() {
  try {
    const [rawStats, rawStars] = await Promise.all([
      AsyncStorage.getItem(STATS_KEY),
      AsyncStorage.getItem(STARS_KEY),
    ]);
    if (rawStats) _stats = { ...DEFAULT_STATS, ...JSON.parse(rawStats) };
    if (rawStars) _starsMap = JSON.parse(rawStars);
    notify();
  } catch (_) {}
}

loadFromStorage();

export function useGameStore() {
  // ✏️ Guarda um snapshot dos dados no state do componente
  // Assim qualquer notify() causa re-render com valores frescos
  const [snapshot, setSnapshot] = useState({ stats: _stats, starsMap: _starsMap });

  useEffect(() => {
    const fn = () => setSnapshot({ stats: _stats, starsMap: _starsMap }); // ✏️ copia referência atual
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, []);

  const reload = useCallback(async () => {
    await loadFromStorage();
  }, []);

  const saveResult = useCallback(
    async (correctCount: number, totalCount: number, mode: string, level: string) => {
      const pct = totalCount > 0 ? correctCount / totalCount : 0;
      const newStars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;

      const allCorrect = correctCount === totalCount;
      const newStreak = _stats.streak + (allCorrect ? 1 : 0); // ✏️ corrigido: streak só sobe se acertou tudo
      _stats = {
        matches: _stats.matches + 1,
        correct: _stats.correct + correctCount,
        streak: allCorrect ? newStreak : 0,
        maxStreak: Math.max(_stats.maxStreak, newStreak),
      };
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(_stats)).catch(() => {});

      const key = `${mode}-${level}`;
      const current = _starsMap[key] ?? 0;
      if (newStars > current) {
        _starsMap = { ..._starsMap, [key]: newStars };
        await AsyncStorage.setItem(STARS_KEY, JSON.stringify(_starsMap)).catch(() => {});
      }

      notify();
      return newStars;
    },
    [],
  );

  // ✏️ Lê do snapshot (state local), não direto do módulo global
  const getLevelStars = useCallback(
    (mode: string, level: number) => snapshot.starsMap[`${mode}-${level}`] ?? 0,
    [snapshot.starsMap], // ✏️ depende do snapshot — atualiza junto com o re-render
  );

  const accuracy =
    snapshot.stats.matches > 0
      ? Math.round((snapshot.stats.correct / (snapshot.stats.matches * 5)) * 100)
      : 0;

  // ✏️ Retorna dados do snapshot, não das variáveis globais diretas
  return { stats: snapshot.stats, accuracy, getLevelStars, saveResult, reload };
}