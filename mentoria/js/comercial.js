/**
 * ============================================================================
 * CONFIGURAÇÃO CENTRAL — MENTORIA DEV+ | DANIEL BRANDÃO
 * ============================================================================
 * Centraliza número de WhatsApp, mensagens personalizadas, links de checkout
 * do ASAAS, opções de parcelamento, IDs de rastreamento (GA4 / Meta Pixel)
 * e depoimentos autorizados.
 */
window.DEVPLUS_CONFIG = {
    // 1. INTEGRAÇÃO WHATSAPP (variável central única)
    whatsappNumber: "5583996866757",

    whatsappMessages: {
        geral: "Olá! Conheci a Mentoria DEV+ pelo site e gostaria de tirar algumas dúvidas sobre o método e os planos.",
        start: "Olá! Tenho interesse no DEV+ Start. Gostaria de saber mais sobre o que está incluído.",
        sprint: "Olá! Tenho interesse no DEV+ Sprint. Gostaria de entender melhor o acompanhamento.",
        completa: "Olá! Tenho interesse na DEV+ Completa. Gostaria de saber como funciona o acompanhamento de 12 meses.",
        escolhaPlano: "Olá! Estou na página da Mentoria DEV+ e gostaria de ajuda para identificar qual plano (Start, Sprint ou Completa) é mais adequado para o meu momento.",
        faq: "Olá! Li as perguntas frequentes da Mentoria DEV+ e gostaria de tirar uma dúvida específica.",
        ctaFinal: "Olá! Quero construir minha carreira em tecnologia com a Mentoria DEV+, mas ainda tenho algumas dúvidas antes de entrar."
    },

    // 2. PLANOS E INTEGRAÇÃO ASAAS CHECKOUT
    // Quando os links de pagamento do ASAAS estiverem gerados, basta colá-los nos campos checkoutUrls.
    // Enquanto estiverem vazios (""), o sistema informa de forma transparente e direciona ao atendimento no WhatsApp.
    plans: {
        start: {
            id: "devplus_start",
            name: "DEV+ Start",
            tier: "ENTRADA",
            duration: "90 dias de acesso",
            priceCash: 497,
            priceCashFormatted: "R$ 497",
            installmentText: "ou em até 6x de R$ 95,90",
            checkoutUrls: {
                avista: "",      // Ex: "https://www.asaas.com/c/..."
                parcelado: "",   // Ex: "https://www.asaas.com/c/..."
                default: ""
            }
        },
        sprint: {
            id: "devplus_sprint",
            name: "DEV+ Sprint",
            tier: "INTERMEDIÁRIO",
            duration: "180 dias de acesso",
            priceCash: 997,
            priceCashFormatted: "R$ 997",
            installmentText: "ou em até 12x de R$ 99,90",
            checkoutUrls: {
                avista: "",      // Ex: "https://www.asaas.com/c/..."
                parcelado: "",   // Ex: "https://www.asaas.com/c/..."
                default: ""
            }
        },
        completa: {
            id: "devplus_completa",
            name: "DEV+ Completa",
            tier: "PRINCIPAL OFERTA",
            duration: "12 meses de acesso",
            referencePriceFormatted: "R$ 1.997",
            priceCash: 1497,
            priceCashFormatted: "R$ 1.497",
            // Configurável: preencha quando definir a condição parcelada da Completa (não inventar valor)
            installmentText: "",
            checkoutUrls: {
                avista: "",      // Link ASAAS condição à vista (R$ 1.497)
                parcelado: "",   // Link ASAAS condição parcelada (preço de referência R$ 1.997)
                default: ""
            }
        }
    },

    // Endpoint opcional de backend/serverless para criar cobrança dinâmica no ASAAS sem expor API Key
    dynamicCheckoutEndpoint: "", // Ex: "/api/asaas-checkout"

    // 3. RASTREAMENTO E CAMPANHAS (GA4 & META PIXEL)
    // Preencha apenas com seus IDs reais de produção ou injete via variáveis de ambiente no build
    tracking: {
        ga4MeasurementId: "", // Ex: "G-XXXXXXXXXX"
        metaPixelId: ""       // Ex: "123456789012345"
    },

    // 4. DEPOIMENTOS REAIS AUTORIZADOS
    // Enquanto a lista estiver vazia, a seção fica oculta automaticamente para não exibir dados fictícios.
    testimonials: [
        /* Exemplo de estrutura para cadastrar quando houver autorização:
        {
            name: "Nome do Mentorado",
            photo: "",
            plan: "DEV+ Completa",
            initialSituation: "Em transição de carreira, estudando sem direção",
            evolution: "Estruturou portfólio prático e conquistou primeira oportunidade como Dev Júnior",
            quote: "Depoimento real autorizado pelo mentorado..."
        }
        */
    ]
};

(function () {
    "use strict";

    const config = window.DEVPLUS_CONFIG;

    // =========================================================================
    // 1. CAPTURA E PRESERVAÇÃO DE UTMs
    // =========================================================================
    const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"];

    function captureUtms() {
        const params = new URLSearchParams(window.location.search);
        const stored = getStoredUtms();
        let updated = false;

        UTM_KEYS.forEach((key) => {
            if (params.has(key) && params.get(key)) {
                stored[key] = params.get(key);
                updated = true;
            }
        });

        if (updated) {
            try {
                sessionStorage.setItem("devplus_utms", JSON.stringify(stored));
            } catch (e) {
                // Ignora se sessionStorage estiver bloqueado
            }
        }
        return stored;
    }

    function getStoredUtms() {
        try {
            const raw = sessionStorage.getItem("devplus_utms");
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function appendUtmsToUrl(baseUrl, extraParams = {}) {
        if (!baseUrl) return "";
        try {
            const url = new URL(baseUrl, window.location.origin);
            const utms = getStoredUtms();
            Object.entries(utms).forEach(([k, v]) => {
                if (v && !url.searchParams.has(k)) {
                    url.searchParams.set(k, v);
                }
            });
            Object.entries(extraParams).forEach(([k, v]) => {
                if (v) url.searchParams.set(k, v);
            });
            return url.toString();
        } catch (e) {
            return baseUrl;
        }
    }

    // =========================================================================
    // 2. GERADOR CENTRAL DE LINKS DO WHATSAPP
    // =========================================================================
    function buildWhatsAppUrl(messageText) {
        const cleanNumber = String(config.whatsappNumber || "").replace(/\D/g, "");
        const encodedText = encodeURIComponent(messageText || config.whatsappMessages.geral);
        return `https://wa.me/${cleanNumber}?text=${encodedText}`;
    }

    function hydrateWhatsAppLinks() {
        const waElements = document.querySelectorAll("[data-wa-key]");
        waElements.forEach((el) => {
            const key = el.getAttribute("data-wa-key");
            const customMsg = el.getAttribute("data-wa-custom");
            const message = customMsg || config.whatsappMessages[key] || config.whatsappMessages.geral;
            el.setAttribute("href", buildWhatsAppUrl(message));
            el.setAttribute("target", "_blank");
            el.setAttribute("rel", "noreferrer noopener");

            el.addEventListener("click", () => {
                trackEvent("Contact", {
                    contact_channel: "whatsapp",
                    message_context: key || "custom",
                    utms: getStoredUtms()
                });
            });
        });
    }

    // =========================================================================
    // 3. RASTREAMENTO DE EVENTOS (GA4 & META PIXEL)
    // Nota de Segurança: O evento Purchase NÃO é disparado no clique ou URL
    // de retorno; depende exclusivamente de confirmação via backend/webhook.
    // =========================================================================
    function initTrackingScripts() {
        const { ga4MeasurementId, metaPixelId } = config.tracking;

        if (ga4MeasurementId && !window.gtag) {
            const s = document.createElement("script");
            s.async = true;
            s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4MeasurementId)}`;
            document.head.appendChild(s);

            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { window.dataLayer.push(arguments); };
            window.gtag("js", new Date());
            window.gtag("config", ga4MeasurementId);
        }

        if (metaPixelId && !window.fbq) {
            /* eslint-disable */
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            /* eslint-enable */
            window.fbq("init", metaPixelId);
        }

        // Dispara visualização da página comercial
        trackEvent("ViewContent", {
            content_name: "Landing Page Comercial Mentoria DEV+",
            content_category: "Mentoria Carreira Tech",
            utms: getStoredUtms()
        });
    }

    function trackEvent(eventName, payload = {}) {
        // Nunca disparar Purchase diretamente pelo frontend sem validação de backend
        if (eventName === "Purchase") {
            console.warn("[Tracking] Evento Purchase bloqueado no client-side sem confirmação de webhook.");
            return;
        }

        const eventData = Object.assign({ timestamp: new Date().toISOString() }, payload);

        if (typeof window.fbq === "function") {
            window.fbq("track", eventName, eventData);
        }

        if (typeof window.gtag === "function") {
            window.gtag("event", eventName, eventData);
        }

        // Registro local para auditoria/debug
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: eventName, ...eventData });
    }

    // =========================================================================
    // 4. CHECKOUT ASAAS E FALLBACK TRANSPARENTE
    // =========================================================================
    function hydratePlanInstallmentConfig() {
        const completaInstallmentEl = document.getElementById("completa-installment-display");
        if (completaInstallmentEl) {
            if (config.plans.completa.installmentText && config.plans.completa.installmentText.trim() !== "") {
                completaInstallmentEl.innerHTML = `<strong>Parcelamento:</strong> ${config.plans.completa.installmentText}`;
            } else {
                completaInstallmentEl.innerHTML = `Opção de parcelamento disponível conforme condição escolhida`;
            }
        }
    }

    function setupPlanCheckoutButtons() {
        const buyButtons = document.querySelectorAll("[data-plan-checkout]");
        const modalBackdrop = document.getElementById("checkout-modal-backdrop");
        const modalCloseBtn = document.getElementById("checkout-modal-close");
        const modalPlanName = document.getElementById("modal-plan-name");
        const modalPlanDuration = document.getElementById("modal-plan-duration");
        const modalPlanCondition = document.getElementById("modal-plan-condition");
        const modalWhatsappBtn = document.getElementById("modal-whatsapp-continue");

        buyButtons.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const planKey = btn.getAttribute("data-plan-checkout");
                const plan = config.plans[planKey];
                if (!plan) return;

                const selector = document.querySelector(`select[data-condition-for="${planKey}"]`);
                const condition = selector ? selector.value : "avista";
                const conditionLabel = condition === "parcelado" ? "Parcelado no cartão" : "À vista (PIX / Boleto / Cartão 1x)";

                // Registra clique no plano / início de intenção de checkout
                trackEvent("InitiateCheckout", {
                    content_ids: [plan.id],
                    content_name: plan.name,
                    payment_condition: condition,
                    value: plan.priceCash,
                    currency: "BRL",
                    utms: getStoredUtms()
                });

                const targetUrl =
                    (plan.checkoutUrls && plan.checkoutUrls[condition]) ||
                    (plan.checkoutUrls && plan.checkoutUrls.default) ||
                    "";

                // Se houver URL de checkout ASAAS configurada, redireciona anexando UTMs
                if (targetUrl && targetUrl.trim() !== "") {
                    const finalCheckoutUrl = appendUtmsToUrl(targetUrl, {
                        plan_id: plan.id,
                        payment_condition: condition
                    });
                    window.location.href = finalCheckoutUrl;
                    return;
                }

                // Caso o checkout ainda não esteja configurado com link ativo, exibe o modal transparente
                if (modalBackdrop) {
                    modalPlanName.textContent = plan.name;
                    modalPlanDuration.textContent = plan.duration;
                    modalPlanCondition.textContent = `${plan.priceCashFormatted} à vista (${conditionLabel})`;

                    const checkoutWaMsg =
                        `Olá, Daniel! Quero garantir minha vaga no plano *${plan.name}* (${plan.duration}) ` +
                        `na condição *${conditionLabel}*. Pode me enviar o link seguro do checkout ASAAS para finalizar minha inscrição?`;

                    modalWhatsappBtn.setAttribute("href", buildWhatsAppUrl(checkoutWaMsg));
                    modalBackdrop.classList.add("is-active");
                    modalBackdrop.setAttribute("aria-hidden", "false");
                }
            });
        });

        if (modalCloseBtn && modalBackdrop) {
            modalCloseBtn.addEventListener("click", () => {
                modalBackdrop.classList.remove("is-active");
                modalBackdrop.setAttribute("aria-hidden", "true");
            });

            modalBackdrop.addEventListener("click", (e) => {
                if (e.target === modalBackdrop) {
                    modalBackdrop.classList.remove("is-active");
                    modalBackdrop.setAttribute("aria-hidden", "true");
                }
            });

            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape" && modalBackdrop.classList.contains("is-active")) {
                    modalBackdrop.classList.remove("is-active");
                    modalBackdrop.setAttribute("aria-hidden", "true");
                }
            });
        }

        if (modalWhatsappBtn) {
            modalWhatsappBtn.addEventListener("click", () => {
                trackEvent("Lead", {
                    lead_source: "checkout_fallback_whatsapp",
                    plan_name: modalPlanName ? modalPlanName.textContent : "",
                    utms: getStoredUtms()
                });
            });
        }
    }

    // =========================================================================
    // 5. RENDERIZAÇÃO CONDICIONAL DE DEPOIMENTOS REAIS
    // =========================================================================
    function renderTestimonials() {
        const section = document.getElementById("depoimentos");
        const grid = document.getElementById("testimonials-grid");
        if (!section || !grid) return;

        const items = Array.isArray(config.testimonials) ? config.testimonials : [];
        if (items.length === 0) {
            section.setAttribute("hidden", "hidden");
            return;
        }

        section.removeAttribute("hidden");
        grid.innerHTML = items.map((item) => {
            const photoHtml = item.photo
                ? `<img src="${item.photo}" alt="${item.name}" loading="lazy">`
                : "";
            const planBadge = item.plan ? `<span>${item.plan}</span>` : "";
            const evolutionHtml = (item.initialSituation || item.evolution)
                ? `<div class="testimonial-evolution">
                     ${item.initialSituation ? `<strong>Momento inicial:</strong> ${item.initialSituation}<br>` : ""}
                     ${item.evolution ? `<strong>Evolução:</strong> ${item.evolution}` : ""}
                   </div>`
                : "";

            return `
                <article class="testimonial-card">
                    <p class="testimonial-quote">"${item.quote}"</p>
                    ${evolutionHtml}
                    <div class="testimonial-author">
                        ${photoHtml}
                        <div class="testimonial-author-info">
                            <h4>${item.name}</h4>
                            ${planBadge}
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    }

    // =========================================================================
    // 6. MENU MOBILE E HEADER STICKY
    // =========================================================================
    function initNavigation() {
        const header = document.querySelector("header.site-header");
        const toggleBtn = document.getElementById("mobile-menu-toggle");
        const mobileNav = document.getElementById("mobile-nav-drawer");

        const onScroll = () => {
            if (!header) return;
            if (window.scrollY > 24) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        if (toggleBtn && mobileNav) {
            toggleBtn.addEventListener("click", () => {
                const isOpen = mobileNav.classList.toggle("is-open");
                toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });

            mobileNav.querySelectorAll("a").forEach((link) => {
                link.addEventListener("click", () => {
                    mobileNav.classList.remove("is-open");
                    toggleBtn.setAttribute("aria-expanded", "false");
                });
            });
        }
    }

    // =========================================================================
    // INICIALIZAÇÃO
    // =========================================================================
    document.addEventListener("DOMContentLoaded", () => {
        captureUtms();
        hydrateWhatsAppLinks();
        hydratePlanInstallmentConfig();
        setupPlanCheckoutButtons();
        renderTestimonials();
        initNavigation();
        initTrackingScripts();
    });
})();

