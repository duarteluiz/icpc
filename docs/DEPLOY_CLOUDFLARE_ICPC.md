# Publicar a demonstração ICPC em www.luizduarte.pt/icpc/

## 1. Reutilizar o túnel existente

Não criar outro túnel, não abrir portas e não adicionar registos DNS para `/icpc`.
No Zero Trust, abrir o tunnel `obraflow-linux-private`, em **Published application routes** adicionar:

| Campo | Valor |
|---|---|
| Subdomain | `www` |
| Domain | `luizduarte.pt` |
| Path | `^/icpc(/.*)?$` |
| Service Type | `HTTP` |
| Service URL | `http://127.0.0.1:18089` |

**Atenção:** posicionar antes de qualquer catch-all para `www.luizduarte.pt`, sem apagar rotas existentes. Cloudflared preserva o caminho completo ao encaminhar para o serviço local.

## 2. Preparar o Docker no Ubuntu

```bash
cd ~/Projetos/icpc
git fetch origin
git checkout feat/icpc-presentation-mock-v01
git pull --ff-only origin feat/icpc-presentation-mock-v01
bash start.sh
docker compose ps
```

`start.sh` cria um `.env` local com palavra-passe de demonstração aleatória, se não existir; mantém a base ligada apenas à rede Docker e o serviço web em `127.0.0.1:18089`.

## 3. Modificações necessárias, já implementadas nesta branch

- `apps/web/vite.config.js`: `base: '/icpc/'` para JS/CSS ser servido por `/icpc/assets/...`.
- `apps/web/nginx/default.conf`: `/icpc` redireciona para `/icpc/`, `/icpc/` remove o prefixo apenas no servidor local, e `/icpc/api/` encaminha para o FastAPI.
- Assim, o Cloudflare apenas encaminha; o container sabe tratar o subcaminho. Não precisa de nova rota no Nginx do host.

## 4. Testes de ponta a ponta

```bash
curl -I http://127.0.0.1:18089/icpc/
curl -fsS http://127.0.0.1:18089/icpc/api/health
curl -I https://www.luizduarte.pt/icpc/
```

No navegador, abrir `https://www.luizduarte.pt/icpc/`, DevTools > Network e verificar se ficheiros `/icpc/assets/*.js` e `/icpc/assets/*.css` respondem com `200` e se os menus funcionam. Uma resposta `200` do HTML por si só não significa que o site funcionou.

Se a rota Cloudflare mostrar `502`, conferir `docker compose ps`, `docker compose logs web api` e `sudo systemctl status cloudflared`.

## 5. Segurança da demonstração

Este é um mock **sem autenticação Auth0 real nem autorização de backend**. O seletor Pastor/Mídias/Membro simula papéis para apresentação, não pode proteger áreas privadas. Não inserir dados de membros ou conteúdos sensíveis.

Para apresentar apenas a pessoas da igreja, criar em Cloudflare Zero Trust > Access > Applications uma aplicação **Self-hosted** com domínio/caminho `www.luizduarte.pt/icpc/*` e política **Allow** restrita aos e-mails autorizados. Validar também proteção de `/icpc` (sem barra) ou usar o redirecionamento para `/icpc/`; não dar acesso à totalidade de `www.luizduarte.pt`, pois contém outros serviços.

Quando a igreja aprovar, implementar o Auth0 com validação de permissões no FastAPI e controlos RGPD antes de disponibilizar a área de membros. Não usar as credenciais de demonstração para produção.

## 6. Referências

- Cloudflare Tunnel path forwarding: https://developers.cloudflare.com/tunnel/features/locally-managed-tunnels/configuration-file/
- Vite base: https://vite.dev/guide/build/#public-base-path
- Cloudflare Access path protection: https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/
