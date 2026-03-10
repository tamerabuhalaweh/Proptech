# 🤖 AI Development Team — Agent Architecture

## Team Structure

### 🧠 Agent 0: **Orchestrator** (Main Session — YOU)
- **Role**: Project Manager / Tech Lead / Scrum Master
- **Responsibilities**:
  - Read Jira board, prioritize tasks, assign to agents
  - Review agent outputs before merging
  - Report progress to Tamer
  - Manage sprints and blockers
- **Tools**: Jira MCP (91 tools), Perplexity, all workspace access

---

### 🎨 Agent 1: **UIUX Designer**
- **Role**: UI/UX Design Lead
- **Responsibilities**:
  - Research top Proptech UI patterns (Yardi, Buildium, AppFolio)
  - Design component specifications (shadcn/ui based)
  - Create page layouts with Arabic RTL support
  - Generate design tokens, color palettes, typography
  - Write detailed UI specs for each Jira story
- **Tools**: Perplexity (research), Firecrawl (scrape competitor UIs)
- **Output**: `docs/ui-specs/*.md` files per component/page

---

### 💻 Agent 2: **Frontend Engineer**
- **Role**: Senior Frontend Developer
- **Responsibilities**:
  - Implement Next.js 15 pages and components
  - Build shadcn/ui component library
  - Implement RTL/LTR layout system
  - Connect API endpoints with TanStack Query
  - Write unit tests (Vitest + Testing Library)
- **Tools**: Code execution, filesystem
- **Output**: `apps/web/` source code

---

### ⚙️ Agent 3: **Backend Engineer**
- **Role**: Senior Backend Developer
- **Responsibilities**:
  - Design and implement NestJS API modules
  - Write Prisma schema and migrations
  - Implement multi-tenant data isolation
  - Build REST API endpoints with OpenAPI docs
  - Write integration tests (Jest + Supertest)
- **Tools**: Code execution, filesystem
- **Output**: `apps/api/` source code, `packages/db/`

---

### 🧪 Agent 4: **QA Engineer**
- **Role**: Quality Assurance Lead
- **Responsibilities**:
  - Review code from Agents 2 & 3
  - Write E2E tests (Playwright)
  - Validate API responses against specs
  - Check accessibility (a11y) and RTL compliance
  - Report bugs back to Jira
- **Tools**: Code execution, Jira MCP (create bugs)
- **Output**: `tests/` directory, Jira bug tickets

---

## Workflow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Jira Board │────>│ Orchestrator │────>│  Assign to   │
│  (Backlog)  │     │  (Agent 0)   │     │   Agents     │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    │                            │                            │
              ┌─────▼─────┐              ┌──────▼──────┐              ┌─────▼─────┐
              │  UIUX     │              │  Frontend   │              │  Backend  │
              │ Designer  │              │  Engineer   │              │  Engineer │
              │ (Agent 1) │              │  (Agent 2)  │              │ (Agent 3) │
              └─────┬─────┘              └──────┬──────┘              └─────┬─────┘
                    │                            │                            │
                    │ UI Specs                   │ Code                       │ Code
                    │                            │                            │
                    └────────────────────────────┼────────────────────────────┘
                                                 │
                                          ┌──────▼──────┐
                                          │     QA      │
                                          │  Engineer   │
                                          │  (Agent 4)  │
                                          └──────┬──────┘
                                                 │
                                          ┌──────▼──────┐
                                          │ Orchestrator│
                                          │   Review    │
                                          └──────┬──────┘
                                                 │
                                          ┌──────▼──────┐
                                          │  Jira Done  │
                                          └─────────────┘
```

## Sprint Process
1. **Sprint Planning**: Orchestrator picks top stories from backlog
2. **Design Phase**: UIUX Designer creates specs for selected stories
3. **Implementation**: Frontend + Backend work in parallel using specs
4. **QA Review**: QA validates output, creates bugs if needed
5. **Orchestrator Review**: Final check, merge, update Jira status
6. **Sprint Retrospective**: Log lessons learned

## Quality Gates
- [ ] UI spec reviewed before coding starts
- [ ] API contract defined before implementation
- [ ] All code has TypeScript strict mode
- [ ] Tests written alongside code (TDD where possible)
- [ ] RTL/Arabic tested for every UI component
- [ ] Jira ticket updated at each stage transition
