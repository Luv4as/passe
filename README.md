# Passe
Lucas Gonçalves Venancio

## Execução com Docker Compose

Para iniciar somente o PostgreSQL no desenvolvimento local:

```bash
docker compose up -d db
```

Para construir e iniciar o banco, a API e a interface:

```bash
docker compose --profile full up -d --build
```

Os serviços ficam disponíveis em:

- Interface: http://localhost:3000
- API: http://localhost:5173
- PostgreSQL: localhost:5432

