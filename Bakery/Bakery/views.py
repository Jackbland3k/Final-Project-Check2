# from django.http import HttpResponse
from django.shortcuts import render


def homepage(request):
    #return HttpResponse("Hello World? I'm Home.")
    return render(request, 'home.html')

def about(request):
    #return HttpResponse("My About page.")
    return render(request, 'about.html')

import os
import json
from django.http import JsonResponse

def load_products():
    json_file_path = os.path.join(os.path.dirname(__file__), 'products.json')
    with open(json_file_path, 'r') as file:
        return json.load(file)

def get_products(request):
    products = load_products()
    
    # Handle search
    search_query = request.GET.get('search', '').lower()
    if search_query:
        products = [
            p for p in products
            if search_query in p['name'].lower() or search_query in p['description'].lower()
        ]

    # Handle category filter
    category = request.GET.get('category', '')
    if category:
        products = [p for p in products if p['category'] == category]

    # Handle sorting by price (high to low)
    sort = request.GET.get('sort', '')
    if sort == 'price-desc':
        products = sorted(products, key=lambda x: x['price'], reverse=True)

    return JsonResponse(products, safe=False)
