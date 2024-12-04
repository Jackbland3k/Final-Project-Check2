from django.urls import path
from . import views
from Bakery.views import get_products

app_name = 'homepage'

urlpatterns = [
    path('', views.homepage, name='homepage'),
    path('api/products/', get_products, name='product_data' )
]
