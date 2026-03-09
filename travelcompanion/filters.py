import django_filters
from .models import Trip, Post, Activite, Comment, Like  # Ensure all models are imported


class TripFilter(django_filters.FilterSet):
    # Allow filtering by destination, case-insensitive partial match
    destination = django_filters.CharFilter(field_name='destination', lookup_expr='icontains')

    # Allow filtering by trip_type, exact match (case-sensitive by default for choices)
    trip_type = django_filters.ChoiceFilter(field_name='trip_type',
                                            choices=Trip.triptype.choices)  # Use choices from model

    # Allow filtering for trips starting after a given date
    start_date_after = django_filters.DateFilter(field_name='start_date',
                                                 lookup_expr='gte')  # gte = greater than or equal to

    # Allow filtering for trips ending before a given date
    end_date_before = django_filters.DateFilter(field_name='end_date', lookup_expr='lte')  # lte = less than or equal to

    # For exact match on 'nom' (name of the trip)
    nom = django_filters.CharFilter(field_name='nom', lookup_expr='iexact')  # iexact for case-insensitive exact match

    class Meta:
        model = Trip
        fields = ['destination', 'trip_type', 'start_date_after', 'end_date_before', 'nom']
        # Note: 'fields' in Meta can also be a dictionary to customize individual fields,
        # but explicit definition as above gives more control over lookup_expr.
        # If you just list field names here like:
        # fields = ['nom', 'destination', 'trip_type', 'start_date', 'end_date']
        # it will create exact match filters by default. For more complex lookups (like icontains, date ranges),
        # defining them as class attributes is better.


class ActiviteFilter(django_filters.FilterSet):
    # Filter by the name of the activity, case-insensitive partial match
    nom = django_filters.CharFilter(field_name='nom', lookup_expr='icontains')

    # Filter by the related Trip's ID
    # Renamed from 'trip_id' to 'trip' to match the query parameter from frontend (?trip=...)
    # The field_name 'Trip__id' (or 'Trip') correctly targets the foreign key.
    trip = django_filters.NumberFilter(field_name='Trip__id')

    # Filter by whether the activity is finished or not
    terminee = django_filters.BooleanFilter(field_name='terminee')

    class Meta:
        model = Activite
        # Updated to use 'trip' instead of 'trip_id' in the fields list
        fields = ['nom', 'trip', 'terminee']


class PostFilter(django_filters.FilterSet):
    # Filter by place, case-insensitive partial match
    add_place = django_filters.CharFilter(field_name='Add_Place', lookup_expr='icontains')

    # Optional: Filter by description, case-insensitive partial match
    description = django_filters.CharFilter(field_name='Description', lookup_expr='icontains')

    class Meta:
        model = Post
        fields = ['add_place', 'description']


class CommentFilter(django_filters.FilterSet):
    # Filter by the related Post's ID
    post_id = django_filters.NumberFilter(field_name='post__id')  # Or simply 'post'

    # Filter by the related User's ID
    user_id = django_filters.NumberFilter(field_name='user__id')  # Or simply 'user'

    # Filter by text content, case-insensitive partial match
    text = django_filters.CharFilter(field_name='text', lookup_expr='icontains')

    class Meta:
        model = Comment
        fields = ['post_id', 'user_id', 'text']


class LikeFilter(django_filters.FilterSet):
    # Filter by the related Post's ID
    post_id = django_filters.NumberFilter(field_name='post__id')  # Or simply 'post'

    # Filter by the related User's ID
    user_id = django_filters.NumberFilter(field_name='user__id')  # Or simply 'user'

    class Meta:
        model = Like
        fields = ['post_id', 'user_id']