from django.urls import path
from . import views

urlpatterns = [
   path('', views.shopping_cart, name='shopping_cart'),
   path('sync/', views.sync_cart, name='sync_cart'),
   path('api/products/<int:product_id>/', views.product_detail, name='product_detail'),

]
