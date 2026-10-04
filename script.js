/* ==========================================
   GLTEC — SISTEMA DE INTERAÇÕES DO SITE
   ========================================== */

// WhatsApp comercial da GLtec
const WHATSAPP_EMPRESA = "5521984801837";

// Funções auxiliares
const moeda = valor =>
    valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

const $ = seletor => document.querySelector(seletor);
const $$ = seletor => [...document.querySelectorAll(seletor)];

// ==========================================
// CARRINHO DE COMPRAS
// ==========================================

let carrinho = [];

try {
    const salvo = localStorage.getItem("gltec_carrinho");
    carrinho = salvo ? JSON.parse(salvo) : [];

    if (!Array.isArray(carrinho)) {
        carrinho = [];
    }
} catch {
    carrinho = [];
}

// Salvar carrinho no navegador
function salvarCarrinho() {
    try {
        localStorage.setItem(
            "gltec_carrinho",
            JSON.stringify(carrinho)
        );
    } catch {
        console.warn("Não foi possível salvar o carrinho.");
    }
}

// Mensagem temporária na tela
function mostrarToast(mensagem) {
    const toast = $("#toast");

    if (!toast) return;

    toast.textContent = mensagem;
    toast.classList.add("show");

    window.clearTimeout(mostrarToast.timer);

    mostrarToast.timer = window.setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

// Abrir WhatsApp
function abrirWhatsApp(
    mensagem,
    numero = WHATSAPP_EMPRESA
) {
    const url =
        `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank", "noopener,noreferrer");
}

// Atualizar quantidade de produtos
function atualizarContadores() {
    const quantidade = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
    );

    const contador = $("#headerCartCount");

    if (contador) {
        contador.textContent = quantidade;
    }

    $$(".nav-count").forEach(elemento => {
        elemento.textContent = quantidade;
    });
}

// Adicionar produto ao carrinho
function adicionarProduto(card) {
    if (!card) return;

    const id = card.dataset.id;
    const nome = card.dataset.name;
    const preco = Number(card.dataset.price);

    if (!id || !nome || !Number.isFinite(preco)) {
        return;
    }

    const existente = carrinho.find(
        item => item.id === id
    );

    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({
            id,
            nome,
            preco,
            quantidade: 1
        });
    }

    salvarCarrinho();
    renderizarCarrinho();

    mostrarToast(`${nome} adicionado ao carrinho.`);
}

// Alterar quantidade de um produto
function alterarQuantidade(id, delta) {
    const item = carrinho.find(
        produto => produto.id === id
    );

    if (!item) return;

    item.quantidade += delta;

    if (item.quantidade <= 0) {
        carrinho = carrinho.filter(
            produto => produto.id !== id
        );
    }

    salvarCarrinho();
    renderizarCarrinho();
}

// Exibir conteúdo do carrinho
function renderizarCarrinho() {
    const container = $("#cartItems");
    const totalElemento = $("#cartTotal");

    const total = carrinho.reduce(
        (soma, item) =>
            soma + item.preco * item.quantidade,
        0
    );

    if (totalElemento) {
        totalElemento.textContent = moeda(total);
    }

    atualizarContadores();

    if (!container) return;

    if (carrinho.length === 0) {
        container.innerHTML =
            '<p class="empty-cart">Seu carrinho ainda está vazio.</p>';
        return;
    }

    container.innerHTML = carrinho.map(item => `
        <div class="cart-item">
            <div>
                <h4>${escaparHTML(item.nome)}</h4>
                <p>
                    ${moeda(item.preco)} cada ·
                    Subtotal
                    ${moeda(item.preco * item.quantidade)}
                </p>
            </div>

            <div class="cart-item-controls">
                <button
                    type="button"
                    data-action="minus"
                    data-id="${escaparHTML(item.id)}"
                    aria-label="Diminuir quantidade"
                >−</button>

                <span>${item.quantidade}</span>

                <button
                    type="button"
                    data-action="plus"
                    data-id="${escaparHTML(item.id)}"
                    aria-label="Aumentar quantidade"
                >+</button>
            </div>
        </div>
    `).join("");
}

// Evitar inserir texto não confiável diretamente no HTML
function escaparHTML(valor) {
    return String(valor).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

// ==========================================
// ABRIR E FECHAR CARRINHO
// ==========================================

function abrirCarrinho() {
    const drawer = $("#cartDrawer");
    const overlay = $("#cartOverlay");

    if (!drawer || !overlay) return;

    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false;

    document.body.style.overflow = "hidden";

    $("#closeCart")?.focus();
}

function fecharCarrinho() {
    const drawer = $("#cartDrawer");
    const overlay = $("#cartOverlay");

    if (!drawer || !overlay) return;

    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.hidden = true;

    document.body.style.overflow = "";
}

// ==========================================
// MENU RESPONSIVO
// ==========================================

$("#menuToggle")?.addEventListener("click", () => {
    const nav = $("#mainNav");
    const botao = $("#menuToggle");

    if (!nav || !botao) return;

    const aberto = nav.classList.toggle("open");

    botao.setAttribute(
        "aria-expanded",
        String(aberto)
    );

    botao.setAttribute(
        "aria-label",
        aberto ? "Fechar menu" : "Abrir menu"
    );

    botao.textContent = aberto ? "✕" : "☰";
});

$("#mainNav")?.addEventListener("click", evento => {
    if (evento.target.closest("a")) {
        $("#mainNav").classList.remove("open");

        $("#menuToggle")?.setAttribute(
            "aria-expanded",
            "false"
        );

        if ($("#menuToggle")) {
            $("#menuToggle").textContent = "☰";
        }
    }
});

// ==========================================
// BOTÕES DOS PRODUTOS
// ==========================================

$$(".add-cart").forEach(botao => {
    botao.addEventListener("click", () => {
        adicionarProduto(
            botao.closest(".product-card")
        );
    });
});

// Controles do carrinho
$("#openCart")?.addEventListener(
    "click",
    abrirCarrinho
);

$("#viewCart")?.addEventListener(
    "click",
    abrirCarrinho
);

$("#closeCart")?.addEventListener(
    "click",
    fecharCarrinho
);

$("#cartOverlay")?.addEventListener(
    "click",
    fecharCarrinho
);

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
        fecharCarrinho();
    }
});

// Aumentar ou diminuir quantidade
$("#cartItems")?.addEventListener("click", evento => {
    const botao = evento.target.closest(
        "button[data-action]"
    );

    if (!botao) return;

    alterarQuantidade(
        botao.dataset.id,
        botao.dataset.action === "plus" ? 1 : -1
    );
});

// Limpar carrinho
$("#clearCart")?.addEventListener("click", () => {
    carrinho = [];

    salvarCarrinho();
    renderizarCarrinho();

    mostrarToast("Carrinho limpo.");
});

// ==========================================
// FINALIZAR PEDIDO PELO WHATSAPP
// ==========================================

$("#checkoutCart")?.addEventListener("click", () => {
    if (carrinho.length === 0) {
        mostrarToast(
            "Adicione um produto antes de consultar o pedido."
        );
        return;
    }

    const linhas = carrinho.map(item =>
        `${item.nome} — ${item.quantidade}x ${moeda(item.preco)} = ${moeda(item.preco * item.quantidade)}`
    );

    const total = carrinho.reduce(
        (soma, item) =>
            soma + item.preco * item.quantidade,
        0
    );

    const mensagem = `
Olá, GLtec! Gostaria de consultar este pedido.

${linhas.join("\n")}

Total estimado: ${moeda(total)}

Gostaria de confirmar os preços, o estoque,
as formas de pagamento e a entrega.
    `.trim();

    abrirWhatsApp(mensagem);
});

// ==========================================
// ORÇAMENTOS DOS SERVIÇOS
// ==========================================

$$(".contact-service").forEach(link => {
    link.addEventListener("click", evento => {
        evento.preventDefault();

        const servico =
            link.dataset.service || "Serviços GLtec";

        abrirWhatsApp(
            `Olá, GLtec! Tenho interesse em: ${servico}. Gostaria de receber mais informações e um orçamento.`
        );
    });
});

// ==========================================
// FORMULÁRIO DE SUPORTE
// ==========================================

$("#supportForm")?.addEventListener(
    "submit",
    evento => {
        evento.preventDefault();

        const nome =
            $("#clientName")?.value.trim() || "";

        const contato =
            $("#clientContact")?.value.trim() || "";

        const assunto =
            $("#supportTopic")?.value || "";

        const mensagemCliente =
            $("#supportMessage")?.value.trim() || "";

        if (!nome || !assunto || !mensagemCliente) {
            mostrarToast(
                "Preencha nome, assunto e mensagem."
            );
            return;
        }

        const mensagem = `
Olá, GLtec! Gostaria de atendimento.

Nome: ${nome}
Contato: ${contato || "Não informado"}
Assunto: ${assunto}

Mensagem:
${mensagemCliente}
        `.trim();

        abrirWhatsApp(mensagem);
    }
);

// ==========================================
// ANO AUTOMÁTICO NO RODAPÉ
// ==========================================

const ano = $("#currentYear");

if (ano) {
    ano.textContent = new Date().getFullYear();
}

// Inicializar carrinho ao carregar o site
renderizarCarrinho();
