from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission personnalisée : seuls les propriétaires peuvent modifier.
    Les autres peuvent juste lire.
    """

    def has_object_permission(self, request, view, obj):
        # Autorise les méthodes "safe" : GET, HEAD, OPTIONS
        if request.method in permissions.SAFE_METHODS:
            return True

        # Autorise les modifications seulement si l'utilisateur est le propriétaire
        return obj.owner == request.user
