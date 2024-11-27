const menu = document.getElementById("menu")
const cartBtn = document.getElementById("cart-btn")
const cartModal = document.getElementById("cart-modal")
const cartItemContainer = document.getElementById("cart-items")
const cartTotal = document.getElementById("cart-total")
const checkoutBtn = document.getElementById("checkout-btn")
const closeModalBtn = document.getElementById("close-modal-btn")
const cartCounter = document.getElementById("cart-count")
const addressInput = document.getElementById("address")
const addressWarn = document.getElementById("address-warn")

let cart = []

cartBtn.addEventListener("click", function () {
  cartModal.style.display = "flex"
});

cartModal.addEventListener("click", function (event) {
  if (event.target === cartModal) {
    cartModal.style.display = "none"
  }
});

closeModalBtn.addEventListener("click", function () {
  cartModal.style.display = "none"
});

menu.addEventListener("click", function (event) {
  let parentButton = event.target.closest(".add-to-cart-btn")
  if (parentButton) {
    const name = parentButton.getAttribute("data-name")
    const price = parseFloat(parentButton.getAttribute("data-price"))
    addToCart(name, price)

  }
})

function addToCart(name, price) {
  const existingItem = cart.find(item => item.name === name)

  if (existingItem) {
    existingItem.quantity += 1;
    return;

  } else {

    cart.push({
      name: name,
      price: price,
      quantity: 1,
    });
    updateCartModal();
  }
}

function updateCartModal() {
  cartItemContainer.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

    cartItemElement.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <p class="font-medium">${item.name}</p>
        <p>Qtd: ${item.quantity}</p>
        <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
      </div>
  
        <button class="remove-from-cart-btn" data-name="${item.name}">Remover</button>

    </div>
    `
    cartItemContainer.appendChild(cartItemElement);
    total += item.price * item.quantity;
  });

  cartTotal.textContent = total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  cartCounter.innerHTML = cart.length;

}


cartItemContainer.addEventListener("click", function (event) {
  if (event.target.classList.contains("remove-from-cart-btn")) {
    const name = event.target.getAttribute("data-name")

    removeItemCard(name);
  }
});

function removeItemCard(name) {
  const index = cart.findIndex(item => item.name == name);
  if (index !== - 1) {
    const item = cart[index];

    if (item.quantity > 1) {
      item.quantity -= 1;
      updateCartModal();
      return;

    }
    cart.splice(index, 1);
    updateCartModal();
  }
}

addressInput.addEventListener("input", function (event) {
  let inputValue = event.target.value;
  if (inputValue !== "") {

    addressInput.classList.remove("border-red-500");
    addressWarn.classList.add("hidden");
  }
});

checkoutBtn.addEventListener("click", function () {

  const isOpen = checkIsOpen();
  if (!isOpen) {
    Toastify({
      text: "Ops o restaurante está fechado no momento!",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right", 
      stopOnFocus: true, 
      style: {
        background: "#ef4444",
      },
    }).showToast();

    return;
  }

  if (cart.length === 0) return;
  if (addressInput.value === "") {
    addressWarn.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    return;
  }

  // Preparar os dados do pedido
  const cartItems = cart.map((item) => {
    return {
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    };
  });

  const orderData = {
    items: cartItems,
    total: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    address: addressInput.value,
    createdAt: new Date().toISOString(),
  };

  // Enviar os dados do pedido para o backend
  fetch("/api/pedido", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Pedido enviado com sucesso
        Toastify({
          text: "Pedido realizado com sucesso!",
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
          style: {
            background: "#4CAF50",  // Verde
          },
        }).showToast();
        // Limpar o carrinho
        cart = [];
        updateCartModal();
        addressInput.value = "";  // Limpar o campo de endereço
      } else {
        // Caso ocorra algum erro
        Toastify({
          text: "Erro ao processar o pedido. Tente novamente.",
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
          style: {
            background: "#ef4444",  // Vermelho
          },
        }).showToast();
      }
    })
    .catch((error) => {
      console.error("Erro ao enviar o pedido:", error);
      Toastify({
        text: "Erro ao enviar o pedido. Tente novamente.",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "#ef4444",  // Vermelho
        },
      }).showToast();
    });
});

function checkIsOpen() {
  const data = new Date();
  const hora = data.getHours();
  return hora >= 18 && hora < 22;
}

const spanItem = document.getElementById("date-span");
const isOpen = checkIsOpen();

if (isOpen) {
  spanItem.classList.remove("bg-red-500");
  spanItem.classList.add("bg-green-600");
} else {
  spanItem.classList.remove("bg-green-600");
  spanItem.classList.add("bg-red-500");
}


