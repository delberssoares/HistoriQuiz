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

let _stats: GameStats = DEFAULT_STATS;
let _starsMap: Record<string, number> = {};
let _listeners: Array<() => void> = [];

function notify() { _listeners.forEach((fn) => fn()); }

async function loadFromStorage() {
  try {
    const [rawStats, rawStars] = await Promise.all([
      AsyncStorage.getItem(STATS_KEY),
      AsyncStorage.getItem(STARS_KEY),
    ]);
    if (rawStats) _stats = JSON.parse(rawStats);
    if (rawStars) _starsMap = JSON.parse(rawStars);
    notify();
  } catch (_) {}
}

loadFromStorage();

export function useGameStore() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const fn = () => rerender((n) => n + 1);
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter((l) => l !== fn); };
  }, []);

  const reload = useCallback(() => { loadFromStorage(); }, []);

  const saveResult = useCallback(
    async (correctCount: number, totalCount: number, mode: string, level: string) => {
      const pct = totalCount > 0 ? correctCount / totalCount : 0;
      const newStars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct > 0 ? 1 : 0;

      const allCorrect = correctCount === totalCount;
      const newStreak = allCorrect ? _stats.streak + 1 : 0;
      _stats = {
        matches: _stats.matches + 1,
        correct: _stats.correct + correctCount,
        streak: newStreak,
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

  const getLevelStars = useCallback(
    (mode: string, level: number) => _starsMap[`${mode}-${level}`] ?? 0,
    [],
  );

  const accuracy =
    _stats.matches > 0
      ? Math.round((_stats.correct / (_stats.matches * 5)) * 100)
      : 0;

  return { stats: _stats, accuracy, getLevelStars, saveResult, reload };
}