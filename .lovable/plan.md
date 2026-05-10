## Objetivo

Garantir que o nome da marca apareça visualmente sempre no mesmo formato das logos em PDF:

- **Inline (corrido):** `PEDROSA — SANTÉ` (caixa alta, com travessão entre as palavras)
- **Empilhado (quando houver espaço vertical, ex: heros e citações):**
  ```text
  PEDROSA
  ———
  SANTÉ
  ```

Nunca permitir as variações erradas: `PEDROSASANTÉ` ou `Pedrosa Santé` em destaque visual.

## O que será alterado

### 1. Novo componente `src/components/BrandName.tsx`
Componente único reutilizável com duas variantes:
- `variant="inline"` → renderiza `PEDROSA — SANTÉ` em uma linha, com tracking amplo, fonte DM Sans, caixa alta.
- `variant="stacked"` → renderiza `PEDROSA` / traço / `SANTÉ` em três linhas centradas.
- Aceita `className` para herdar tamanho/cor da seção onde for usado.
- Acessibilidade: `aria-label="Pedrosa Santé"` para leitores de tela continuarem lendo natural.

### 2. Substituições no conteúdo visível das páginas

Trocar o texto `Pedrosa Santé` exibido como wordmark por `<BrandName />`:

| Arquivo | Linha | Uso atual | Nova variante |
|---|---|---|---|
| `src/pages/QuemSomos.tsx` | 39 | eyebrow "Pedrosa Santé" | inline |
| `src/pages/QuemSomos.tsx` | 157 | título de timeline "A Pedrosa Santé" | inline (mantém "A " + componente) |
| `src/pages/QuemSomos.tsx` | 210 | parágrafo missão | inline |
| `src/pages/QuemSomos.tsx` | 270 | citação final | inline (com "A " antes) |
| `src/pages/Index.tsx` | 91 | tag "Pedrosa Santé · Caruaru-PE" | inline + " · Caruaru-PE" |
| `src/pages/ParaVoce.tsx` | 26 | parágrafo descritivo | inline |
| `src/components/Footer.tsx` | 19 | copyright | inline |

Heros que já usam a logo SVG/PNG (Navbar, hero do Index com logo) **não mudam** — já estão corretos.

### 3. Onde NÃO mudar
Manter como `Pedrosa Santé` (linguagem natural / metadados / mensagens):
- `index.html` (title, meta tags, og)
- `alt=""` de imagens
- Texto em recibos/PDFs administrativos (`AdminFinanceiro.tsx`)
- Mensagens de WhatsApp (`WhatsAppButton.tsx`, `Contato.tsx`)
- Texto em e-mail/convite (`ConviteCadastro.tsx`)
- Tooltips de webhook (`AdminConfiguracoes.tsx`)
- Bio "Fundadora da Pedrosa Santé" (texto biográfico fluido)

### 4. Memória de projeto
Atualizar `mem://index.md` com a regra:
> Wordmark sempre renderizado via `<BrandName />` como `PEDROSA — SANTÉ` (inline) ou empilhado. Nunca `PEDROSASANTÉ` nem `Pedrosa Santé` como destaque visual.

## Detalhes técnicos

- O componente usa `font-display` (DM Sans) já existente no Tailwind config.
- Tracking: `tracking-[0.15em]` inline, `tracking-[0.3em]` stacked, espelhando o ritmo das logos.
- Travessão: caractere `—` (em dash) com espaços, não hífen `-`.
- Sem alterações no backend, rotas ou lógica de negócio.

Confirma a abordagem? Posso prosseguir e implementar.