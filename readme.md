# Paluan Stock

Sistema de gestão de materiais, estoque e retalhos criado a partir de uma necessidade real de produção.

O **Paluan Stock** organiza materiais disponíveis, reservas, usuários e histórico operacional em uma interface simples, com foco em reduzir consultas manuais, retrabalho e perda de informação.

## O problema

Em operações de produção, materiais remanescentes podem ficar espalhados entre planilhas, anotações e conhecimento informal da equipe.

Isso dificulta perguntas simples:

- quais materiais ainda estão disponíveis?
- onde estão?
- qual quantidade ou medida resta?
- alguém já reservou esse material?
- quem realizou determinada operação?

O Paluan Stock nasceu para centralizar essas informações e tornar o processo mais rastreável.

## O que o sistema faz

Atualmente o projeto contempla:

- consulta de materiais e retalhos
- controle de disponibilidade
- reservas
- autenticação de usuários
- perfis e permissões
- área administrativa
- gerenciamento de usuários
- histórico e auditoria operacional
- atualização periódica dos dados

## Arquitetura

O projeto utiliza uma aplicação web em JavaScript conectada ao Supabase.

```text
Interface web
    ↓
JavaScript modular
    ↓
Supabase
├── Authentication
├── PostgreSQL
└── Edge Functions
```

Operações comuns são realizadas pelo cliente autenticado, enquanto ações administrativas específicas utilizam Edge Functions.

## Tecnologias

**Front-end**  
JavaScript · HTML · CSS

**Back-end & Dados**  
Supabase · PostgreSQL · Edge Functions

**Infraestrutura**  
Vercel · Supabase CLI

## Estrutura do projeto

```text
.
├── admin.html
├── index.html
├── login.html
├── settings.html
├── js/
│   ├── services/
│   ├── ui/
│   └── ...
├── supabase/
│   └── functions/
└── vercel.json
```

## Execução local

Instale as dependências:

```bash
npm install
```

Depois utilize um servidor HTTP local de sua preferência para servir os arquivos da aplicação.

O projeto depende de uma instância Supabase configurada para autenticação, banco de dados e funções utilizadas pelo sistema.

## Segurança

A chave `anon` do Supabase pode existir no cliente; ela não deve ser tratada como segredo.

A segurança da aplicação depende principalmente de:

- políticas de Row Level Security (RLS)
- autorização nas Edge Functions
- separação correta entre operações públicas e privilegiadas
- proteção da `service_role`, que nunca deve ser exposta no front-end

O código público representa uma implementação funcional em evolução. Antes de qualquer uso em produção, as políticas de acesso e autorização devem ser revisadas para o ambiente de destino.

## Origem

O projeto começou como uma ferramenta interna para consulta de retalhos e materiais disponíveis em ambiente de produção.

Com o tempo, evoluiu para um sistema mais amplo de gestão operacional e passou a integrar o ecossistema da **Paluan**.

## Status

**Em evolução.**

O sistema possui uma implementação funcional e continua sendo reorganizado, documentado e fortalecido tecnicamente.

---

**Paluan**  
Menos atrito. Mais resultado.
