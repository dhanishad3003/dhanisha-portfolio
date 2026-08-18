const root = document.documentElement;
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMenu();
  initReveal();
  initSkills();
  initNavigationSpy();
  initProjectFilters();
  initProjectModal();
  initContactForm();
  initScrollProgress();
  $("#year").textContent = new Date().getFullYear();
});

/* Theme */
function initTheme() {
  const button = $("#themeToggle");
  const icon = $("#themeIcon");
  const saved = localStorage.getItem("portfolio-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = saved ? saved === "dark" : prefersDark;

  setTheme(dark);

  button.addEventListener("click", () => {
    setTheme(root.dataset.theme !== "dark");
  });

  function setTheme(darkMode) {
    root.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("portfolio-theme", darkMode ? "dark" : "light");
    icon.textContent = darkMode ? "☀" : "☾";
    button.setAttribute("aria-label", darkMode ? "Switch to light mode" : "Switch to dark mode");
    button.setAttribute("aria-pressed", String(darkMode));
  }
}

/* Mobile menu */
function initMenu() {
  const toggle = $("#menuToggle");
  const nav = $("#siteNav");
  const close = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
  });

  $$(".nav-link").forEach(link => link.addEventListener("click", close));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") close();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) close();
  });
}

/* Reveal animations */
function initReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach(item => item.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  items.forEach(item => observer.observe(item));
}

/* Skill bars */
function initSkills() {
  const bars = $$(".skill-track i");
  if (!("IntersectionObserver" in window)) {
    bars.forEach(bar => bar.style.width = `${bar.dataset.level}%`);
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = `${entry.target.dataset.level}%`;
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .35 });
  bars.forEach(bar => observer.observe(bar));
}

/* Active section in navigation */
function initNavigationSpy() {
  const sections = $$("main section[id]");
  const links = $$(".nav-link");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach(section => observer.observe(section));
}

/* Project filter/search */
function initProjectFilters() {
  const cards = $$(".project-card");
  const filters = $$(".filter");
  const search = $("#projectSearch");
  const empty = $("#emptyState");
  let active = "all";

  function render() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach(card => {
      const matchesFilter = active === "all" || card.dataset.category === active;
      const matchesSearch = !query || card.dataset.title.toLowerCase().includes(query) ||
        card.textContent.toLowerCase().includes(query);
      const show = matchesFilter && matchesSearch;
      card.hidden = !show;
      if (show) visible++;
    });

    empty.hidden = visible !== 0;
  }

  filters.forEach(filter => {
    filter.addEventListener("click", () => {
      filters.forEach(btn => btn.classList.remove("active"));
      filter.classList.add("active");
      active = filter.dataset.filter;
      render();
    });
  });

  search.addEventListener("input", render);
}

/* Project modal */
function initProjectModal() {
  const modal = $("#projectModal");
  const title = $("#modalTitle");
  const description = $("#modalDescription");
  const tags = $("#modalTags");
  const icon = $("#modalIcon");

  const details = {
    "Supermarket Inventory System": {
      icon: "▦",
      tags: ["Java", "OOP", "File System"],
      description: "A practical BCA project concept for managing products, inventory, suppliers, billing and basic business operations."
    },
    "NovaHub Interactive UI": {
      icon: "⌘",
      tags: ["HTML", "CSS", "JavaScript"],
      description: "A responsive interface built to practice reusable components, navigation, filtering, modals and DOM interactions."
    },
    "Travel Gallery": {
      icon: "◫",
      tags: ["HTML", "CSS", "JavaScript"],
      description: "A responsive gallery concept focused on visual hierarchy, cards, responsive layouts and interactive controls."
    },
    "Cybersecurity Learning Lab": {
      icon: "⌁",
      tags: ["Security", "Linux", "Networking"],
      description: "A learning project exploring cybersecurity fundamentals, Linux, networking, common threats and defensive security practices."
    }
  };

  function open(card) {
    const item = details[card.dataset.title];
    if (!item) return;
    title.textContent = card.dataset.title;
    description.textContent = item.description;
    icon.textContent = item.icon;
    tags.innerHTML = item.tags.map(tag => `<span>${tag}</span>`).join("");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $("[data-close-modal]", modal).focus();
  }

  function close() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  $$(".project-link").forEach(button => {
    button.addEventListener("click", () => open(button.closest(".project-card")));
  });
  $$("[data-close-modal]", modal).forEach(button => button.addEventListener("click", close));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal.classList.contains("open")) close();
  });
}

/* Contact form: validation + local draft */
function initContactForm() {
  const form = $("#contactForm");
  const fields = ["name", "email", "subject", "message"];
  const status = $("#formStatus");
  const clear = $("#clearDraft");
  const count = $("#messageCount");

  const draft = JSON.parse(localStorage.getItem("portfolio-contact-draft") || "null");
  if (draft) {
    fields.forEach(id => {
      if (draft[id] !== undefined) $(`#${id}`).value = draft[id];
    });
  }

  $("#message").addEventListener("input", () => count.textContent = $("#message").value.length);

  let saveTimer;
  form.addEventListener("input", () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 250);
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!validate()) return;

    const submitted = {
      id: Date.now(),
      name: $("#name").value.trim(),
      email: $("#email").value.trim(),
      subject: $("#subject").value.trim(),
      message: $("#message").value.trim(),
      sentAt: new Date().toLocaleString()
    };

    const existing = JSON.parse(localStorage.getItem("portfolioMessages") || "[]");
    existing.unshift(submitted);
    localStorage.setItem("portfolioMessages", JSON.stringify(existing));

    $("#sendSuccess").hidden = false;
    $("#viewMessages").hidden = false;
    status.textContent = "✓ Message sent successfully! 🎉";
    showToast("Message sent successfully! 🎉");

    // Clear the form after a successful submission.
    form.reset();
    count.textContent = "0";

    // Keep the history hidden until the user explicitly asks to view it.
    $("#messageHistory").hidden = true;
  });

  $("#closeSuccess").addEventListener("click", () => {
    $("#sendSuccess").hidden = true;
  });

  const renderMessages = () => {
    const list = $("#messageList");
    const messages = JSON.parse(localStorage.getItem("portfolioMessages") || "[]");
    if (!messages.length) {
      list.innerHTML = '<p class="no-messages">No messages yet.</p>';
      return;
    }

    list.innerHTML = messages.map((item, index) => `
      <article class="saved-message">
        <div class="saved-message-top">
          <span class="message-number">#${messages.length - index}</span>
          <time>${item.sentAt || ""}</time>
          <button type="button" class="delete-message" data-delete-id="${item.id}" aria-label="Delete this message">Delete</button>
        </div>
        <div class="saved-message-grid">
          <div><span>Name</span><strong>${escapeHtml(item.name)}</strong></div>
          <div><span>Email</span><strong>${escapeHtml(item.email)}</strong></div>
          <div><span>Subject</span><strong>${escapeHtml(item.subject)}</strong></div>
          <div class="saved-message-body"><span>Message</span><p>${escapeHtml(item.message)}</p></div>
        </div>
      </article>
    `).join("");
  };

  const escapeHtml = value => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  $("#messageList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-id]");
    if (!button) return;

    const id = Number(button.dataset.deleteId);
    const messages = JSON.parse(localStorage.getItem("portfolioMessages") || "[]");
    const updated = messages.filter(message => Number(message.id) !== id);

    localStorage.setItem("portfolioMessages", JSON.stringify(updated));
    renderMessages();
    updateViewButton();

    if (!updated.length) {
      $("#messageHistory").hidden = true;
      $("#sendSuccess").hidden = true;
      $("#formStatus").textContent = "";
    }

    showToast("Message deleted");
  });

  $("#deleteAllMessages").addEventListener("click", () => {
    const messages = JSON.parse(localStorage.getItem("portfolioMessages") || "[]");
    if (!messages.length) return;

    const confirmed = window.confirm("Delete all saved messages? This cannot be undone.");
    if (!confirmed) return;

    localStorage.removeItem("portfolioMessages");
    $("#messageList").innerHTML = '<p class="no-messages">No messages yet.</p>';
    $("#messageHistory").hidden = true;
    $("#sendSuccess").hidden = true;
    $("#viewMessages").hidden = true;
    $("#formStatus").textContent = "";
    showToast("All messages deleted");
  });

  const updateViewButton = () => {
    const messages = JSON.parse(localStorage.getItem("portfolioMessages") || "[]");
    $("#viewMessages").hidden = messages.length === 0;
  };

  $("#viewMessages").addEventListener("click", () => {
    renderMessages();
    $("#messageHistory").hidden = false;
    $("#sendSuccess").hidden = true;
    $("#messageHistory").scrollIntoView({behavior:"smooth", block:"nearest"});
  });

  $("#hideMessages").addEventListener("click", () => {
    $("#messageHistory").hidden = true;
    $("#sendSuccess").hidden = false;
  });

  updateViewButton();

  clear.addEventListener("click", () => {
    localStorage.removeItem("portfolio-contact-draft");
    form.reset();
    fields.forEach(id => $(`#${id}Error`).textContent = "");
    status.textContent = "";
    count.textContent = "0";
    $("#sendSuccess").hidden = true;
    showToast("Draft cleared");
  });

  function saveDraft() {
    const data = Object.fromEntries(fields.map(id => [id, $(`#${id}`).value]));
    localStorage.setItem("portfolio-contact-draft", JSON.stringify(data));
  }

  function validate() {
    let ok = true;
    const values = Object.fromEntries(fields.map(id => [id, $(`#${id}`).value.trim()]));

    const errors = {
      name: values.name ? "" : "Please enter your name.",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? "" : "Enter a valid email.",
      subject: values.subject ? "" : "Please add a subject.",
      message: values.message.length >= 10 ? "" : "Message should be at least 10 characters."
    };

    fields.forEach(id => {
      $(`#${id}Error`).textContent = errors[id];
      if (errors[id]) ok = false;
    });
    return ok;
  }

  count.textContent = $("#message").value.length;
}

/* Scroll progress */
function initScrollProgress() {
  const bar = $("#scrollProgress");
  function update() {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  }
  addEventListener("scroll", update, { passive: true });
  update();
}

/* Toast */
let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}
