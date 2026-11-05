/**
 * ============================================================================
 * SERVERLESS / BACKEND HANDLER — ASAAS WEBHOOK & VALIDAÇÃO DE PAGAMENTOS
 * ============================================================================
 * Requisitos de Segurança atendidos (Seção 7 de mentoria2.md):
 * - Nunca expõe a API Key do ASAAS no frontend.
 * - Valida o token de autenticação do webhook (asaas-access-token).
 * - Trata os status de cobrança: pendente, confirmado/recebido, vencido e cancelado.
 * - Prepara integração com cadastro/onboarding do mentorado e disparo confiável
 *   de evento server-side (Purchase) apenas após confirmação real do pagamento.
 */

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    // 1. Validação do Token de Segurança do Webhook ASAAS
    const expectedWebhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
    const receivedToken = req.headers["asaas-access-token"];

    if (!expectedWebhookToken || receivedToken !== expectedWebhookToken) {
        return res.status(401).json({ error: "Unauthorized webhook signature" });
    }

    const payload = req.body || {};
    const { event, payment } = payload;

    if (!event || !payment || !payment.id) {
        return res.status(400).json({ error: "Invalid webhook payload" });
    }

    try {
        // 2. Consulta opcional à API do ASAAS no backend para dupla verificação do status real
        // Nunca confiar apenas em retorno de URL no navegador do cliente.
        const asaasApiKey = process.env.ASAAS_API_KEY;
        const asaasBaseUrl = process.env.ASAAS_API_URL || "https://api.asaas.com/v3";

        let verifiedPayment = payment;
        if (asaasApiKey) {
            const verifyResponse = await fetch(`${asaasBaseUrl}/payments/${encodeURIComponent(payment.id)}`, {
                method: "GET",
                headers: {
                    "access_token": asaasApiKey,
                    "Content-Type": "application/json"
                }
            });
            if (verifyResponse.ok) {
                verifiedPayment = await verifyResponse.json();
            }
        }

        // Identificação do plano via externalReference (devplus_start | devplus_sprint | devplus_completa)
        const planId = verifiedPayment.externalReference || "devplus_plano";

        // 3. Tratamento por status do evento de pagamento
        switch (event) {
            case "PAYMENT_Created":
            case "PAYMENT_UPDATED":
                // Pagamento pendente / aguardando compensação
                await handlePendingPayment(verifiedPayment, planId);
                break;

            case "PAYMENT_CONFIRMED":
            case "PAYMENT_RECEIVED":
                // Pagamento confirmado! Libera onboarding e registra conversão Purchase real
                await handleConfirmedPayment(verifiedPayment, planId);
                break;

            case "PAYMENT_OVERDUE":
                // Pagamento vencido
                await handleOverduePayment(verifiedPayment, planId);
                break;

            case "PAYMENT_DELETED":
            case "PAYMENT_REFUNDED":
                // Pagamento cancelado ou estornado
                await handleCanceledPayment(verifiedPayment, planId);
                break;

            default:
                break;
        }

        return res.status(200).json({ received: true, event, paymentId: verifiedPayment.id });
    } catch (error) {
        console.error("[ASAAS Webhook Error]", error);
        return res.status(500).json({ error: "Internal Server Error processing webhook" });
    }
}

async function handlePendingPayment(payment, planId) {
    // Registro de cobrança aguardando pagamento (PIX/Boleto gerado)
    console.log(`[ASAAS] Pagamento pendente (${payment.id}) para o plano ${planId}`);
}

async function handleConfirmedPayment(payment, planId) {
    // 1. Evitar duplicidade verificando se payment.id já foi processado no banco de dados
    // 2. Liberar acesso / disparar onboarding do mentorado (ex: envio de boas-vindas e Missão Zero)
    // 3. Disparar evento Purchase confiável via Meta Conversions API / GA4 Measurement Protocol
    console.log(`[ASAAS] Pagamento CONFIRMADO (${payment.id}) - Plano: ${planId} - Valor: R$ ${payment.value}`);
}

async function handleOverduePayment(payment, planId) {
    console.log(`[ASAAS] Pagamento VENCIDO (${payment.id}) - Plano: ${planId}`);
}

async function handleCanceledPayment(payment, planId) {
    console.log(`[ASAAS] Pagamento CANCELADO/ESTORNADO (${payment.id}) - Plano: ${planId}`);
}

