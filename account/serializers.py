from rest_framework import serializers
from django.contrib.auth.models import User  # ou ton modèle custom s'il y en a un

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
