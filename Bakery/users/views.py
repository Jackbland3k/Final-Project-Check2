from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

# Create your views here.
def register_view(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('users:login')
    else:
        form = UserCreationForm()
    return render(request, "users/register.html", {'form': form})



def check_username(request):
    username = request.GET.get('username', None)
    if username:
        is_available = not User.objects.filter(username=username).exists()
        return JsonResponse({'available': is_available})
    return JsonResponse({'available': False, 'error': 'No username provided'}, status=400)