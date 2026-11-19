# ICPC Digital — Mock de Apresentação

**Igreja Cristã Presbiteriana da Covilhã** · protótipo demonstrativo, não publicado em produção.

Projeto de redesenho da ICPC, inspirado nas melhores práticas de comunicação e navegação de igrejas presbiterianas e batistas internacionais, preservando a doutrina, identidade, história e liderança da ICPC. Repositório: https://github.com/duarteluiz/icpc

## Como apresentar no computador

```bash
bash start.sh
# O script cria .env com palavra-passe aleatória, inicia Docker e mostra o URL
# Abrir http://localhost:18089
```

Se a porta 18089 estiver ocupada, mude `WEB_PORT` no `.env`. A porta está vinculada a `127.0.0.1` para **não expor a demo à internet**. Para mostrar no telemóvel da mesma rede, seria necessário criar um acesso temporário protegido e autorizado; não publicar a versão mock como serviço público.

Parar: `docker compose down`. Destruir dados da DB: `docker compose down -v`.

## Arquitetura

- `apps/web/`: Vue 3 + Vite, UI responsiva e interativa (sem persistência de edições do mock).
- `services/api/`: Python + FastAPI com healthcheck, readiness de Postgres e configuração pública de demonstração.
- `db`: PostgreSQL 17, isolado na rede Docker, **ainda sem tabelas da aplicação**.
- Auth0: **previsto, ainda NÃO configurado**. O seletor de perfis é uma simulação visual, não uma implementação de autenticação/autorização.

## Percurso para a apresentação

1. Abrir **Início**, mostrar mensagem acolhedora, horários oficiais publicados e acesso a quem visita.
2. Navegar até **Sermões**, **Estudos** e **Agenda** (conteúdos ilustrativos marcados como demo).
3. Clicar em **Área reservada**, selecionar **Pastor**, criar um estudo ou evento e ver o rascunho na lista da sessão.
4. Selecionar **Equipa de mídias**, mostrar que a gestão de sermões e utilizadores não aparece.
5. Selecionar **Membro**, mostrar a área privada e a interação em comentários.
6. Abrir as ferramentas de desenvolvimento do navegador em modo telemóvel, ou reduzir a janela para verificar o menu responsivo.

**NUNCA** usar o seletor demonstrativo de papéis como segurança real. Não introduzir dados reais de membros nem credenciais Auth0. A autorização real é uma fase posterior, no backend FastAPI, com verificação por request.

## Regras inegociáveis

- Português de Portugal; a formulação doutrinária e o conteúdo institucional necessitam de aprovação pastoral.
- Dados sobre pertença religiosa podem ser dados sensíveis ao abrigo do artigo 9.º do RGPD.
- Publicação de imagens de crianças só com autorização apropriada.
- Conteúdos demonstração não são sermões reais. Horários só são apresentados como publicados no site anterior, sujeitos a confirmação.
- Deploy de produção somente com aceite da igreja, Auth0 e RBAC reais, avaliação RGPD, TLS, backups, testes e revisão de segurança.

## GitHub + Codex

38 issues foram criadas: 6 epics + 32 tarefas. Consultar `docs/ROADMAP.md` e `AGENTS.md`. Fluidez pretendida: issue → branch → Codex → testes → PR → revisão → merge staging. **Não habilitar auto-merge/deploy de produção** até definir branch protection, aprovações e credenciais.