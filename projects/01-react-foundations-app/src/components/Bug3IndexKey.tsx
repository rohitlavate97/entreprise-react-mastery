import React, { useState } from 'react';

interface Contact {
  id: string;
  name: string;
}

export function Bug3IndexKey() {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 'c-1', name: 'Alice Enterprise' },
    { id: 'c-2', name: 'Bob Architect' },
    { id: 'c-3', name: 'Charlie DevOps' },
  ]);
  const [isBuggyMode, setIsBuggyMode] = useState(true);

  const handleDeleteFirst = () => {
    setContacts(contacts.slice(1));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-cyan-400">Drill 3: Array Index as Key on Dynamic Lists</h3>
          <p className="text-xs text-slate-400">Type notes into the inputs, then delete the top contact</p>
        </div>
        <button
          onClick={() => setIsBuggyMode(!isBuggyMode)}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
            isBuggyMode
              ? 'bg-rose-950/60 border-rose-600 text-rose-300'
              : 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
          }`}
        >
          {isBuggyMode ? '🔴 Bug Active (key={index})' : '🟢 Fix Active (key={contact.id})'}
        </button>
      </div>

      <button
        onClick={handleDeleteFirst}
        disabled={contacts.length <= 1}
        className="mb-4 bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border border-rose-700 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 transition-colors"
      >
        Delete Top Contact
      </button>

      <div className="space-y-3">
        {contacts.map((contact, index) => {
          // ❌ BUGGY: Uses index -> When top contact is deleted, React maps new row to key=0 and preserves old unmanaged input DOM state!
          // ✅ FIXED: Uses stable entity ID -> React correctly unmounts row #0 and preserves row #1 and #2.
          const itemKey = isBuggyMode ? index : contact.id;

          return (
            <div key={itemKey} className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-xs font-mono text-cyan-400 w-32 truncate">{contact.name}</span>
              <input
                type="text"
                placeholder="Type note for this person..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          );
        })}
      </div>

      {isBuggyMode && (
        <p className="mt-3 text-xs text-rose-400/90 italic">
          💡 Try this: Type "Note for Alice" in row 1 and "Note for Bob" in row 2. Click "Delete Top Contact". Notice the notes stay in positions 1 & 2 instead of following Bob!
        </p>
      )}
    </div>
  );
}
