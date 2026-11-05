# Guia de Configuração Comercial — Mentoria DEV+ | Daniel Brandão

Este documento descreve como configurar os links do checkout **ASAAS**, o número e mensagens do **WhatsApp**, os pixels de **Rastreamento (GA4 e Meta Pixel)** e os **Depoimentos Reais** na nova landing page comercial (`comercial.html`).

---

## 1. Arquitetura de Arquivos

- **Página Comercial (Venda Direta):** `mentoria/comercial.html`
- **Estilos da Página Comercial:** `mentoria/css/landing-comercial.css`
- **Configuração Central e Scripts (Checkout, WhatsApp, UTMs, Pixels):** `mentoria/js/comercial.js`
- **Webhook Backend/Serverless ASAAS:** `mentoria/api/asaas-webhook.js`
- **Exemplo de Variáveis de Ambiente:** `mentoria/.env.example`
- **Página de Diagnóstico Original (Preservada Intocada):** `mentoria/index.html` e `mentoria/css/landing.css`

---

## 2. Como Configurar o Número e Mensagens do WhatsApp

Abra o arquivo `mentoria/js/comercial.js` e localize o objeto `window.DEVPLUS_CONFIG`:

```javascript
whatsappNumber: "5583996866757",
```

- O número já está configurado com `5583996866757` (com DDI `55` + DDD `83`).
- Para alterar o número em toda a página (Hero, Cards de Planos, Ajuda, Modal de Checkout, FAQ e Rodapé), basta editar essa única variável.
- As mensagens pré-preenchidas de cada seção/plano estão em `whatsappMessages` logo abaixo e são codificadas automaticamente via `encodeURIComponent`.

---

## 3. Como Configurar os Links de Checkout do ASAAS

No arquivo `mentoria/js/comercial.js`, localize a chave `plans` dentro de `window.DEVPLUS_CONFIG`:

```javascript
plans: {
    start: {
        id: "devplus_start",
        // ...
        checkoutUrls: {
            avista: "https://www.asaas.com/c/SEU_LINK_START_AVISTA",
            parcelado: "https://www.asaas.com/c/SEU_LINK_START_PARCELADO",
            default: "https://www.asaas.com/c/SEU_LINK_START_GERAL"
        }
    },
    sprint: { ... },
    completa: {
        id: "devplus_completa",
        referencePriceFormatted: "R$ 1.997",
        priceCash: 1497,
        priceCashFormatted: "R$ 1.497",
        installmentText: "", // Ex: "ou em até 12x de R$ XXX,XX"
        checkoutUrls: {
            avista: "https://www.asaas.com/c/SEU_LINK_COMPLETA_AVISTA",
            parcelado: "https://www.asaas.com/c/SEU_LINK_COMPLETA_PARCELADO",
            default: ""
        }
    }
}
```

### Comportamento Inteligente dos Botões de Compra:
1. **Enquanto os links estiverem em branco (`""`):** Os botões de compra **não simulam um checkout quebrado**. Ao clicar, abre-se um modal transparente informando o plano e a condição escolhida e direcionando o visitante para receber o link de pagamento diretamente pelo WhatsApp.
2. **Assim que você preencher a URL do ASAAS:** O clique no botão dispara o evento `InitiateCheckout` e redireciona imediatamente o visitante para o checkout do ASAAS, anexando automaticamente os parâmetros `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `plan_id` e `payment_condition`.
3. **Parcelamento da DEV+ Completa:** O campo `installmentText` da `completa` está vazio por padrão para não inventar valores. Quando definir a condição parcelada, basta preencher `installmentText` (ex.: `"12x de R$ 199,70"`) que o card exibirá automaticamente.

---

## 4. Segurança e Webhook ASAAS (`api/asaas-webhook.js`)

- **Nunca coloque sua `$aact_...` (API Key do ASAAS) no arquivo `js/comercial.js`.**
- O arquivo `mentoria/api/asaas-webhook.js` está pronto para rodar em ambientes Serverless (Vercel, Netlify, Cloudflare Workers ou Node.js/Express).
- Configure no painel do ASAAS (**Integrações > Webhooks**) a URL do seu endpoint e defina o cabeçalho de segurança `asaas-access-token` igual à variável de ambiente `ASAAS_WEBHOOK_TOKEN`.
- O evento `Purchase` (compra confirmada) **não é disparado no navegador** por simples clique ou redirecionamento; deve ser disparado apenas quando o webhook confirmar `PAYMENT_CONFIRMED` ou `PAYMENT_RECEIVED`.

---

## 5. Como Configurar Google Analytics 4 (GA4) e Meta Pixel

No arquivo `mentoria/js/comercial.js`, preencha:

```javascript
tracking: {
    ga4MeasurementId: "G-XXXXXXXXXX",
    metaPixelId: "123456789012345"
}
```

Eventos rastreados automaticamente:
- `ViewContent`: Ao carregar a landing page comercial (com UTMs preservadas).
- `Contact`: Em qualquer clique nos botões de WhatsApp (identificando qual botão foi clicado: `geral`, `start`, `sprint`, `completa`, `escolhaPlano`, `faq`, `ctaFinal`).
- `InitiateCheckout`: Ao clicar no botão de contratação de qualquer plano (`devplus_start`, `devplus_sprint`, `devplus_completa`), enviando valor e condição escolhida.
- `Lead`: Ao solicitar atendimento assistido no modal de checkout.

