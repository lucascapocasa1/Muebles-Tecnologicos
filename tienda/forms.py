from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True, label='Correo electrónico')
    
    # Campo para elegir tipo de usuario
    USER_TYPE_CHOICES = [
        ('user', 'Usuario (Solicitar)'),
        ('company', 'Empresa (Ofertar)')
    ]
    
    user_type = forms.ChoiceField(
        choices=USER_TYPE_CHOICES,
        widget=forms.RadioSelect,
        label='Tipo de cuenta',
        initial='user'
    )

    class Meta:
        model = User
        fields = ("username", "email", "password1", "password2", "user_type")