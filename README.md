# Cofrinho

App de finanças comportamentais: guardar primeiro, pensar antes de comprar, construir disciplina com gamificação.

> Não é controle financeiro. Não é banco. É um jogo contra o impulso.

## Stack

- Expo SDK 54 + Expo Router
- TypeScript, NativeWind 4, Zustand, React Query
- Supabase (Auth + Postgres + RLS)
- MMKV/AsyncStorage (cache local / modo offline)
- Reanimated, Skia/SVG, Victory Native XL

## Setup

```bash
npm install
cp .env.example .env
# Preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY
npx expo start
```

### Supabase

1. Crie um projeto no Supabase
2. Rode o SQL em [`supabase/schema.sql`](supabase/schema.sql)
3. Cole URL e anon key no `.env`

Sem `.env` válido o app roda em **modo local** (dados no dispositivo) para desenvolvimento.

## Scripts

- `npm start` — Expo
- `npm run android` / `ios` / `web`

## Splash screen

A splash nativa (fundo `#16A34A` + ícone) é configurada pelo plugin `expo-splash-screen` em `app.json`. Depois do hide, o app mostra a splash em JS (`SplashScreenView`) até o auth terminar.

**Importante:** a partir do SDK 52, o **Expo Go não aplica a imagem customizada** da splash (mostra o ícone do app). Para validar a splash nativa de verdade, use um binário próprio:

```bash
npx expo run:android
# ou
npx expo run:ios
```

Ou um release / EAS Build. Só então o fundo verde + porco centrado aparecem na abertura nativa.

## Estrutura

```
app/                 # rotas (telas finas)
src/
  components/ui/     # Design System
  features/          # (domínio por feature)
  services/          # supabase + api
  store/             # zustand
  theme/             # tokens
  utils/             # regras comportamentais
  providers/
supabase/schema.sql
```

## Fluxos principais

1. Onboarding → cadastro → setup (salário, payday, meta %, objetivo)
2. Home → Guardar / Registrar gasto / Missões / Cidade
3. Friction na compra → Esperar 24h → Modo Tentação
4. Cartão com alerta em 80%
5. XP, streak, conquistas, cidade, insights, retrospectiva
