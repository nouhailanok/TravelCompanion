from rest_framework import serializers
from .models import Trip, Post, Comment, Like, Activite
from django.contrib.auth.models import User
from account.serializers import UserSerializer # Assuming UserSerializer is in account/serializers.py
# travelcompanion/serializers.py

# Simple Serializer for Post to be used in Comment and Like serializers
# to avoid circular dependencies and keep payload concise.
class SimplePostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'Add_Place', 'Description']


# TripSerializer remains simple for now, as it's a top-level or source.
# If Trips need to show related Activites, this could be expanded later.
class TripSerializer(serializers.ModelSerializer):
    owner_details = UserSerializer(source='owner', read_only=True) # Display owner info

    class Meta:
        model = Trip
        fields = [
            'id', 'nom', 'destination', 'start_date', 'end_date',
            'trip_type', 'owner', 'owner_details',
            'latitude', 'longitude'  # Added latitude and longitude
        ]
        read_only_fields = ['owner'] # 'owner' is set by backend, so read-only in input

class ActiviteSerializer(serializers.ModelSerializer):
    # For reading, show full Trip details
    trip_details = TripSerializer(source='Trip', read_only=True) # Renamed source object for clarity
    # For writing, accept trip_id
    trip_id = serializers.PrimaryKeyRelatedField(
        queryset=Trip.objects.all(), source='Trip', write_only=True
    )

    class Meta:
        model = Activite
        # 'Trip' (the actual FK field) is implicitly handled by trip_id for writes
        # and trip_details for reads due to the 'source' argument.
        fields = [
            'id', 'nom', 'description', 'terminee', 
            'trip_details', 'trip_id',
            'location_name', 'latitude', 'longitude' # Added new location fields
        ]

class CommentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True) # Renamed for clarity
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, allow_null=True, required=False
    )

    post_details = SimplePostSerializer(source='post', read_only=True) # Renamed for clarity
    post_id = serializers.PrimaryKeyRelatedField(
        queryset=Post.objects.all(), source='post', write_only=True
    )

    class Meta:
        model = Comment
        fields = ['id', 'text', 'created_at', 'user_details', 'user_id', 'post_details', 'post_id']


# ... (Your UserSerializer, SimplePostSerializer, CommentSerializer should be here) ...

# This is your existing LikeSerializer - we'll refine it in the next step
class LikeSerializer(serializers.ModelSerializer):
        user_details = UserSerializer(source='user', read_only=True) 
        post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all()) # This is writeable by default

        class Meta:
            model = Like
            fields = ['id', 'user', 'user_details', 'post', 'created_at']
            read_only_fields = ['user', 'created_at', 'user_details'] # 'user' is set by backend

        # ---- ADD THIS VALIDATE METHOD ----
        def validate(self, data):
            # 'data' here will contain the 'post' instance (resolved from the post ID sent by frontend)
            # The 'user' is not yet in 'data' at this stage of serialization if it's set by perform_create.
            # We need to get the user from the request context.
            request = self.context.get('request')
            if not request or not hasattr(request, 'user') or not request.user.is_authenticated:
                # This should ideally be caught by permission classes on the ViewSet first
                raise serializers.ValidationError("User authentication is required to like a post.")

            user = request.user
            post_instance = data.get('post') # 'post' is the key for the Post instance

            if Like.objects.filter(user=user, post=post_instance).exists():
                raise serializers.ValidationError(
                    {"detail": "You have already liked this post."} 
                    # You could also make this a non-field error if preferred,
                    # or raise it on the 'post' field: {"post": "You have already liked this post."}
                )
            return data


class PostSerializer(serializers.ModelSerializer):
    owner_details = UserSerializer(source='owner', read_only=True) # Assuming you want owner details
    comments = CommentSerializer(many=True, read_only=True)
    image = serializers.ImageField(use_url=True, required=False, allow_null=True)

    # --- New fields for Likes ---
    likes_count = serializers.SerializerMethodField()
    current_user_like_id = serializers.SerializerMethodField() 
    # --- End of New fields for Likes ---

    class Meta:
        model = Post
        fields = [
            'id', 'image', 'Add_Place', 'Description', 
            'created_at', # Added created_at field
            'owner', # This now refers to the actual 'owner' ForeignKey ID on the Post model
            'owner_details', 
            'comments', 
            'likes_count', 'current_user_like_id',
            'latitude', 'longitude'  # Added latitude and longitude
        ]

    def get_likes_count(self, obj): # obj is the Post instance
        return obj.likes.count()

    def get_current_user_like_id(self, obj): # obj is the Post instance
        # The request object is available in the serializer context
        request = self.context.get('request', None)
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            try:
                # 'likes' is the related_name from Post to Like (Post.likes)
                like = obj.likes.get(user=request.user) 
                return like.id
            except Like.DoesNotExist:
                return None
        return None