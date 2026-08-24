# Module 15.1 — The Enterprise Testing Pyramid & Behavioral Testing Philosophy

## 1. WHAT
- **The Modern Testing Trophy:** A distribution model that prioritizes **Integration Tests with Mock Service Worker (MSW)** over isolated unit tests and brittle E2E tests:
  - **End-to-End Tests (10%):** Playwright tests covering critical revenue paths (login $\rightarrow$ checkout $\rightarrow$ receipt).
  - **Integration Tests (60%):** React Testing Library + MSW testing real user interactions with real state and network layers.
  - **Unit Tests (25%):** Pure business logic, reducers, utility formatters, and Zod schemas.
  - **Static Analysis (5%):** TypeScript compiler strict mode and ESLint rules.
- **The Core Testing Law:** *"The more your tests resemble the way your software is used, the more confidence they can give you." — Kent C. Dodds*

```
                    THE MODERN TESTING TROPHY
                    
                        /\
                       /  \      10% End-to-End (Playwright)
                      / E2E\     Critical smoke tests & user flows
                     /------\
                    /        \   60% Integration (RTL + MSW)
                   /  INTEG   \  Components + Hooks + Real Network Mocks
                  /------------\
                 /  UNIT TESTS  \ 25% Pure functions, reducers, schemas
                /----------------\
               /  STATIC ANALYSIS \ 5% TypeScript + ESLint
              /────────────────────\
```

---

## 2. TESTING USER BEHAVIOR VS IMPLEMENTATION DETAILS

$$\begin{array}{|l|l|l|}
\hline
\textbf{Testing Target} & \textbf{❌ Implementation Detail (Brittle)} & \textbf{✅ User Behavior (Resilient)} \\ \hline
\text{Button Click} & \text{wrapper.find('button').prop('onClick')()} & \text{userEvent.click(screen.getByRole('button', \{ name: /submit/i \}))} \\ \hline
\text{State Check} & \text{expect(wrapper.state('count')).toBe(1)} & \text{expect(screen.getByText('Current Count: 1')).toBeInTheDocument()} \\ \hline
\text{Network Call} & \text{expect(axios.get).toHaveBeenCalledWith('/url')} & \text{expect(await screen.findByText('Order #9901')).toBeInTheDocument()} \\ \hline
\end{array}$$

---

## 3. EXPERT INTERVIEW QUESTIONS
1. *Why does testing internal component state (`wrapper.state()`) create brittle tests that break during refactoring?*
2. *Why should queries like `screen.getByRole` always be preferred over `screen.getByTestId` or CSS class selectors?*
3. *What is the cost vs confidence tradeoff between Playwright E2E tests and React Testing Library integration tests?*
