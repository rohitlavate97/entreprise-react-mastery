import React, { useState, useEffect } from 'react';

function TickingTimer({ isBuggy }: { isBuggy: boolean }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    if (!isBuggy) {
      // ✅ FIXED: Returns cleanup function to tear down timer on unmount
      return () => {
        clearInterval(interval);
      };
    }
    // ❌ BUGGY: Omits cleanup return! When toggled or remounted, timer leaks and accelerates count!
  }, [isBuggy]);

  return (
    <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-center">
      <span className="text-3xl font-mono font-bold text-cyan-400">{seconds}s</span>
      <p className="text-xs text-slate-500 mt-1">Timer Instance Active</p>
    </div>
  );
}

export function Bug2EffectCleanup() {
  const [showTimer, setShowTimer] = useState(true);
  const [isBuggyMode, setIsBuggyMode] = useState(true);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-cyan-400">Drill 2: Missing `useEffect` Cleanup</h3>
          <p className="text-xs text-slate-400">Watch interval timer leaks when unmounting component</p>
        </div>
        <button
          onClick={() => setIsBuggyMode(!isBuggyMode)}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
            isBuggyMode
              ? 'bg-rose-950/60 border-rose-600 text-rose-300'
              : 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
          }`}
        >
          {isBuggyMode ? '🔴 Bug Active (No clearInterval)' : '🟢 Fix Active (Cleanup Function)'}
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setShowTimer(!showTimer)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {showTimer ? 'Unmount Timer Component' : 'Mount Timer Component'}
        </button>
      </div>

      {showTimer ? (
        <TickingTimer isBuggy={isBuggyMode} />
      ) : (
        <div className="bg-slate-950/40 border border-dashed border-slate-800 p-6 rounded-lg text-center text-slate-500 text-sm">
          Timer unmounted. {isBuggyMode ? '⚠️ But background interval is STILL RUNNING and leaking in memory!' : '✅ Interval cleanly cleared.'}
        </div>
      )}
    </div>
  );
}
