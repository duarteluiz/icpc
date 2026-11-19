# ICPC Digital — Arquitetura proposta v1

> **Estado:** especificação para o MVP. A branch de mock implementa apenas a interface demonstrativa, API pública de configuração e a infraestrutura básica.

## 1. Objetivo

Desenvolver uma plataforma fácil de utilizar para a Igreja Cristã Presbiteriana da Covilhã, preservando a sua identidade reformada, em português de Portugal, com acesso público, área privada para membros e painéis editoriais separados.

## 2. Stack e serviços

| Camada | Tecnologia | Objetivo |
|---|---|---|
| Interface | Vue 3 + Vite + TypeScript | Navegação, CMS responsivo, componentes acessíveis |
| API | Python 3.12+ / FastAPI | Endpoints públicos e privados, validação de permissões |
| Dados | PostgreSQL 17 + Alembic | Persistência relacional, migrações versionadas |
| Identidade | Auth0 | Login OIDC, autenticação multifator, tokens e RBAC |
| Cache/queue | Opcional depois do MVP | Não introduzir Redis sem necessidade real |
| Ficheiros | Object storage S3-compatible | Fotos, PDFs e media autorizada |
| Media | YouTube/Vimeo/Spotify links | Preferir incorporar a alojar vídeos grandes |
| Infraestrutura | Docker Compose + proxy reverso HTTPS | Staging e eventual produção, com backups |
| QA | GitHub Actions, pytest, Ruff, Vite, Playwright | Qualidade automática antes de merge |

## 3. Separação das permissões

**Visitante**: conteúdos públicos, contacto e navegação; sem acesso a recursos internos.

**Membro**: acesso a avisos reservados, eventos internos e comentários moderados. O registo de identidade Auth0 não implica aprovação como membro — a igreja deve validar essa condição.

**Equipa de mídias**: criar e editar eventos, notícias, imagens e comunicados dentro de um fluxo editorial. Não pode gerir utilizadores, atribuir papéis, aceder a pedidos confidenciais nem alterar a doutrina.

**Pastor**: aprovar, publicar e gerir todos os recursos administrativos da aplicação; visualizar trilha de auditoria; atribuir funções sujeitas a controlo administrativo. **Não** tem acesso automático às credenciais Auth0, base de dados, Docker ou servidor.

### Matriz operacional proposta

| Permissão | Visitante | Membro | Mídias | Pastor |
|---|:---:|:---:|:---:|:---:|
| Leitura pública | ✓ | ✓ | ✓ | ✓ |
| Leitura reservada | — | ✓ | ✓ | ✓ |
| Criar rascunhos de sermões/estudos | — | — | — | ✓ |
| Criar rascunhos de eventos/notícias | — | — | ✓ | ✓ |
| Publicar doutrina e sermões | — | — | — | ✓ |
| Publicar eventos/notícias | — | — | Sob regras | ✓ |
| Gerir membros e papéis | — | — | — | ✓ |
| Comentar | — | ✓ | ✓ | ✓ |
| Moderar comentários | — | — | Moderador designado | ✓ |
| Pedidos de oração privados | — | Próprios | — | Acesso autorizado |

Todas as decisões devem ser implementadas **na API**, não apenas ocultando botões no Vue.

## 4. Autenticação Auth0

- Vue utiliza OIDC Authorization Code + PKCE para início de sessão (Auth0 Vue SDK).
- Cada chamada privada envia access token de curta duração emitido para o audience específico da API.
- FastAPI valida assinatura usando JWKS, `iss`, `aud`, `exp` e os algoritmos permitidos; não aceitar `alg=none` nem tokens de ID como autorização da API.
- Mapear claims e permissões `read:members`, `manage:events`, `manage:sermons`, `publish:sermons`, `manage:users` a operações específicas.
- MFA para pastor e equipa de mídias; fluxos de convite e revogação; logs de falhas e alterações de permissões.
- Não guardar senhas no Postgres. O identificador externo `auth0_sub` é referenciado por uma tabela local de perfis mínimos.
- O seletor de perfis do mock deverá ser removido da aplicação antes de qualquer produção.

## 5. Modelo de dados inicial

- `app_users`: id UUID, auth0_sub único, nome de apresentação opcional, estado, created_at, updated_at.
- `memberships`: id, user_id, state (`pending|approved|revoked`), approved_by, approved_at; acessível apenas aos responsáveis.
- `roles`, `user_roles`: associação de permissões auditáveis (sincronizada com a identidade).
- `content_items`: id, kind (`sermon|study|article|news`), title, slug único, summary, body, status, visibility, author_id, published_at, created_at, updated_at.
- `content_versions`: content_id, version, editor_id, body, created_at.
- `scripture_references`: content_id, book, chapter_from, verse_from, chapter_to, verse_to.
- `sermon_series`: id, title, description; `sermon_metadata`: content_id, series_id, preacher, media_url, service_date.
- `events`: id, title, starts_at timestamptz, ends_at, location, visibility, recurrence_rule opcional, status, created_by.
- `media_assets`: id, storage_key, mime, bytes, alt_text, author_credit, consent_record_ref quando aplicável.
- `comments`: id, content_id, author_id, body, status (`pending|approved|hidden|removed`), moderated_by, timestamps.
- `consent_records`: user_id, purpose, lawful_basis, version, action, recorded_at; acesso altamente restrito.
- `audit_log`: actor_id, action, resource, time, metadata minimizada, request_id.

**Regra:** nenhuma tabela privada é exposta pela API pública. Respostas privadas são filtradas por permissões e ownership. Datas são guardadas em UTC; apresentação no fuso `Europe/Lisbon`.

## 6. Endpoints (rascunho)

Públicos: `GET /api/v1/public/config`, `/sermons`, `/sermons/{slug}`, `/studies`, `/articles`, `/events`, `/church`, `/search`.

Privados de membro: `GET /api/v1/me`, `/member/notices`, `POST /comments`, `GET /my-comments`.

Editoriais: `POST/PATCH /admin/content`, `POST /admin/content/{id}/submit`, `POST /admin/content/{id}/publish`, `POST/PATCH /admin/events`, `/admin/media`, `/admin/comments`.

Pastor: `GET/PATCH /admin/memberships`, `/admin/roles`, `GET /admin/audit`.

API inclui paginação, filtros, validação com Pydantic, sanitização HTML, limitações de upload, ratelimits e erros padronizados.

## 7. Fluxo editorial

1. Pastor ou mídias cria um **rascunho**; não fica público.
2. Editor pré-visualiza e submete para **revisão**.
3. Pastor (ou pessoa autorizada para eventos/notícias) **aprova** e agenda/publica.
4. Sistema regista data, autor, revisor e versão; permite despublicar e restaurar.
5. Comentários seguem moderação adequada; reportes ficam em fila.

Conteúdos teológicos/sermões exigem revisão pastoral. Não permitir publicação por função de mídias nessas categorias.

## 8. RGPD, privacidade, crianças

Informação de pertença religiosa pode identificar convicções religiosas e é potencialmente uma categoria especial de dados (art. 9.º do RGPD). Antes da operação do site com membros reais, a igreja deve definir finalidade, fundamento jurídico, eventual exceção do artigo 9.º, responsabilidades, retenção, informação aos titulares, direitos de acesso/apagamento, transferências internacionais de serviços terceiros e medidas adequadas.

Adotar privacy by design; campos mínimos; conteúdo privado por defeito; controlo de publicações de menores; autorização de imagem; política de remoção; backups cifrados; registos de auditoria; avaliar necessidade de DPIA. Pedidos de oração frequentemente contêm informação sensível e **não** devem ser públicos por predefinição.

## 9. Ambientes e backup

- `local`: mock isolado, dados fictícios e seletor de perfis sem autenticação.
- `staging`: ambiente privado com Auth0 tenant de teste, DB separada, testes e aprovação pastoral.
- `production`: domínio aprovado, TLS, acesso via reverse proxy com headers, DB sem porta pública, backups cifrados e ensaio periódico de restore.
- Integração Cloudflare apenas depois de confirmar DNS, propriedade do domínio e políticas da igreja. Não substituir o site existente sem plano de transição.

## 10. GitHub + Codex autónomo

Issue priorizada → branch `codex/icpc-NNN-...` → implementação Codex → build/testes → PR → checks → revisão e merge para staging. `AGENTS.md` define as salvaguardas. Pode automatizar merge de alterações técnicas apenas com CI verde e regras de branch protection; **publicação de doutrina, alterações RGPD, Auth0, migração destrutiva e deploy de produção exigem aprovação humana**.

## 11. Acessibilidade e performance

Objetivo WCAG 2.2 AA; menu por teclado, foco visível, contraste, leitor de ecrã, reduced motion, responsividade a 320 px, carregamento diferido de media, SEO e bons Core Web Vitals. A interface deve servir voluntários sem experiência técnica no telemóvel.

## 12. Referências

- Site ICPC: https://www.presbiterianos-covilha.pt/index.htm
- ICPC sobre: https://www.presbiterianos-covilha.pt/about.htm
- ICPC liderança: https://www.presbiterianos-covilha.pt/leadership.htm
- ICPC programação: https://www.presbiterianos-covilha.pt/schedule.htm
- Redeemer Downtown: https://redeemerdt.com/
- Convenção Baptista Portuguesa: https://convencaobaptista.pt/
- Primeira Igreja Evangélica Baptista de Viseu: https://primeiraigrejabaptistaviseu.pt/
- Auth0 FastAPI RBAC: https://developer.auth0.com/resources/code-samples/api/fastapi/basic-role-based-access-control
- Proteção de dados especiais: https://www.uc.pt/protecao-de-dados-e-informacao-administrativa/protecao-de-dados-pessoais/categorias-especiais-de-dados/