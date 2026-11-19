# Plano ICPC Digital (Kanban)

| Épico | Issues | Foco |
|---|---|---|
| #1 Identidade e UX | ICPC-001 a ICPC-006 | migração, marca, home, doutrina, navegação, SEO |
| #2 CMS | ICPC-007 a ICPC-013 | esquema editorial, pastor, mídias, sermões, estudos, ficheiros, aprovação |
| #3 Comunidade | ICPC-014 a ICPC-019 | agenda, ministérios, membros, moderação, oração, contactos |
| #4 Segurança | ICPC-020 a ICPC-023 | Auth0, RBAC, RGPD, hardening |
| #5 Infra & Autopilot | ICPC-024 a ICPC-028 | Docker, FastAPI/Postgres, CI, deploy, Codex |
| #6 Mock | ICPC-029 a ICPC-032 | mock navegável, simulação de perfis, aprovação da igreja |

## Entregas
1. Mock de apresentação: UI pública e painéis demonstrativos sem autenticação real.
2. MVP em staging: Auth0, RBAC FastAPI, PostgreSQL/Alembic, CMS, agenda e testes E2E.
3. Lançamento seguro: RGPD, aprovação de textos e media, backups, TLS e monitorização.
4. Evolução: newsletters opt-in, pesquisa, iCal/RSS, acessibilidade e analytics respeitadores de privacidade.

## Perfis
- visitante: leitura pública e contacto
- membro: conteúdo privado aprovado e comentários moderados
- midias: eventos, notícias e media dentro do fluxo de aprovação; sem gerir utilizadores ou doutrina
- pastor: acesso integral a recursos da aplicação, sem acesso automático à infraestrutura

## Pendências de validação pastoral
Horários, morada, contactos, logótipo, fotos autorizadas, conteúdo doutrinário, publicações, políticas e staging.
