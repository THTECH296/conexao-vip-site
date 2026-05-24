"use strict";
// ============================================================
// Conexão VIP — scripts da landing page (TypeScript)
// Compilado para js/main.js via: npm run build:js
// ============================================================
(() => {
    // Ano corrente no rodapé
    const yr = document.getElementById('yr');
    if (yr)
        yr.textContent = String(new Date().getFullYear());
    // Sombra/borda da nav ao rolar
    const nav = document.getElementById('nav');
    if (nav) {
        const onScroll = () => {
            nav.classList.toggle('scrolled', window.scrollY > 20);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }
    // Animações de entrada (desfoque → nítido) ao surgir na viewport
    const revealIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                revealIO.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach((el) => {
        var _a, _b;
        const siblings = Array.from((_b = (_a = el.parentElement) === null || _a === void 0 ? void 0 : _a.querySelectorAll(':scope > .reveal')) !== null && _b !== void 0 ? _b : []);
        el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 70}ms`;
        revealIO.observe(el);
    });
    // Scrollspy — destaca no menu a seção visível
    const navLinks = Array.from(document.querySelectorAll('nav .links a[href^="#"]')).filter((a) => !a.classList.contains('nav-cta'));
    const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['planos', 'experiencia', 'servicos'].forEach((id) => {
        const section = document.getElementById(id);
        if (section)
            spy.observe(section);
    });
    // Normaliza texto (minúsculas, sem acento) para comparar cidades
    const normalize = (value) => value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
    // ── Consulta de cobertura por CEP (consome a API REST ViaCEP) ──
    const CIDADES_ATENDIDAS = [
        'teofilo otoni', 'almenara', 'aracuai', 'itaobim', 'jequitinhonha',
        'medina', 'nanuque', 'padre paraiso', 'salinas',
    ];
    const cepForm = document.getElementById('cepForm');
    const cepInput = document.getElementById('cepInput');
    const cepResult = document.getElementById('cepResult');
    if (cepForm && cepInput && cepResult) {
        cepInput.addEventListener('input', () => {
            let value = cepInput.value.replace(/\D/g, '').slice(0, 8);
            if (value.length > 5)
                value = `${value.slice(0, 5)}-${value.slice(5)}`;
            cepInput.value = value;
        });
        cepForm.addEventListener('submit', async (event) => {
            var _a, _b;
            event.preventDefault();
            const cep = cepInput.value.replace(/\D/g, '');
            cepResult.className = 'cep-result';
            if (cep.length !== 8) {
                cepResult.textContent = 'Digite um CEP válido com 8 dígitos.';
                cepResult.classList.add('no');
                return;
            }
            cepResult.textContent = 'Consultando…';
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = (await response.json());
                if (data.erro) {
                    cepResult.textContent = 'CEP não encontrado. Confira o número.';
                    cepResult.classList.add('no');
                    return;
                }
                if (CIDADES_ATENDIDAS.includes(normalize((_a = data.localidade) !== null && _a !== void 0 ? _a : ''))) {
                    cepResult.innerHTML = `✅ Boa notícia! A Conexão VIP atende <b>${data.localidade} – ${data.uf}</b>. Fale com a gente para assinar!`;
                    cepResult.classList.add('ok');
                }
                else {
                    cepResult.innerHTML = `Ainda não chegamos em <b>${(_b = data.localidade) !== null && _b !== void 0 ? _b : 'sua cidade'}</b>, mas estamos expandindo. Deixe seu contato no WhatsApp!`;
                    cepResult.classList.add('no');
                }
            }
            catch (_c) {
                cepResult.textContent = 'Não foi possível consultar agora. Tente pelo WhatsApp.';
                cepResult.classList.add('no');
            }
        });
    }
    // ── Formulário de lead → backend PHP (api/contato.php) ──
    const leadForm = document.getElementById('leadForm');
    const leadResult = document.getElementById('leadResult');
    if (leadForm && leadResult) {
        leadForm.addEventListener('submit', async (event) => {
            var _a;
            event.preventDefault();
            leadResult.className = 'lead-result';
            leadResult.textContent = 'Enviando…';
            try {
                const response = await fetch('api/contato.php', {
                    method: 'POST',
                    body: new FormData(leadForm),
                });
                const data = (await response.json());
                leadResult.textContent = (_a = data.message) !== null && _a !== void 0 ? _a : 'Recebido! Em breve entramos em contato.';
                leadResult.classList.add(data.ok ? 'ok' : 'no');
                if (data.ok)
                    leadForm.reset();
            }
            catch (_b) {
                leadResult.textContent = 'Não foi possível enviar agora. Fale com a gente no WhatsApp.';
                leadResult.classList.add('no');
            }
        });
    }
})();
