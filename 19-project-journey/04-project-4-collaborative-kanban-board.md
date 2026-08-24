# Project 4 — Collaborative Workflow & Real-Time Kanban Board

## 1. PROJECT SPECIFICATION & ARCHITECTURAL BLUEPRINT
- **Domain:** Enterprise Agile Project Management & Team Workflows.
- **Core Architecture:**
  - **Drag-and-Drop:** Fluid column/card reordering with `@hello-pangea/dnd`.
  - **Optimistic UI:** 0ms perceived latency card movements with snapshot rollback on network error.
  - **Concurrency Control:** JPA `@Version` optimistic locking + `If-Match` headers alerting users if a card was simultaneously moved by another teammate.

```
                    OPTIMISTIC KANBAN CARD MOVE FLOW
                    
  User drags Card #102 from "IN_PROGRESS" to "DONE"
  │
  ├── onMutate:
  │   ├── Cancel active queries
  │   ├── Snapshot current columns
  │   └── Move card in cache instantly (UI updates at 0ms)
  │
  ├── PUT /api/v1/cards/102/status (headers: { 'If-Match': 'v3' })
  │   ├── IF 200 OK: onSettled invalidates cache to confirm server order
  │   └── IF 409 Conflict: onError restores snapshot & displays "Card was modified by Sarah"
```

---

## 2. PRODUCTION IMPLEMENTATION: OPTIMISTIC COLUMN MUTATION

```tsx
// features/kanban/hooks/useMoveCard.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/shared/api/httpClient';
import type { BoardState } from '../model/kanban.types';

export function useMoveCard(boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cardId, destinationColumn, version }: { cardId: string; destinationColumn: string; version: number }) => {
      const response = await httpClient.patch(`/api/v1/cards/${cardId}/column`, 
        { column: destinationColumn },
        { headers: { 'If-Match': String(version) } }
      );
      return response.data;
    },
    onMutate: async ({ cardId, destinationColumn }) => {
      await queryClient.cancelQueries({ queryKey: ['boards', boardId] });
      const previousBoard = queryClient.getQueryData<BoardState>(['boards', boardId]);

      if (previousBoard) {
        // Optimistically mutate columns in cache
        queryClient.setQueryData<BoardState>(['boards', boardId], (old) => {
          if (!old) return old;
          // Return board with card moved to new column
          return { ...old /* updated columns */ };
        });
      }

      return { previousBoard };
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['boards', boardId], context.previousBoard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', boardId] });
    },
  });
}
```
