import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export interface GameStats {
  matches: number;
  correct: number;
  streak: number;
  maxStreak: number;
}

const STATS_KEY = 'hq_stats_v2';   // versão nova para não conflitar
const STARS_KEY = 'hq_stars_v1';
const BEST_KEY = 'hq_best_v1';    // melhor acerto por nível
const DEFAULT_STATS: GameStats = { matches: 0, correct: 0, streak: 0, maxStreak: 0 };

let _stats: GameStats = { ...DEFAULT_STATS };
let _starsMap: Record<string, number> = {};
let _bestMap: Record<string, number> = {};  // "mode-level" → melhor correctCount
let _listeners: Set<() => void> = new Set();

function notify() { _listeners.forEach((fn) => fn()); }

async function loadFromStorage() {
  try {
    const [rawStats, rawStars, rawBest] = await Promise.all([
      AsyncStorage.getItem(STATS_KEY),
      AsyncStorage.getItem(STARS_KEY),
      AsyncStorage.getItem(BEST_KEY),
    ]);
    if (rawStats) _stats = { ...DEFAULT_STATS, ...JSON.parse(rawStats) };
    if (rawStars) _starsMap = JSON.parse(rawStars);
    if (rawBest) _bestMap = JSON.parse(rawBest);
    notify();
  } catch (_) { }
}

loadFromStorage();

export function useGameStore() {
  const [snapshot, setSnapshot] = useState({ stats: _stats, starsMap: _starsMap });

  useEffect(() => {
    const fn = () => setSnapshot({ stats: { ..._stats }, starsMap: { ..._starsMap } });
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, []);

  const reload = useCallback(async () => { await loadFromStorage(); }, []);

  const saveResult = useCallback(
    async (correctCount: number, totalCount: number, mode: string, level: string) => {
      const key = `${mode}-${level}`;

      // ── Estrelas ────────────────────────────────────────────────────────
      const pct = totalCount > 0 ? correctCount / totalCount : 0;
      const newStars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;
      const oldStars = _starsMap[key] ?? 0;
      if (newStars > oldStars) {
        _starsMap = { ..._starsMap, [key]: newStars };
        await AsyncStorage.setItem(STARS_KEY, JSON.stringify(_starsMap)).catch(() => { });
      }

      // ── Melhor acerto do nível ──────────────────────────────────────────
      const oldBest = _bestMap[key] ?? 0;
      const gain = Math.max(0, correctCount - oldBest); // só o que melhorou
      if (correctCount > oldBest) {
        _bestMap = { ..._bestMap, [key]: correctCount };
        await AsyncStorage.setItem(BEST_KEY, JSON.stringify(_bestMap)).catch(() => { });
      }

      // ── Stats globais ───────────────────────────────────────────────────
      const allCorrect = correctCount === totalCount;
      const newStreak = allCorrect ? _stats.streak + 1 : 0;
      _stats = {
        matches: _stats.matches + 1,
        correct: _stats.correct + gain,   // só acrescenta a melhora
        streak: newStreak,
        maxStreak: Math.max(_stats.maxStreak, newStreak),
      };
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(_stats)).catch(() => { });

      notify();
      return newStars;
    },
    [],
  );

  // ── Reset completo ──────────────────────────────────────────────────────
  const resetAll = useCallback(async () => {
    _stats = { ...DEFAULT_STATS };
    _starsMap = {};
    _bestMap = {};
    await Promise.all([
      AsyncStorage.removeItem(STATS_KEY),
      AsyncStorage.removeItem(STARS_KEY),
      AsyncStorage.removeItem(BEST_KEY),
    ]).catch(() => { });
    notify();
  }, []);

  const getLevelStars = useCallback(
    (mode: string, level: number) => snapshot.starsMap[`${mode}-${level}`] ?? 0,
    [snapshot.starsMap],
  );

  const totalBest = Object.values(_bestMap).reduce((a, b) => a + b, 0);
  const levelsPlayed = Object.keys(_bestMap).length;
  const totalPossible = levelsPlayed * 10; // cada nível tem 10 questões

  const accuracy = (() => {
    const totalBest = Object.values(_bestMap).reduce((a, b) => a + b, 0);
    const levelsPlayed = Object.keys(_bestMap).length;
    const totalPossible = levelsPlayed * 10;
    return totalPossible > 0 ? Math.round((totalBest / totalPossible) * 100) : 0;
  })();

  return { stats: snapshot.stats, accuracy, getLevelStars, saveResult, reload, resetAll };
}