function validateLoginForm() {
    const username = document.getElementById('id_username').value;
    const password = document.getElementById('id_password').value;

    if (!username || username.trim() === "") {
        alert("USERNAME IS REQUIRED!");
        return false;
    }

    if (!password || password.trim() === "") {
        alert("PASSWORD IS REQUIRED!");
        return false;
    }
    return true;
}

async function checkUsernameAvailability(username) {
    try {
        const response = await fetch(`/users/check-username/?username=${encodeURIComponent(username)}`);
        if (!response.ok) {
            throw new Error("Failed to fetch username availability.");
        }

        const data = await response.json();
        if (!data.available) {
            alert("THIS USERNAME IS ALREADY TAKEN!");
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error in checkUsernameAvailability:", error);
        alert("An error occurred while checking username availability. Please try again.");
        return false;
    }
}

async function validateRegistrationForm() {
    const username = document.getElementById('id_username').value;
    const password1 = document.getElementById('id_password1').value;
    const password2 = document.getElementById('id_password2').value;

    if (!username || username.trim() === "") {
        alert("USERNAME IS REQUIRED!");
        return false;
    }

    if (!password1 || password1.trim() === "") {
        alert("PASSWORD IS REQUIRED!");
        return false;
    }

    if (password1.length < 12) {
        alert("PASSWORD MUST BE AT LEAST 12 CHARACTERS LONG!");
        return false;
    }

    if (password1 !== password2) {
        alert("PASSWORDS DO NOT MATCH!");
        return false;
    }

    const isUsernameAvailable = await checkUsernameAvailability(username);
    if (!isUsernameAvailable) {
        return false;
    }

    return true;
}

function generateProductCard(product) {
    return `
        <div class="col-md-3 d-flex justify-content-center">
            <div class="card mb-4">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="card-text"><strong>Price: $${product.price}</strong></p>

                    <div class="d-flex align-items-center">
                        <button class="btn btn-secondary" onclick="updateQuantity(${product.id}, -1)">-</button>
                        <input type="number" id="quantity-${product.id}" value="${cart[product.id] || 0}" min="0" class="form-control mx-2" style="width: 60px;">
                        <button class="btn btn-secondary" onclick="updateQuantity(${product.id}, 1)">+</button>
                    </div>

                    <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
        </div>`;
}

let cart = {};  // Initialize the cart as an object

function updateCartButton() {
    const totalQuantity = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    const badge = document.getElementById('cart-button');

    if (badge) {
        if (totalQuantity > 0) {
            badge.innerText = totalQuantity;  // Display total items in the badge
            badge.style.display = 'inline-block';  // Show the badge
        } else {
            badge.innerText = '';  // Clear text when no items in the cart
            badge.style.display = 'none';  // Hide the badge
        }
    }
}

async function fetchProducts(queryParams = '') {
    try {
        const response = await fetch(`/api/products/${queryParams}`);
        
        // Check if the response status is OK (200-299)
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return;  // Exit if the response is not OK
        }

        let products = [];
        try {
            products = await response.json();  // Try parsing JSON
        } catch (jsonError) {
            console.error("Error parsing JSON:", jsonError);
            return;  // Exit if JSON parsing fails
        }

        const productGrid = document.getElementById('product-grid');
        if (!productGrid) {  // Ensure productGrid exists in the DOM
            console.error('Error: #product-grid element not found in the DOM');
            return;  // Exit if the element doesn't exist
        }

        let productCardsHTML = '';

        products.forEach(product => {
            productCardsHTML += generateProductCard(product);
        });

        productGrid.innerHTML = productCardsHTML;
        updateCartButton();  // Update cart button after products are fetched

    } catch (error) {
        console.error('Error fetching products:', error);
    }
}


// The `DOMContentLoaded` event listener only calls `fetchProducts()`
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();  // This will trigger the fetching and updating the cart button
});


function updateQuantity(productId, change) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    let newQuantity = parseInt(quantityInput.value) + change;

    if (newQuantity < 0) newQuantity = 0;

    quantityInput.value = newQuantity;
}



function searchProducts() {
    const query = document.getElementById('search-bar').value;
    fetchProducts(`?search=${query}`);
}

function filterProducts() {
    const category = document.getElementById('category-filter').value;
    const sort = document.getElementById('price-filter').value;
    fetchProducts(`?category=${category}&sort=${sort}`);
}

function getCSRFToken() {
    const cookieValue = document.cookie.split('; ').find(row => row.startsWith('csrftoken='));
    return cookieValue ? cookieValue.split('=')[1] : null;
}

function addToCart(productId) {
    const quantityInput = document.getElementById(`quantity-${productId}`);
    if (!quantityInput) {
        console.error(`Error: Quantity input for product ID ${productId} not found.`);
        return;
    }

    const quantity = parseInt(quantityInput.value);
    if (quantity > 0) {
        if (!cart[productId]) cart[productId] = 0;
        cart[productId] += quantity;

        localStorage.setItem('cart', JSON.stringify(cart));

        fetch('/shoppingcart/sync/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ cart }),
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  updateCartButton();
              } else {
                  console.error('Failed to sync cart:', data.error);
              }
          });
    }
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Call loadCart when the page loads
document.addEventListener('DOMContentLoaded', loadCart);

function updateGridDisplay() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) {
        console.error('Error: #product-grid element not found in the DOM');
        return; // Exit if the element doesn't exist
    }


    const productCards = productGrid.querySelectorAll('.card');
    if (productCards.length < 3) {
        productGrid.style.justifyContent = 'flex-start';
    } else {
        productGrid.style.justifyContent = 'space-evenly';
    }
}


function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price-container');
    
    if (!cartItemsContainer || !totalPriceElement) {
        console.error('Error: Cart items container or total price element not found.');
        return;
    }

    // Clear the cart items container
    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    // Loop through each item in the cart and display it
    Object.keys(cart).forEach(productId => {
        const quantity = cart[productId];
        
        // Fetch product details
        fetch(`/api/products/${productId}`)
            .then(response => response.json())
            .then(product => {
                const itemTotal = product.price * quantity;
                totalPrice += itemTotal;

                // Create HTML for cart item
                const cartItemHTML = `
                    <div class="cart-item" data-id="${productId}">
                        <img src="${product.image}" alt="${product.name}" class="cart-item-image" />
                        <div class="cart-item-details">
                            <h5>${product.name}</h5>
                            <p>Price: $${product.price}</p>
                            <p>Quantity: <input type="number" class="quantity-input" value="${quantity}" min="0" onchange="updateItemQuantity(${productId}, this.value)" /></p>
                            <p>Total: $${itemTotal}</p>
                            <button class="remove-item-btn" onclick="removeFromCart(${productId})">Remove</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.innerHTML += cartItemHTML;

                // Update total price
                totalPriceElement.textContent = totalPrice.toFixed(2);
            })
            .catch(error => console.error('Error fetching product:', error));
    });
}


// Update item quantity
function updateItemQuantity(productId, newQuantity) {
    newQuantity = parseInt(newQuantity);

    // Ensure quantity is non-negative
    if (newQuantity < 0) newQuantity = 0;

    // Update cart object and refresh display
    cart[productId] = newQuantity;
    updateCartDisplay();
}

// Remove item from cart
function removeFromCart(productId) {
    delete cart[productId];
    updateCartDisplay();
}

// Update the cart display after any changes (i.e., updating quantity or removing item)
function updateCartDisplay() {
    displayCart();  // Re-render the entire cart
    updateCartButton();  // Update the cart button (e.g., the number of items in the cart)
}

// Proceed to checkout (just a placeholder for now)
function checkout() {
    alert('Proceeding to checkout...');
}

// Initial call to display cart when the page loads
document.addEventListener('DOMContentLoaded', updateCartDisplay);


fetchProducts().then(updateGridDisplay);

