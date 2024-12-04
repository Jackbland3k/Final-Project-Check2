from django.shortcuts import render
from .models import Product
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404


# Create your views here.

def product_detail(request, product_id):
    try:
        # Use get_object_or_404 to simplify the logic and ensure proper error handling
        product = get_object_or_404(Product, id=product_id)
        return JsonResponse({
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "category": product.category.name if product.category else None,
            "image": product.image.url if product.image else None,
        })
    except Exception as e:
        # Catch any unexpected errors and return a generic error response
        return JsonResponse({"error": str(e)}, status=500)

def sync_cart(request):
    try:
        # Parse the JSON body from the request
        cart_data = json.loads(request.body).get("cart")
        if cart_data:
            # Store the cart in the session
            request.session['cart'] = cart_data
            return JsonResponse({"success": True})  # Successful sync response
        else:
            return JsonResponse({"success": False, "error": "No cart data received"}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON data"}, status=400)

def shopping_cart(request):
    cart = request.session.get('cart', {})  # Fetch cart from session
    products = []

    for product_id, quantity in cart.items():
        try:
            product = Product.objects.get(id=product_id)
            products.append({
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'quantity': quantity,
                'image': product.image.url,
                'total': product.price * quantity,
            })
        except Product.DoesNotExist:
            continue

    total_price = sum(item['total'] for item in products)
    return render(request, 'shoppingcart/shoppingcart_list.html', {
        'products': products,
        'total_price': total_price,
    })

def homepage(request):
    products = Product.objects.all()
    return render(request, "shoppingcart/homepage.html", {'products': products})