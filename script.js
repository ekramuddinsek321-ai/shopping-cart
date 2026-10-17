document.addEventListener("DOMContentLoaded", () => {
  // Prices cents mein (floating point errors se bachne ke liye)
  const products = [
    { id: 1, name: "Product 1", price: 2999 },
    { id: 2, name: "Product 2", price: 1999 },
    { id: 3, name: "Product 3", price: 5999 },
    { id: 4, name: "Product 4", price: 7999 },
  ];

  const STORAGE_KEY = "cart";

  // Cart: { productId: quantity }
  let cart = loadCart();

  const productList = document.getElementById("product-list");
  const cartItems = document.getElementById("cart-items");
  const emptyCartMessage = document.getElementById("empty-cart");
  const cartTotalMessage = document.getElementById("cart-total");
  const totalPriceDisplay = document.getElementById("total-price");
  const checkOutBtn = document.getElementById("checkout-btn");
  const cartCount = document.getElementById("cart-count");
  const statusMessage = document.getElementById("status-message");

  // ---------- Helpers ----------
  const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* storage unavailable, ignore */
    }
  }

  function showStatus(message) {
    statusMessage.textContent = message;
    setTimeout(() => (statusMessage.textContent = ""), 3000);
  }

  // ---------- Products render ----------
  function renderProducts() {
    products.forEach((product) => {
      const card = document.createElement("div");
      card.classList.add("product");

      const info = document.createElement("div");
      info.classList.add("product-info");

      const name = document.createElement("span");
      name.classList.add("product-name");
      name.textContent = product.name;

      const price = document.createElement("span");
      price.classList.add("product-price");
      price.textContent = formatPrice(product.price);

      info.append(name, price);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.classList.add("btn", "btn-primary");
      btn.dataset.action = "add";
      btn.dataset.id = product.id;
      btn.textContent = "Add to cart";

      card.append(info, btn);
      productList.appendChild(card);
    });
  }

  // ---------- Cart actions ----------
  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    update();
  }

  function decreaseQty(id) {
    if (!cart[id]) return;
    cart[id] -= 1;
    if (cart[id] <= 0) delete cart[id];
    update();
  }

  function removeFromCart(id) {
    delete cart[id];
    update();
  }

  function checkout() {
    if (Object.keys(cart).length === 0) return;
    cart = {};
    update();
    showStatus("Checkout successful. Thank you for shopping!");
  }

  function update() {
    saveCart();
    renderCart();
  }

  // ---------- Cart render ----------
  function renderCart() {
    cartItems.textContent = "";

    const entries = Object.entries(cart);
    let total = 0;
    let count = 0;

    if (entries.length === 0) {
      emptyCartMessage.classList.remove("hidden");
      cartTotalMessage.classList.add("hidden");
      cartCount.textContent = "0";
      return;
    }

    emptyCartMessage.classList.add("hidden");
    cartTotalMessage.classList.remove("hidden");

    entries.forEach(([id, qty]) => {
      const product = products.find((p) => p.id === Number(id));
      if (!product) return;

      const lineTotal = product.price * qty;
      total += lineTotal;
      count += qty;

      const row = document.createElement("div");
      row.classList.add("cart-item");

      const label = document.createElement("span");
      label.classList.add("cart-item-name");
      label.textContent = `${product.name} - ${formatPrice(lineTotal)}`;

      const controls = document.createElement("div");
      controls.classList.add("qty-controls");

      const minus = document.createElement("button");
      minus.type = "button";
      minus.classList.add("btn", "btn-small");
      minus.dataset.action = "decrease";
      minus.dataset.id = id;
      minus.setAttribute("aria-label", `Decrease quantity of ${product.name}`);
      minus.textContent = "−";

      const qtyText = document.createElement("span");
      qtyText.classList.add("qty");
      qtyText.textContent = qty;

      const plus = document.createElement("button");
      plus.type = "button";
      plus.classList.add("btn", "btn-small");
      plus.dataset.action = "add";
      plus.dataset.id = id;
      plus.setAttribute("aria-label", `Increase quantity of ${product.name}`);
      plus.textContent = "+";

      const remove = document.createElement("button");
      remove.type = "button";
      remove.classList.add("btn", "btn-danger");
      remove.dataset.action = "remove";
      remove.dataset.id = id;
      remove.setAttribute("aria-label", `Remove ${product.name} from cart`);
      remove.textContent = "Remove";

      controls.append(minus, qtyText, plus, remove);
      row.append(label, controls);
      cartItems.appendChild(row);
    });

    totalPriceDisplay.textContent = formatPrice(total);
    cartCount.textContent = count;
  }

  // ---------- Event delegation (ek hi handler dono jagah) ----------
  function handleAction(e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const actions = {
      add: addToCart,
      decrease: decreaseQty,
      remove: removeFromCart,
    };
    actions[btn.dataset.action]?.(id);
  }

  productList.addEventListener("click", handleAction);
  cartItems.addEventListener("click", handleAction);
  checkOutBtn.addEventListener("click", checkout);

  // ---------- Init ----------
  renderProducts();
  renderCart();
});
