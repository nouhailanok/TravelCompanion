from django.urls import path

from .views import trip_list, trip_delete, trip_detail, home, tripForm, ajouter_post, post_detail, post_delete, post_list, post_edit, community_view, ajouter_comment, toggle_like, activite_delete, ajouter_activite, activite_detail, liste_activites, modifier_activite, basculer_terminee

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, PostViewSet, CommentViewSet, LikeViewSet, ActiviteViewSet

router = DefaultRouter()
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet)
router.register(r'likes', LikeViewSet)
router.register(r'activites', ActiviteViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]

#urlpatterns = [
#    path('',home,name='home'),
#    path('trip_list/',trip_list,name='trip_list'),
#    path('<int:trip_id>/trip_delete/', trip_delete, name='trip_delete'),
#    path('trip_detail/<int:trip_id>/', trip_detail, name='trip_detail'),
#   path('addTrip/',tripForm ,name='addTrip'),

#    path('addPost/',ajouter_post ,name='addPost'),
#    path('post_detail/<int:post_id>/', post_detail, name='post_detail'),
#    path('<int:post_id>/post_delete/', post_delete, name='post_delete'),

#    path('post_list/',post_list,name='post_list'),
#    path('post_edit/<int:post_id>/', post_edit, name='post_edit'),
#    path('community/', community_view, name='community'),
#    path('post/<int:post_id>/comment/', ajouter_comment, name='ajouter_comment'),
#    path('post/<int:post_id>/like/', toggle_like, name='toggle_like'),

#    path('<int:activite_id>/', activite_detail, name='activite_detail'),
#    path('activite/listeactivites', liste_activites, name='liste_activites'),
#    path('activite/ajouter/', ajouter_activite, name='ajouter_activite'),
#    path('<int:activite_id>/modifier/', modifier_activite, name='modifier_activite'),
#    path('<int:activite_id>/terminee/', basculer_terminee, name='terminee'),
#    path('<int:activite_id>/delete/', activite_delete, name='activite_delete'),

#]