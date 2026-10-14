# Magic Drinks

Site mobile-first para apresentar a carta Magic Drinks e coletar pedidos de orçamento para eventos.

## O que já funciona

- Catálogo filtrável de caips, drinks com álcool e sem álcool.
- Seleção de vários drinks que acompanha o formulário.
- Escolha de até cinco frutas para as caips.
- Formulário de evento com data, convidados, local, serviço de copos/taças e preferências.
- Pedido formatado e aberto no WhatsApp do Magic Drinks.
- Cliente acessa a carta e envia o pedido sem criar conta ou fazer login.
- Layout responsivo com identidade visual preta e dourada baseada no logo recebido.
- Pode ser instalado como PWA na tela inicial do celular e do computador, com os arquivos estáticos em cache para consulta offline.
- Estrutura SQL inicial para salvar pedidos, organizar eventos, lembretes e acompanhar os custos.
- Painel do proprietário com autenticação, agenda, pedidos, clientes, controle financeiro e exportação CSV.

## Arquivos

- `index.html`: estrutura e conteúdo da página.
- `styles.css`: layout responsivo.
- `app.js`: cardápio, seleção e montagem do pedido.
- `manifest.webmanifest`, `pwa.js` e `service-worker.js`: instalação e cache estático da PWA.
- `assets/app-icon.svg` e `assets/app-icon-192.svg`: ícones do aplicativo instalável.
- `assets/magic-drinks-logo.jpeg`: logo enviado pelo cliente.
- `supabase/schema.sql`: tabelas isoladas de pedidos, eventos, lembretes e resumo financeiro.
- `supabase/SETUP.md`: passos para criar e conectar o projeto Supabase dedicado.
- `supabase-config.js`: configuração pública do projeto Supabase dedicado (a preencher após criar o projeto).

## Dados e acessos

O cliente usa o site sem login. O formulário salva o orçamento no projeto Supabase exclusivo do Magic Drinks e abre uma mensagem pronta para o WhatsApp. A política de segurança permite ao público apenas inserir pedidos novos; consultar pedidos, eventos, lembretes e financeiro exige uma conta autorizada do proprietário. Este projeto não usa o banco do Metal & Forma nem o da Barbearia.

O painel do proprietário fica em `painel.html`. Depois que o e-mail do Marcos for definido, crie a conta dele no Supabase Auth e autorize o respectivo usuário na tabela `md_owners`, conforme `supabase/SETUP.md`.

## Instalar no celular

Publique em um endereço HTTPS. No Android, abra o site no Chrome e escolha **Instalar app** ou **Adicionar à tela inicial**. No iPhone, abra no Safari, toque em **Compartilhar** e escolha **Adicionar à Tela de Início**. O APK pode ser feito depois com Capacitor, se for necessário distribuir pela Play Store ou instalar fora do navegador; a PWA atende o uso atual com menos manutenção e atualizações automáticas pelo site.

O cache offline permite consultar a interface e a carta já carregada. Enviar orçamento pelo WhatsApp e usar o painel exige conexão com a internet.
