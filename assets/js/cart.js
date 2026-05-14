/* =================================================================
   Cart - persistence via localStorage
================================================================= */
const CART_KEY = "om-running-cart";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = readCart();
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "inline-flex" : "none";
  });
}

function addToCart(productId, size = null, qty = 1) {
  const cart = readCart();
  const existing = cart.find((i) => i.id === productId && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, size, qty });
  }
  writeCart(cart);
  showFlash("Añadido al carrito");
}

function removeFromCart(productId, size = null) {
  const cart = readCart().filter((i) => !(i.id === productId && i.size === size));
  writeCart(cart);
}

function updateQty(productId, size, delta) {
  const cart = readCart();
  const item = cart.find((i) => i.id === productId && i.size === size);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  writeCart(cart);
}

function getCartTotal() {
  const cart = readCart();
  return cart.reduce((acc, item) => {
    const p = window.getProduct(item.id);
    if (!p) return acc;
    return acc + p.price * item.qty;
  }, 0);
}

function showFlash(msg) {
  let flash = document.querySelector(".flash-msg");
  if (!flash) {
    flash = document.createElement("div");
    flash.className = "flash-msg";
    document.body.appendChild(flash);
  }
  flash.textContent = msg;
  flash.classList.add("is-visible");
  clearTimeout(showFlash._t);
  showFlash._t = setTimeout(() => flash.classList.remove("is-visible"), 1800);
}

document.addEventListener("DOMContentLoaded", updateCartBadge);

window.cart = {
  read: readCart,
  add: addToCart,
  remove: removeFromCart,
  update: updateQty,
  total: getCartTotal,
};
