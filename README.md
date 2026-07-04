# Hifdh Companion

Sistema inteligente para memorização do Al-Qur'an, combinando as metodologias tradicionais de Hifdh com algoritmos modernos de repetição espaçada.

---

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript strict, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Banco:** PostgreSQL via Supabase
- **Algoritmo:** SM-2 adaptado + Urgency Scoring + DailyPlanGenerator

---

## Instalação

```bash
# 1. Clonar
git clone https://github.com/seu-usuario/hifdh-companion
cd hifdh-companion

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com sua string de conexão Supabase

# 4. Gerar client Prisma
npx prisma generate

# 5. Aplicar schema no banco
npx prisma db push

# 6. Rodar em desenvolvimento
npm run dev
```

---

## Estrutura

```
src/
├── app/              # Next.js App Router (páginas e API routes)
│   ├── (auth)/       # Login, Registro, Onboarding
│   ├── (student)/    # Dashboard, Hoje, Mushaf, Stats, Settings
│   ├── (teacher)/    # Painel Professor
│   └── api/          # REST API routes
│
├── domain/           # Núcleo puro (sem dependências externas)
│   ├── entities/     # PageMastery
│   ├── value-objects/# PageNumber, JuzNumber, MasteryLevel, ReviewGrade
│   └── services/     # SM2Algorithm, ForgettingCurve, UrgencyScoring,
│                     # DailyPlanGenerator, ReplanningEngine, ProgressCalculator
│
├── application/      # Casos de uso
│   ├── use-cases/    # GetDailyPlan, CompleteReview, MarkPageMemorized,
│   │                 # CreateHifdhPlan
│   └── ports/        # Interfaces de repositório
│
├── infrastructure/   # Implementações externas
│   ├── repositories/ # Prisma implementations
│   └── data/         # Dados estáticos Mushaf (604 páginas)
│
└── components/       # UI Components
    ├── ui/           # Button, Card, ProgressBar
    ├── dashboard/    # TodayCard, StreakWidget, StatRow, AlertBanner
    ├── session/      # TeacherRatingForm
    └── shared/       # PageStatusBadge, HifdhCalendar
```

---

## Algoritmo MuhaffadhEngine

O núcleo do sistema combina:

1. **Sabaq/Sabqi/Manzil** — metodologia tripartite verificada em todas as escolas islâmicas
2. **SM-2 adaptado** — intervalos de revisão personalizados por página
3. **Urgency Score** — prioriza páginas em risco (Ebbinghaus + erro histórico + avaliação do professor)
4. **Janela de Sabqi dinâmica** — cresce com o volume memorizado (tabela Subcontinente verificada)
5. **Bloqueio automático de Sabaq** — quando >30% das páginas têm risco alto de esquecimento
6. **Replanejamento inteligente** — redistribui faltas, nunca empurra o cronograma

---

## Testes

```bash
# Domain layer (puro, sem dependências externas)
npx ts-node tests/run_domain_tests.ts

# 38 testes passando ✅
```

---

## Deploy (Vercel)

```bash
# 1. Push para GitHub
git push origin main

# 2. Importar projeto no Vercel
# 3. Adicionar variável DATABASE_URL no Vercel Dashboard
# 4. Deploy automático
```

---

## Roadmap

- [ ] Autenticação completa com Better Auth
- [ ] Notificações push (Service Worker)
- [ ] Exportação PDF/Excel do progresso
- [ ] PWA / modo offline
- [ ] Painel dos pais
- [ ] Painel administrativo da madrassah
- [ ] Gamificação (streaks, badges, conquistas)
- [ ] Suporte RTL completo para árabe
- [ ] Reconhecimento de voz para recitação
- [ ] App mobile (React Native / Expo)
