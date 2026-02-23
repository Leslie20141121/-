/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Timer, RefreshCw, Play, Clock, AlertCircle, ChevronLeft } from 'lucide-react';

type GameMode = 'classic' | 'time';
interface BlockData { id: string; value: number; row: number; col: number; }
interface GameState { blocks: BlockData[]; targetSum: number; currentSum: number; selectedIds: string[]; score: number; isGameOver: boolean; mode: GameMode; timeLeft: number; status: 'menu' | 'playing' | 'gameover'; }

const GRID_ROWS = 10, GRID_COLS = 6, INITIAL_ROWS = 4, MAX_BLOCK_VALUE = 9, TIME_MODE_LIMIT = 10;
const COLORS = ['bg-slate-100', 'bg-blue-100', 'bg-emerald-100', 'bg-amber-100', 'bg-rose-100', 'bg-indigo-100', 'bg-violet-100', 'bg-cyan-100', 'bg-orange-100', 'bg-lime-100'];
const TEXT_COLORS = ['text-slate-600', 'text-blue-600', 'text-emerald-600', 'text-amber-600', 'text-rose-600', 'text-indigo-600', 'text-violet-600', 'text-cyan-600', 'text-orange-600', 'text-lime-600'];

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateTarget = (blocks: BlockData[]) => {
  if (blocks.length === 0) return 10;
  const count = Math.min(blocks.length, Math.floor(Math.random() * 3) + 2);
  const shuffled = [...blocks].sort(() => 0.5 - Math.random());
  return Math.max(5, Math.min(shuffled.slice(0, count).reduce((acc, b) => acc + b.value, 0), 30));
};

const Block: React.FC<{ block: BlockData; isSelected: boolean; onClick: (id: string) => void }> = ({ block, isSelected, onClick }) => (
  <motion.div layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} onClick={() => onClick(block.id)}
    className={`relative flex items-center justify-center w-full aspect-square rounded-lg cursor-pointer font-bold text-xl \${isSelected ? 'ring-4 ring-black z-10 scale-105' : ''} \${COLORS[(block.value-1)%10]} \${TEXT_COLORS[(block.value-1)%10]}`}
    style={{ gridRowStart: GRID_ROWS - block.row, gridColumnStart: block.col + 1 }}>{block.value}</motion.div>
);

export default function App() {
  const [state, setState] = useState<GameState>({ blocks: [], targetSum: 0, currentSum: 0, selectedIds: [], score: 0, isGameOver: false, mode: 'classic', timeLeft: TIME_MODE_LIMIT, status: 'menu' });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = (mode: GameMode) => {
    const blocks: BlockData[] = [];
    for (let r = 0; r < INITIAL_ROWS; r++) for (let c = 0; c < GRID_COLS; c++) blocks.push({ id: generateId(), value: Math.floor(Math.random() * MAX_BLOCK_VALUE) + 1, row: r, col: c });
    setState({ blocks, targetSum: generateTarget(blocks), currentSum: 0, selectedIds: [], score: 0, isGameOver: false, mode, timeLeft: TIME_MODE_LIMIT, status: 'playing' });
  };

  useEffect(() => {
    if (state.status === 'playing' && state.mode === 'time') {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 0) {
            const shifted = prev.blocks.map(b => ({ ...b, row: b.row + 1 }));
            if (shifted.some(b => b.row >= GRID_ROWS)) return { ...prev, isGameOver: true, status: 'gameover' };
            const newRow = Array.from({ length: GRID_COLS }).map((_, col) => ({ id: generateId(), value: Math.floor(Math.random() * MAX_BLOCK_VALUE) + 1, row: 0, col }));
            return { ...prev, blocks: [...shifted, ...newRow], timeLeft: TIME_MODE_LIMIT, selectedIds: [], currentSum: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.status, state.mode]);

  const handleBlockClick = (id: string) => {
    if (state.status !== 'playing') return;
    setState(prev => {
      const block = prev.blocks.find(b => b.id === id);
      if (!block) return prev;
      const isSelected = prev.selectedIds.includes(id);
      const newSelectedIds = isSelected ? prev.selectedIds.filter(sid => sid !== id) : [...prev.selectedIds, id];
      const newSum = isSelected ? prev.currentSum - block.value : prev.currentSum + block.value;

      if (newSum === prev.targetSum) {
        const remaining = prev.blocks.filter(b => !newSelectedIds.includes(b.id));
        for (let c = 0; c < GRID_COLS; c++) {
          const colBlocks = remaining.filter(b => b.col === c).sort((a, b) => a.row - b.row);
          colBlocks.forEach((b, idx) => { b.row = idx; });
        }
        const newScore = prev.score + newSelectedIds.length * 10;
        if (prev.mode === 'classic') {
          const shifted = remaining.map(b => ({ ...b, row: b.row + 1 }));
          if (shifted.some(b => b.row >= GRID_ROWS)) return { ...prev, blocks: shifted, status: 'gameover', score: newScore };
          const newRow = Array.from({ length: GRID_COLS }).map((_, col) => ({ id: generateId(), value: Math.floor(Math.random() * MAX_BLOCK_VALUE) + 1, row: 0, col }));
          const final = [...shifted, ...newRow];
          return { ...prev, blocks: final, score: newScore, targetSum: generateTarget(final), currentSum: 0, selectedIds: [] };
        }
        return { ...prev, blocks: remaining, score: newScore, targetSum: generateTarget(remaining), currentSum: 0, selectedIds: [] };
      }
      return newSum > prev.targetSum ? { ...prev, currentSum: 0, selectedIds: [] } : { ...prev, selectedIds: newSelectedIds, currentSum: newSum };
    });
  };

  if (state.status === 'menu') return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">SUM<span className="text-blue-600">STACK</span></h1>
      <p className="text-slate-500 font-medium mb-12">通过匹配目标总和来清理网格。</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <button onClick={() => startGame('classic')} className="p-8 bg-white rounded-3xl shadow-xl border-2 border-slate-100 hover:border-blue-500 transition-all text-left group">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Play size={24} /></div>
          <h2 className="text-2xl font-bold mb-2">经典模式</h2>
          <p className="text-slate-500 text-sm">每次匹配成功后新增一行。尽力生存下去。</p>
        </button>
        <button onClick={() => startGame('time')} className="p-8 bg-white rounded-3xl shadow-xl border-2 border-slate-100 hover:border-rose-500 transition-all text-left group">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors"><Clock size={24} /></div>
          <h2 className="text-2xl font-bold mb-2">计时模式</h2>
          <p className="text-slate-500 text-sm">每 {TIME_MODE_LIMIT} 秒新增一行。速度就是一切。</p>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <button onClick={() => setState(s => ({ ...s, status: 'menu' }))} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><ChevronLeft /></button>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 font-bold flex items-center gap-2"><Trophy size={16} className="text-amber-500" /> 得分: {state.score}</div>
            {state.mode === 'time' && <div className={`px-4 py-2 rounded-2xl shadow-sm border font-bold flex items-center gap-2 ${state.timeLeft <= 3 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-100'}`}><Timer size={16} /> 时间: {state.timeLeft}s</div>}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-slate-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-100"><motion.div className="h-full bg-blue-500" initial={{ width: 0 }} animate={{ width: `${(state.currentSum / state.targetSum) * 100}%` }} /></div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">目标总和</div>
          <div className="text-5xl font-black text-slate-900">{state.targetSum} <span className="text-xl text-slate-300">/ {state.currentSum}</span></div>
        </div>
      </div>
      <div className="relative w-full max-w-md aspect-[6/10] bg-white rounded-3xl shadow-2xl border-4 border-slate-200 p-2 overflow-hidden">
        <div className="grid gap-1 h-full" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gridTemplateRows: 'repeat(10, 1fr)' }}>
          <AnimatePresence>{state.blocks.map(b => <Block key={b.id} block={b} isSelected={state.selectedIds.includes(b.id)} onClick={handleBlockClick} />)}</AnimatePresence>
        </div>
        <div className="absolute top-0 left-0 w-full h-1/6 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />
      </div>
      <AnimatePresence>
        {state.status === 'gameover' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertCircle size={32} /></div>
              <h2 className="text-3xl font-black mb-2">游戏结束</h2>
              <p className="text-slate-500 mb-8">最终得分: <span className="text-slate-900 font-bold">{state.score}</span></p>
              <div className="flex flex-col gap-3">
                <button onClick={() => startGame(state.mode)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors">再试一次</button>
                <button onClick={() => setState(s => ({ ...s, status: 'menu' }))} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">返回主菜单</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

