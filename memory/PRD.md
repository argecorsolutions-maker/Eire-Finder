# PRD — Eire Finder Landing Page

## Original Problem Statement
Landing page em inglês britânico para "Eire Finder", extensão Chrome que adiciona um botão flutuante (estilo Grammarly) em anúncios do Daft.ie e MyHome.ie, abrindo um painel com: histórico de venda do Property Price Register, tempo real de anúncio, comparáveis da mesma rua e atalho de busca Google. Posicionamento: camada de inteligência sobre os anúncios (não é mais um portal). Preço: €1,99/mês via Stripe. Secções: Hero, Problema, Como funciona, Mockup do painel, Preço, FAQ, Footer. Restrição técnica: HTML/CSS/JS simples, sem framework pesado (código será extraído e hospedado manualmente). Paleta: verde #0f5132, fundo claro neutro, tipografia SaaS/fintech limpa, sem clichés de imóveis.

## Architecture
- Frontend: 100% estático e extraível — `/app/frontend/public/index.html` + `styles.css` + `script.js` + `favicon.svg` (vanilla JS, sem frameworks; Lenis via CDN opcional com fallback nativo). Servido pelo dev-server CRA do template (React neutralizado: App.js retorna null).
- Backend: FastAPI (`/app/backend/server.py`) — endpoint `POST /api/waitlist` (validação EmailStr, dedup por email, grava em MongoDB `waitlist` via Motor, MONGO_URL/DB_NAME do .env).
- Design: estética "Official Registry Ledger" — pergaminho #FBF9F5, verde trevo #0F5132, selo dourado #C59B27, Cabinet Grotesk (títulos, Fontshare), DM Sans (corpo), JetBrains Mono (dados), Newsreader italic (acentos).

## User Personas
1. Comprador de primeira casa na Irlanda — quer transparência antes de oferecer.
2. Investidor imobiliário — quer histórico e comparáveis de rua rapidamente.

## Core Requirements (static)
- British English em todo o copy (whilst, organise, etc.)
- Secções: Hero com CTA "Add to Chrome" → waitlist; Problema (3 bullets); Como funciona (4 passos); Mockup CSS do painel flutuante; Preço €1,99/mês (card único, botão placeholder); FAQ (5 perguntas incl. as 3 obrigatórias); Footer com info@eirefinder.ie
- Mobile-first, sem imagens de banco de imagem

## Implemented (2026-09-13)
- [x] Página completa em HTML/CSS/vanilla JS extraível (hero com reveal mascarado linha a linha + selo "Property Price Register" animado no load; marquee editorial lenta; capítulos numerados 01-06; mockup do painel com spotlight e parallax; tilt no hero; reveals via IntersectionObserver; respeito a prefers-reduced-motion)
- [x] `POST /api/waitlist` com gravação real em MongoDB (dedup idempotente, validação de email)
- [x] Formulário waitlist E2E: valida, submete, mostra sucesso e esconde o formulário
- [x] data-testid em todos os elementos interativos/críticos
- [x] Favicon SVG próprio (lente + ponto dourado)
- [x] Verificado: curl (API + assets 200), screenshots desktop 1440px e mobile 390px, sem overflow horizontal

## Backlog / Prioridades
- P0: Ligar Stripe checkout real ao botão de assinatura (substituir placeholder #waitlist)
- P1: Publicar extensão na Chrome Web Store e apontar CTAs ao link real
- P1: Painel com dados reais (match PPR por endereço)
- P2: Contador público de inscritos na waitlist; versões adicionais do site (ex.: polaco/português); blog/recursos

## Next Tasks
1. Integração Stripe (playbook via integration_expert; usar chave de teste do pod)
2. Actualizar link "Add to Chrome" quando publicado
3. Emails transaccionais de lançamento (Resend gerido pela Emergent)
