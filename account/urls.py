
from django.contrib import admin
from django.urls import path, include

from account.views import (
    sign_in, sing_up, dashboard, log_out,
    forgot_password, update_password
)



from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet,EmailLoginAPIView
from rest_framework.authtoken.views import obtain_auth_token


router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    # This includes URLs registered with the router (e.g., /api/users/)
    path('api/', include(router.urls)),

    # URL for email-based token login
    path('api/token/login/', EmailLoginAPIView.as_view(), name='email_login_token'),

    # URL for username-based token login (DRF default)
    path('api/token/', obtain_auth_token, name='username_login_token'),

    # ADD THIS LINE for the registration endpoint:
    path('api/register/', sing_up, name='api_register'),
]

#urlpatterns = [
#    path('', dashboard, name='dashboard'),
#    path('login', sign_in, name='sign_in'),
#    path('register', sing_up, name='sing_up'),
#    path('logout', log_out, name='log_out'),
#    path('forgot-password', forgot_password, name='forgot_password'),
#    path('update-password', update_password, name='update_password'),
#]
