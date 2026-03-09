from django.shortcuts import render, redirect
from django.core.validators import validate_email
from django.contrib.auth.models import User
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.core.mail import EmailMessage
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework import viewsets
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated
# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User # Assuming standard User model
from rest_framework import serializers # Import serializers
from django.core.exceptions import ValidationError # Import ValidationError
from rest_framework.decorators import action # <--- IMPORT action


class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class EmailLoginAPIView(APIView):
    """
    API View for user login with email and password.
    Returns an auth token upon successful authentication.
    """
    permission_classes = [] # No permissions required to attempt login
    serializer_class = EmailLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            # Attempt to find user by email
            try:
                user_obj = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

            # Authenticate user
            # authenticate() expects username, so we use the username from the user_obj
            user = authenticate(request, username=user_obj.username, password=password)

            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({'token': token.key}, status=status.HTTP_200_OK)
            else:
                # This case might happen if password is wrong for the found email's user
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewSet(viewsets.ReadOnlyModelViewSet): # Current UserViewSet is ReadOnly
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated] # Requires user to be authenticated

    # ADD THIS ACTION:
    @action(detail=False, methods=['get'], url_path='me', permission_classes=[IsAuthenticated])
    def get_current_user_details(self, request):
        """
        Return the details of the currently authenticated user.
        """
        user = request.user # request.user will be the authenticated user instance
        serializer = self.get_serializer(user) # Use the ViewSet's serializer
        return Response(serializer.data)








@csrf_exempt
def sign_in(request):
    if request.method == "POST":
        import json
        data = json.loads(request.body)

        email = data.get('email', None)
        password = data.get('password', None)

        if email and password:
            user = User.objects.filter(email=email).first()
            if user:
                auth_user = authenticate(username=user.username, password=password)
                if auth_user:
                    login(request, auth_user)
                    return JsonResponse({'message': 'Connexion réussie'}, status=200)
                else:
                    return JsonResponse({'error': 'Mot de passe incorrect'}, status=400)
            else:
                return JsonResponse({'error': 'Utilisateur non trouvé'}, status=400)
        else:
            return JsonResponse({'error': 'Email ou mot de passe manquant'}, status=400)

    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)



@csrf_exempt
def sing_up(request):
    if request.method == "POST":
        data = json.loads(request.body)
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        try:
            validate_email(email)
        except ValidationError: # Catch specific email validation error
            return JsonResponse({'error': "Email non valide"}, status=400)


        if User.objects.filter(Q(username=name) | Q(email=email)).exists():
            return JsonResponse({'error': "Utilisateur déjà existant"}, status=400)

        try:
            user = User.objects.create_user(username=name, email=email, password=password)
            # user.save() # Not strictly needed here as create_user saves.
            return JsonResponse({'message': "Inscription réussie"}, status=201)
        except ValidationError as e: # Catch password validation errors (and others)
            return JsonResponse({'error': e.messages_dict if hasattr(e, 'messages_dict') else list(e)}, status=400)
        except Exception as e: # Catch any other unexpected errors
            # Log this e for debugging, it's an unexpected server error.
            print(f"Unexpected error during user creation: {e}")
            return JsonResponse({'error': "Une erreur interne est survenue."}, status=500)

    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)



def sing_up_n(request):
    error = False
    message = ""
    if request.method == "POST":
        name = request.POST.get('name', None)
        email = request.POST.get('email', None)
        password = request.POST.get('password', None)
        repassword = request.POST.get('repassword', None)
        # Email
        try:
            validate_email(email)
        except:
            error = True
            message = "Enter un email valide svp!"
        # password
        if error == False:
            if password != repassword:
                error = True
                message = "Les deux mot de passe ne correspondent pas!"
        # Exist
        user = User.objects.filter(Q(email=email) | Q(username=name)).first()
        if user:
            error = True
            message = f"Un utilisateur avec email {email} ou le nom d'utilisateur {name} exist déjà'!"

        # register
        if error == False:
            user = User(
                username=name,
                email=email,
            )
            user.save()

            user.password = password
            user.set_password(user.password)
            user.save()

            return redirect('sign_in')

            # print("=="*5, " NEW POST: ",name,email, password, repassword, "=="*5)
    context = {
        'error': error,
        'message': message
    }
    return render(request, 'register.html', context)



@login_required(login_url='sing_in')
def dashboard(request):
    return render(request, 'home.html', {})


def log_out(request):
    logout(request)
    return redirect('sing_in')


def forgot_password(request):
    error = False
    success = False
    message = ""
    if request.method == 'POST':
        email = request.POST.get('email')
        user = User.objects.filter(email=email).first()
        if user:
            print("processing forgot password")
            html = """
                <p> Hello, merci de cliquer pour modifier votre email </p>
            """

            msg = EmailMessage(
                "Modification de mot de pass!",
                html,
                "soroib0879@gmail.com",
                ["soro4827@gmail.com"],
            )

            msg.content_subtype = 'html'
            msg.send()

            message = "processing forgot password"
            success = True
        else:
            print("user does not exist")
            error = True
            message = "user does not exist"

    context = {
        'success': success,
        'error': error,
        'message': message
    }
    return render(request, "forgot_password.html", context)


def update_password(request):
    return render(request, "update_password.html", {})





