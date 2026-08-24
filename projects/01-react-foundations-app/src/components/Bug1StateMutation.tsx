import React, { useState } from 'react';

interface Todo {
  id: string;
  text: string;
}

export function Bug1StateMutation() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Master React reconciliation' },
    { id: '2', text: 'Understand referential equality' },
  ]);
  const [input, setInput] = useState('');
  const [isBuggyMode, setIsBuggyMode] = useState(true);

  const handleAddTodo = () => {
    if (!input.trim()) return;

    if (isBuggyMode) {
      // ❌ BUGGY: Mutates state array directly in-place!
      // React does Object.is(prevTodos, nextTodos) -> references match -> NO RENDER!
      todos.push({ id: crypto.randomUUID(), text: input });
      setTodos(todos); 
    } else {
      // ✅ FIXED: Returns new immutable array reference
      setTodos([...todos, { id: crypto.randomUUID(), text: input }]);
    }
    setInput('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-cyan-400">Drill 1: Direct State Mutation</h3>
          <p className="text-xs text-slate-400">Watch what happens when mutating state directly vs creating new reference</p>
        </div>
        <button
          onClick={() => setIsBuggyMode(!isBuggyMode)}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
            isBuggyMode
              ? 'bg-rose-950/60 border-rose-600 text-rose-300'
              : 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
          }`}
        >
          {isBuggyMode ? '🔴 Bug Active (In-Place Mutation)' : '🟢 Fix Active (Immutable Copy)'}
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add new task..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleAddTodo}
          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Add Task
        </button>
      </div>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="bg-slate-950/60 border border-slate-800/80 px-3 py-2 rounded-lg text-sm text-slate-300">
            {todo.text}
          </li>
        ))}
      </ul>
      
      {isBuggyMode && (
        <p className="mt-3 text-xs text-rose-400/90 italic">
          💡 Try adding a task: The state is updated in memory, but UI does NOT update because Object.is(todos, todos) evaluates to true!
        </p>
      )}
    </div>
  );
}
