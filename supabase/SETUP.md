# Configuração do Supabase Magic Drinks

Use um projeto Supabase separado para que os pedidos, clientes e números do Magic Drinks não compartilhem tabelas com a Barbearia ou a Metal & Forma.

## Preparar o projeto

1. Crie um projeto novo no Supabase. Guarde a senha do banco em um gerenciador de senhas; não a coloque nos arquivos do site nem envie pelo chat.
2. No SQL Editor desse projeto novo, execute `schema.sql`.
3. Em Authentication, crie/convide a conta de acesso do proprietário e confirme o e-mail.
4. No SQL Editor, autorize a conta do proprietário. Substitua o e-mail:

```sql
insert into public.md_owners (user_id, email)
select id, email
from auth.users
where lower(email) = lower('EMAIL_DO_PROPRIETARIO');
```

5. Em Project Settings → API, copie a Project URL e a publishable key para `supabase-config.js`:

```js
window.MAGIC_DRINKS_SUPABASE = {
  url: "https://SEU_PROJECT_REF.supabase.co",
  publishableKey: "SUA_CHAVE_PUBLICAVEL"
};
```

A publishable key é destinada ao navegador; a segurança depende das políticas RLS criadas pelo schema. Nunca use `service_role`, secret keys ou senha do banco no frontend.

## Tabelas e acesso

- `md_quote_requests`: o formulário público pode inserir pedidos, mas apenas o proprietário autorizado pode consultar ou alterar os pedidos.
- `md_events`: eventos confirmados e campos de orçamento/custos.
- `md_reminders`: lembretes do proprietário.
- `md_event_finance`: resumo calculado de custos totais, valor final, falta receber e valor líquido.
- `md_owners`: lista de contas proprietárias autorizadas.

O formulário só grava no Supabase depois que URL e publishable key forem configuradas. Sem elas, o site encaminha o pedido ao WhatsApp e avisa que o pedido ainda não está salvo no banco.
