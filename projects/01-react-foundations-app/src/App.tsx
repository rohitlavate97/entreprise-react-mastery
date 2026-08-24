import React, { useState } from 'react';
import { Bug1StateMutation } from './components/Bug1StateMutation';
import { Bug2EffectCleanup } from './components/Bug2EffectCleanup';
import { Bug3IndexKey } from './components/Bug3IndexKey';

export function App() {
  const [activeTab, setActiveTab] = useState<'drill1' | 'drill2' | 'drill3'>('drill1');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/60 border border-cyan-700/60 rounded-full text-xs font-semibold text-cyan-300 mb-3">
          <span>Project 1</span> • <span>React Foundations & Core Mechanics</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          React Foundations Break-and-Fix Lab
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
          Explore fundamental React mechanics, referential identity, effect lifecycles, and key reconciliation heuristics through interactive bug simulations.
        </p>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab('drill1')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'drill1'
              ? 'bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-950'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Drill 1: State Mutation
        </button>
        <button
          onClick={() => setActiveTab('drill2')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'drill2'
              ? 'bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-950'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Drill 2: Effect Cleanup
        </button>
        <button
          onClick={() => setActiveTab('drill3')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'drill3'
              ? 'bg-cyan-600 text-slate-950 shadow-lg shadow-cyan-950'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Drill 3: Array Index Key
        </button>
      </nav>

      {/* Active Drill View */}
      <main>
        {activeTab === 'drill1' && <Bug1StateMutation />}
        {activeTab === 'drill2' && <Bug2EffectCleanup />}
        {activeTab === 'drill3' && <Bug3IndexKey />}
      </main>

      <footer className="mt-16 text-center text-xs text-slate-600">
        Enterprise React + Spring Boot Mastery • Interactive Project Journey
      </footer>
    </div>
  );
}
