(function () {
  "use strict";
  var WA = "5588996821431";
  var MSG = {
    hero: "Olá! Gostaria de agendar uma consulta na Dental Service.",
    cta: "Olá! Gostaria de agendar uma avaliação na Dental Service.",
    flutuante: "Olá! Vim pelo site da Dental Service e gostaria de mais informações.",
    profissional: "Olá! Gostaria de agendar uma consulta com o Dr. Jocélio Souza.",
    "profissional-info": "Olá! Gostaria de falar com a equipe da Dental Service."
  };
  var NOMES = { canal: "Canal (Endodontia)", restauracao: "Restauração Estética", limpeza: "Limpeza e Profilaxia", clareamento: "Clareamento Dental" };
  function waLink(text) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(text); }
  function msgFor(key) {
    if (MSG[key]) return MSG[key];
    var m = key.match(/^(tratamento|info)-(.+)$/);
    if (m && NOMES[m[2]]) {
      return m[1] === "tratamento"
        ? "Olá! Gostaria de agendar uma avaliação para " + NOMES[m[2]] + "."
        : "Olá! Gostaria de mais informações sobre " + NOMES[m[2]] + ".";
    }
    return MSG.flutuante;
  }
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = waLink(msgFor(a.getAttribute("data-wa")));
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });

  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  // header, progress, back to top
  var topbar = document.getElementById("topbar");
  var progress = document.getElementById("progress");
  var toTop = document.getElementById("toTop");
  function onScroll() {
    var y = window.scrollY;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (topbar) topbar.classList.toggle("is-scrolled", y > 20);
    if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  // mobile menu
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  function closeMenu() {
    if (!nav) return;
    nav.classList.remove("is-open");
    if (topbar) topbar.classList.remove("menu-open");
    if (burger) { burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Abrir menu"); }
  }
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      if (topbar) topbar.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  // reveal + active section
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });

    var links = document.querySelectorAll(".nav__link");
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { so.observe(s); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  // tilt
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var target = el.firstElementChild || el;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        target.style.transform = "rotateY(" + x * 12 + "deg) rotateX(" + -y * 12 + "deg)";
      });
      el.addEventListener("mouseleave", function () { target.style.transform = ""; });
    });
  }

  // contact form -> WhatsApp
  var form = document.getElementById("form-contato");
  if (!form) return;
  var carimbo = document.getElementById("carimbo");
  var abertoEm = Date.now();
  if (carimbo) carimbo.value = String(abertoEm);
  var status = document.getElementById("form-status");
  var tel = document.getElementById("telefone");
  if (tel) tel.addEventListener("input", function () {
    var d = tel.value.replace(/\D/g, "").slice(0, 11);
    if (d.length > 6) tel.value = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(-4);
    else if (d.length > 2) tel.value = "(" + d.slice(0, 2) + ") " + d.slice(2);
    else tel.value = d;
  });
  function setErr(id, msg) {
    var input = document.getElementById(id);
    var p = document.getElementById("erro-" + id);
    if (p) p.textContent = msg || "";
    if (input) { input.classList.toggle("is-invalid", !!msg); input.setAttribute("aria-invalid", msg ? "true" : "false"); }
    return !msg;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
    if (v("website")) return; // robô
    var ok = true;
    ok = setErr("nome", v("nome").length < 3 ? "Informe seu nome completo." : "") && ok;
    ok = setErr("telefone", v("telefone").replace(/\D/g, "").length < 10 ? "Informe um telefone com DDD." : "") && ok;
    ok = setErr("email", v("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email")) ? "E-mail inválido." : "") && ok;
    ok = setErr("assunto", !v("assunto") ? "Selecione um assunto." : "") && ok;
    ok = setErr("mensagem", v("mensagem").length < 10 ? "Escreva uma mensagem com pelo menos 10 caracteres." : "") && ok;
    ok = setErr("lgpd", !document.getElementById("lgpd").checked ? "É necessário autorizar o contato." : "") && ok;
    if (!ok) { var first = form.querySelector(".is-invalid"); if (first) first.focus(); return; }
    if (Date.now() - abertoEm < 3000) { if (status) status.textContent = "Aguarde um instante e tente novamente."; return; }
    var texto = "Olá! Vim pelo site da Dental Service.\n\n" +
      "*Nome:* " + v("nome") + "\n*Telefone:* " + v("telefone") +
      (v("email") ? "\n*E-mail:* " + v("email") : "") +
      "\n*Assunto:* " + v("assunto") + "\n\n" + v("mensagem");
    window.open(waLink(texto), "_blank", "noopener");
    if (status) status.textContent = "Abrimos o WhatsApp com a sua mensagem. Confira e toque em enviar.";
  });
})();
