from django.shortcuts import render

# Create your views here.
from django.shortcuts import render

def index(request):
    return render(request, 'tienda/index.html')

from django.shortcuts import render

def login_view(request):
    return render(request, 'tienda/login2.html')  # Esta es la plantilla que se renderiza

from django.shortcuts import redirect

def redirigir_a_login(request):
    return redirect('login2')  # Redirige a la ruta 'login2' (que ya definiste en urls.py)
