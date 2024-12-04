from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

app_name = 'users'

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(template_name='users/login.html'), name ='login'),
    path('register/', views.register_view, name ="register"),
    path('check-username/', views.check_username, name='check_username'),
]
