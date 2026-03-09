from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from .form import TripForm , PostForm,CommentForm,ActiviteForm, RechercheActiviteForm
from .models import Trip , Post, Comment,Like,Activite
from rest_framework import viewsets, permissions
from .models import Trip, Post, Comment,Like
from .serializers import TripSerializer, PostSerializer, CommentSerializer,LikeSerializer, ActiviteSerializer
from rest_framework.permissions import IsAuthenticated
from .filters import TripFilter , ActiviteFilter ,PostFilter,CommentFilter, LikeFilter
from rest_framework.permissions import IsAuthenticated # Specific import for IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly # Or IsAuthenticated
from .permissions import IsOwnerOrReadOnly
from django.db.models import Q # Added Q import




def home(request):
    trips = Trip.objects.all()
    context = {'trips': trips}
    return render(request,"home.html",context)
def trip_detail(request,trip_id):
    trip = Trip.objects.get(pk=trip_id)
    context = {'trip': trip}
    return render(request,"trip_detail.html",context)
def trip_delete(request,trip_id):
    trip = Trip.objects.get(pk=trip_id)
    trip.delete()
    return trip_list(request)
def trip_list(request):
    trips = Trip.objects.all()
    context = {'trips': trips}
    return render(request,"trip_list.html",context)


def tripForm(request):
    if request.method == "POST":
        form = TripForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('trip_list')
        else:
            return render(request, 'form.html', {'form': form})
    else:
        form = TripForm()  # Affiche un formulaire vide si la méthode est GET
        return render(request, 'form.html', {'form': form})

def ajouter_post(request):
    if request.method == "POST":
        form = PostForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('post_list')
        else:
            return render(request, 'formPost.html', {'form': form})
    else:
        form = PostForm()
        return render(request, 'formPost.html', {'form': form})



def post_delete(request,post_id):
    post = Post.objects.get(pk=post_id)
    post.delete()
    return post_list(request)


def post_detail(request, post_id):
    post = Post.objects.get(pk=post_id)
    context = {'posts': post}
    return render(request, "post_detail.html", context)

def post_list(request):
    post = Post.objects.all()
    context = {'posts': post}
    return render(request,"post_list.html",context)

def post_edit(request, post_id):  # Utiliser post_id (en minuscule)
    post = Post.objects.get(pk=post_id)
    if request.method == "POST":
        form = PostForm(request.POST,request.FILES, instance=post)
        if form.is_valid():
            form.save()
            return post_list(request)
    else:
        form = PostForm(instance=post)
    return render(request, 'formPost.html', {'form': form})


def community_view(request):
    city = request.GET.get('city')
    if city:
        posts = Post.objects.filter(Add_Place__iexact=city)
    else:
        posts = Post.objects.all()

    cities = Post.objects.values_list('Add_Place', flat=True).distinct()

    context = {
        'posts': posts,
        'cities': cities,
        'selected_city': city,
    }
    return render(request, 'community.html', context)

def ajouter_comment(request, post_id):
    post = Post.objects.get(id=post_id)

    if request.method == "POST":
        form = CommentForm(request.POST)
        if form.is_valid():
            comment = form.save(commit=False)
            comment.post = post

            if request.user.is_authenticated:
                comment.user = request.user
            else:
                comment.user = None  # ou un utilisateur par défaut si tu veux

            comment.save()
            return redirect('community')  # ou community_view(request)
    else:
        form = CommentForm()

    return render(request, 'commentForm.html', {'form': form, 'post': post})


def toggle_like(request, post_id):
    if not request.user.is_authenticated:
        return redirect('login')  # Rediriger vers login si non connecté

    post = get_object_or_404(Post, id=post_id)
    like, created = Like.objects.get_or_create(post=post, user=request.user)

    if not created:
        like.delete()  # Si like existe déjà, on le supprime (unlike)
    return redirect('post_detail', post_id=post.id)



def liste_activites(request):
    form = RechercheActiviteForm(request.GET or None)
    activites = Activite.objects.all()

    if form.is_valid() and form.cleaned_data['voyage']:
        activites = activites.filter(Trip=form.cleaned_data['voyage'])

    return render(request, 'liste_activites.html', {'activites': activites, 'form': form})

def activite_delete(request, activite_id):
    voyage = Activite.objects.get(id=activite_id)
    voyage.delete()
    return liste_activites(request)

def ajouter_activite(request):
    if request.method == "POST":
        form = ActiviteForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('liste_activites')  # Redirection après ajout
    else:
        form = ActiviteForm()
        return render(request, 'ajouter_activite.html', {'form': form})

def modifier_activite(request, activite_id):
    activite = Activite.objects.get(id=activite_id)
    if request.method == "POST":
        form = ActiviteForm(request.POST, request.FILES, instance=activite)
        if form.is_valid():
            form.save()
            return redirect('activite_detail', activite_id=activite.id)
    else:
        form = ActiviteForm(instance=activite)
    return render(request, 'modifier_activite.html', {'form': form})

def activite_detail(request, activite_id):
    activite = Activite.objects.get(id=activite_id)
    return render(request, 'activite_detail.html', {'activite': activite})


def basculer_terminee(request, activite_id):
    activite = Activite.objects.get(id=activite_id)
    activite.terminee = not activite.terminee
    activite.save()
    return redirect('liste_activites')


class TripViewSet(viewsets.ModelViewSet):
    # queryset = Trip.objects.all() # REMOVE or keep commented
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = TripFilter # Kept if used for other filters

    def get_queryset(self):
        """
        This view should return a list of all the trips
        for the currently authenticated user.
        Optionally restricts the returned trips based on search term (name, destination),
        date range (start_date, end_date), and trip_type.
        """
        user = self.request.user
        queryset = Trip.objects.none() # Start with an empty queryset

        if user.is_authenticated:
            queryset = Trip.objects.filter(owner=user).order_by('-id') # Get user's trips, newest first

            search_term = self.request.query_params.get('search', None)
            if search_term is not None:
                queryset = queryset.filter(
                    Q(nom__icontains=search_term) |
                    Q(destination__icontains=search_term)
                )
            
            start_date_str = self.request.query_params.get('start_date', None)
            end_date_str = self.request.query_params.get('end_date', None)

            if start_date_str:
                queryset = queryset.filter(start_date__gte=start_date_str)
            
            if end_date_str:
                queryset = queryset.filter(end_date__lte=end_date_str)

            trip_type_filter = self.request.query_params.get('trip_type', None)
            if trip_type_filter and trip_type_filter != 'all': # Assuming 'all' means no filter
                queryset = queryset.filter(trip_type__iexact=trip_type_filter)

        return queryset

    def perform_create(self, serializer):
        """
        Assign the current user as the owner of the trip when it's created.
        """
        serializer.save(owner=self.request.user)


class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filterset_class = PostFilter # Kept if used for other filters

    def get_queryset(self):
        """
        Optionally restricts the returned posts to a given search term
        (searching Add_Place and Description fields) and/or date range.
        Posts are ordered by newest first.
        """
        queryset = Post.objects.all().order_by('-id') # Order by newest first (assuming ID correlates with creation time)
                                                    # If there's a specific 'created_at' field, '-created_at' would be better.

        search_term = self.request.query_params.get('search', None)
        if search_term is not None:
            queryset = queryset.filter(
                Q(Add_Place__icontains=search_term) | 
                Q(Description__icontains=search_term)
            )
        
        start_date_str = self.request.query_params.get('start_date', None)
        end_date_str = self.request.query_params.get('end_date', None)

        # Ensure you have a DateTimeField or DateField in your Post model, e.g., 'created_at'
        # Replace 'created_at' with the actual field name if different.
        date_field_name = 'created_at' # Or 'date_posted', 'publication_date', etc.

        if start_date_str:
            # Filter for posts created on or after the given start_date
            # Ensure the field lookup is appropriate (e.g., __gte for date, __date__gte for datetime if only date is passed)
            queryset = queryset.filter(**{f"{date_field_name}__gte": start_date_str})
        
        if end_date_str:
            # Filter for posts created on or before the given end_date
            # To include the whole day, you might need to adjust if it's a DateTimeField
            # e.g., filter by date part or use end_date + 1 day for < comparison if time is 00:00:00
            queryset = queryset.filter(**{f"{date_field_name}__lte": end_date_str})
            # If 'date_field_name' is a DateTimeField and you want to include the entire end_date,
            # you might need to do something like:
            # from datetime import datetime, timedelta
            # end_date_obj = datetime.strptime(end_date_str, "%Y-%m-%d") + timedelta(days=1)
            # queryset = queryset.filter(**{f"{date_field_name}__lt": end_date_obj.strftime("%Y-%m-%d")})
            # For simplicity, __lte is used assuming DateField or appropriate frontend handling for DateTimeField.

        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
        queryset = Comment.objects.all()
        serializer_class = CommentSerializer
        permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Example: Allow read for anyone, write for authenticated

        def perform_create(self, serializer):
            # Automatically set the user of the comment to the logged-in user
            serializer.save(user=self.request.user) 
        def destroy(self, request, *args, **kwargs):
            instance = self.get_object() # Get the comment instance
            if instance.user != request.user:
                # If the comment's user is not the one making the request
                return Response(
                    {"detail": "You do not have permission to delete this comment."},
                    status=status.HTTP_403_FORBIDDEN
                )
            # If the user is the owner, proceed with default deletion
            return super().destroy(request, *args, **kwargs)
        # ---- END OF ADDITION ----


class LikeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows likes to be viewed, created, or deleted.
    """
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated] # Only authenticated users can create or delete likes

    # Optional: Add filtering if needed, e.g., by user or by post
    # filterset_fields = ['user', 'post'] 
    # or use a custom filterset_class = LikeFilter

    def perform_create(self, serializer):
        """
        Automatically set the user of the like to the logged-in user.
        The 'post' (ID of the post being liked) is expected in request.data
        and will be handled by the LikeSerializer.
        The LikeSerializer's validate method already checks for duplicate likes.
        """
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """
        Allow only the user who created the like to delete it (unlike).
        """
        instance = self.get_object() # Gets the Like instance by its ID from the URL (pk in kwargs)
        if instance.user != request.user:
            return Response(
                {"detail": "You do not have permission to remove this like."},
                status=status.HTTP_403_FORBIDDEN
            )
        # If user is the owner, proceed with default deletion
        self.perform_destroy(instance) # Call perform_destroy on the instance
        return Response(status=status.HTTP_204_NO_CONTENT) # Standard response for successful DELETE

class ActiviteViewSet(viewsets.ModelViewSet):
    queryset = Activite.objects.all()
    serializer_class = ActiviteSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = ActiviteFilter 