/* =================================================================
   Main shared behaviors
================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav toggle
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("is-open"));
  }

  // Render product grids
  document.querySelectorAll("[data-product-grid]").forEach((grid) => {
    const filter = grid.dataset.productGrid; // "men", "women", "all", "featured"
    const limit = grid.dataset.limit ? parseInt(grid.dataset.limit, 10) : null;
    let list = window.PRODUCTS;
    if (filter === "men") list = list.filter((p) => p.gender === "men");
    else if (filter === "women") list = list.filter((p) => p.gender === "women");
    else if (filter === "featured") list = [...list].sort(() => Math.random() - 0.5);
    if (limit) list = list.slice(0, limit);

    grid.innerHTML = list.map(productCardHTML).join("");
  });

  // Product detail page hydration
  const detail = document.querySelector("[data-product-detail]");
  if (detail) hydrateProductDetail(detail);

  // Cart page hydration
  const cartContainer = document.querySelector("[data-cart-page]");
  if (cartContainer) hydrateCart(cartContainer);

  // Active nav link
  highlightActiveNav();

  // Contact form (demo only)
  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      contactForm.reset();
      window.showFlash && window.showFlash("Message sent. We'll reply soon.");
    });
  }

  // Newsletter (demo)
  document.querySelectorAll("[data-newsletter]").forEach((f) => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      f.reset();
      window.showFlash && window.showFlash("Subscribed!");
    });
  });
});

function productCardHTML(p) {
  const discount = window.getDiscount(p.price, p.original);
  return `
    <a class="product-card" href="product.html?id=${p.id}">
      <div class="media">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        <img src="${assetsPath()}assets/images/${p.image}" alt="${p.name}" loading="lazy" />
      </div>
      <h3>${p.name}</h3>
      <div class="price">
        <span class="price-current">${window.formatPrice(p.price)}</span>
        <span class="price-original">${window.formatPrice(p.original)}</span>
        <span class="discount">-${discount}%</span>
      </div>
    </a>`;
}

function assetsPath() {
  return location.pathname.includes("/pages/") ? "../" : "";
}

function hydrateProductDetail(root) {
  const id = new URLSearchParams(location.search).get("id");
  const p = id ? window.getProduct(id) : null;
  if (!p) {
    root.innerHTML = `<div class="text-center" style="padding:4rem 1rem"><h2>Product not found</h2><p><a class="btn" href="index.html">Back to home</a></p></div>`;
    return;
  }
  const discount = window.getDiscount(p.price, p.original);
  const sizes = [38, 39, 40, 41, 42, 43, 44, 45, 46];
  root.innerHTML = `
    <nav class="breadcrumb">
      <a href="index.html">Inicio</a> /
      <a href="${p.gender === "men" ? "men.html" : "women.html"}">${p.gender === "men" ? "Hombre" : "Mujer"}</a> /
      <span>${p.name}</span>
    </nav>
    <div class="product-detail">
      <div class="product-gallery"><img src="assets/images/${p.image}" alt="${p.name}" /></div>
      <div class="product-info">
        <h1>${p.name}</h1>
        <div class="price-block">
          <span class="price-current">${window.formatPrice(p.price)}</span>
          <span class="price-original">${window.formatPrice(p.original)}</span>
          <span class="discount-tag">-${discount}%</span>
        </div>
        <p class="description">${p.description}</p>

        <label style="font-size:0.85rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Talla (EU)</label>
        <div class="size-grid" role="radiogroup">
          ${sizes
            .map(
              (s, i) => `
            <label>
              <input type="radio" name="size" value="${s}" ${i === 3 ? "checked" : ""}>
              <span>${s}</span>
            </label>`,
            )
            .join("")}
        </div>

        <button class="btn btn-block" data-add-cart="${p.id}">Añadir al carrito</button>
        <a href="cart.html" class="btn btn-outline btn-block" style="margin-top:0.5rem">Ir al carrito</a>

        <div class="product-meta">
          <span>★ Envío gratis a partir de 60 €</span>
          <span>↺ Devoluciones en 14 días</span>
          <span>✓ Pago contra reembolso disponible</span>
          <span>⚡ Envío en 24–48 h</span>
        </div>
      </div>
    </div>
  `;
  root.querySelector("[data-add-cart]").addEventListener("click", () => {
    const size = root.querySelector('input[name="size"]:checked')?.value || null;
    window.cart.add(p.id, size, 1);
  });
}

function hydrateCart(root) {
  const items = window.cart.read();
  if (!items.length) {
    root.innerHTML = `
      <div class="cart-empty">
        <h2>Tu carrito está vacío</h2>
        <p style="margin:1rem 0 2rem">Descubre las últimas zapatillas en oferta.</p>
        <a class="btn" href="index.html">Seguir comprando</a>
      </div>`;
    return;
  }
  const rowsHTML = items
    .map((item) => {
      const p = window.getProduct(item.id);
      if (!p) return "";
      const lineTotal = p.price * item.qty;
      return `
      <div class="cart-row" data-row="${p.id}|${item.size || ""}">
        <div class="thumb"><img src="assets/images/${p.image}" alt="${p.name}" /></div>
        <div>
          <h4>${p.name}</h4>
          <div class="meta">Talla EU ${item.size || "—"} · ${window.formatPrice(p.price)}</div>
          <div class="qty-control">
            <button data-qty="-1">−</button>
            <span>${item.qty}</span>
            <button data-qty="1">+</button>
          </div>
        </div>
        <div class="actions">
          <div class="price">${window.formatPrice(lineTotal)}</div>
          <a href="#" class="remove" data-remove>Remove</a>
        </div>
      </div>`;
    })
    .join("");

  const subtotal = window.cart.total();
  const shipping = subtotal >= 60 ? 0 : 4.9;
  const total = subtotal + shipping;

  root.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items">${rowsHTML}</div>
      <aside class="cart-summary">
        <h3>Resumen del pedido</h3>
        <div class="summary-row"><span>Subtotal</span><span>${window.formatPrice(subtotal)}</span></div>
        <div class="summary-row"><span>Envío</span><span>${shipping === 0 ? "Gratis" : window.formatPrice(shipping)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${window.formatPrice(total)}</span></div>
        <button class="btn btn-block" style="margin-top:1rem" data-checkout>Finalizar compra</button>
        <a href="index.html" class="btn btn-outline btn-block" style="margin-top:0.5rem">Seguir comprando</a>
      </aside>
    </div>
  `;

  root.querySelectorAll(".cart-row").forEach((row) => {
    const [pid, size] = row.dataset.row.split("|");
    const sizeVal = size || null;
    row.querySelector('[data-qty="-1"]').addEventListener("click", () => {
      window.cart.update(pid, sizeVal, -1);
      hydrateCart(root);
    });
    row.querySelector('[data-qty="1"]').addEventListener("click", () => {
      window.cart.update(pid, sizeVal, 1);
      hydrateCart(root);
    });
    row.querySelector("[data-remove]").addEventListener("click", (e) => {
      e.preventDefault();
      window.cart.remove(pid, sizeVal);
      hydrateCart(root);
    });
  });

  root.querySelector("[data-checkout]").addEventListener("click", () => {
    window.showFlash && window.showFlash("Demo only — checkout disabled.");
  });
}

function highlightActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href && href === path) a.classList.add("is-active");
  });
}
