(() => {
  "use strict";

  const WHATSAPP_NUMBER = "5571991240134"; // (71) 99124-0134
  const CARDAPIO_PDF_PATH = "assets/cardapio/cardapio-dgula.pdf";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const buildWhatsAppLink = (message) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message || "Olá! Vim pelo site da D'Gula Pizzaria.")}`;

  /* ---------- Links de WhatsApp ---------- */
  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    el.href = buildWhatsAppLink(el.getAttribute("data-message"));
  });

  /* ---------- Ano no rodapé ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Cabeçalho encolhe ao rolar ---------- */
  const header = document.getElementById("siteHeader");
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Botão flutuante do WhatsApp ---------- */
  const fab = document.getElementById("whatsappFab");
  const onScrollFab = () => {
    if (!fab) return;
    fab.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.6);
  };
  onScrollFab();
  window.addEventListener("scroll", onScrollFab, { passive: true });

  /* ---------- Animações ao entrar na tela ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.getAttribute("data-delay");
            if (delay) entry.target.style.transitionDelay = `${delay}ms`;
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Grade de sabores (data-driven) ---------- */
  const flavorGrid = document.getElementById("flavorGrid");
  const flavorList = typeof DGULA_FLAVORS !== "undefined" ? DGULA_FLAVORS : [];
  if (flavorGrid && Array.isArray(flavorList) && flavorList.length) {
    const frag = document.createDocumentFragment();

    flavorList.forEach((flavor, i) => {
      const card = document.createElement("article");
      card.className = "flavor-card reveal";
      card.setAttribute("data-delay", String((i % 3) * 90));

      const message = `Olá! 🍕 Quero pedir a pizza ${flavor.name} que vi no site da D'Gula Pizzaria!`;

      card.innerHTML = `
        <div class="flavor-media">
          <img src="${flavor.img}" alt="Pizza ${flavor.name}" loading="lazy"
               onerror="this.closest('.flavor-media').classList.add('flavor-media--placeholder'); this.remove();" />
          <span class="flavor-emoji" aria-hidden="true">${flavor.emoji}</span>
          <span class="flavor-tag">${flavor.tag}</span>
        </div>
        <div class="flavor-body">
          <h3>${flavor.name}</h3>
          <p>${flavor.desc}</p>
          <div class="flavor-foot">
            <span class="flavor-price">${flavor.price}</span>
            <a class="btn btn-whatsapp btn-sm" href="${buildWhatsAppLink(message)}" target="_blank" rel="noopener">Pedir esse</a>
          </div>
        </div>
      `;
      frag.appendChild(card);
    });

    flavorGrid.appendChild(frag);

    if ("IntersectionObserver" in window && !prefersReducedMotion) {
      const io2 = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const delay = entry.target.getAttribute("data-delay");
              if (delay) entry.target.style.transitionDelay = `${delay}ms`;
              entry.target.classList.add("is-visible");
              io2.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );
      flavorGrid.querySelectorAll(".reveal").forEach((el) => io2.observe(el));
    } else {
      flavorGrid.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    }
  }

  /* ---------- Cardápio em PDF (com fallback gracioso) ---------- */
  const pdfBtn = document.getElementById("pdfMenuBtn");
  const pdfHint = document.getElementById("pdfHint");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", async () => {
      pdfBtn.disabled = true;
      const original = pdfBtn.innerHTML;
      pdfBtn.innerHTML = "Verificando…";
      try {
        const res = await fetch(CARDAPIO_PDF_PATH, { method: "HEAD" });
        if (res.ok) {
          window.open(CARDAPIO_PDF_PATH, "_blank", "noopener");
        } else {
          throw new Error("PDF ainda não disponível");
        }
      } catch (err) {
        if (pdfHint) pdfHint.hidden = false;
        window.open(buildWhatsAppLink("Olá! Gostaria de ver o cardápio completo da D'Gula Pizzaria."), "_blank", "noopener");
      } finally {
        pdfBtn.disabled = false;
        pdfBtn.innerHTML = original;
      }
    });
  }

  /* ---------- Micro-interação: confete de pizza ao chamar no WhatsApp ---------- */
  const EMOJIS = ["🍕", "🔥", "🧀", "🥤"];
  function burstConfetti(x, y) {
    if (prefersReducedMotion) return;
    for (let i = 0; i < 10; i++) {
      const span = document.createElement("span");
      span.className = "confetti-piece";
      span.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const angle = Math.random() * Math.PI * 2;
      const distance = 60 + Math.random() * 90;
      span.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
      span.style.setProperty("--ty", `${Math.sin(angle) * distance - 40}px`);
      span.style.setProperty("--rot", `${(Math.random() - 0.5) * 360}deg`);
      span.style.left = `${x}px`;
      span.style.top = `${y}px`;
      document.body.appendChild(span);
      span.addEventListener("animationend", () => span.remove());
    }
  }

  document.querySelectorAll(".btn-whatsapp").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      burstConfetti(e.clientX, e.clientY);
    });
  });

  /* ---------- Parallax sutil no herói ---------- */
  const heroArt = document.querySelector(".logo-stage");
  if (heroArt && !prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    window.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16;
      const y = (e.clientY / window.innerHeight - 0.5) * 16;
      heroArt.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }
})();
