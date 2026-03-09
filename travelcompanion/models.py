from django.contrib.auth.models import User
from django.db import models
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderUnavailable


class Trip (models.Model):
    owner = models.ForeignKey(User, related_name='trips', on_delete=models.CASCADE, null=True, blank=True)
    triptype=models.TextChoices('TripType','Solo Family Business Backpacker Other')
    nom=models.CharField(max_length=50)
    destination =models.CharField(max_length=50)
    start_date=models.DateField()
    end_date=models.DateField()
    trip_type=models.CharField(blank = True,max_length=50,choices=triptype)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # Store the original destination to check for changes
    _original_destination = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_destination = self.destination

    def save(self, *args, **kwargs):
        # Check if destination changed or if coordinates are missing and destination exists
        if (self.destination and self._original_destination != self.destination) or \
           (self.destination and (self.latitude is None or self.longitude is None)):
            try:
                geolocator = Nominatim(user_agent="travelcompanion_app_1.0") # Replace with your app's name/version
                location = geolocator.geocode(self.destination, timeout=10)
                if location:
                    self.latitude = location.latitude
                    self.longitude = location.longitude
                else:
                    # Optionally, clear coordinates if geocoding fails for a new address
                    self.latitude = None
                    self.longitude = None
            except (GeocoderTimedOut, GeocoderUnavailable):
                # Handle timeout or service unavailability, maybe log it
                # For now, we'll pass and not update coordinates
                pass # Or set self.latitude = None; self.longitude = None
            except Exception as e:
                # Catch any other geopy errors
                print(f"Geocoding error for Trip {self.nom}: {e}") # Basic error logging
                pass # Or set self.latitude = None; self.longitude = None
        super().save(*args, **kwargs)
        self._original_destination = self.destination # Update original destination after save

    def __str__(self):
        return self.nom

class Activite(models.Model):
    Trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    nom = models.CharField(max_length=200)
    description = models.TextField()
    terminee = models.BooleanField(default=False)
    location_name = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    _original_location_name = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_location_name = self.location_name

    def save(self, *args, **kwargs):
        if (self.location_name and self._original_location_name != self.location_name) or \
           (self.location_name and (self.latitude is None or self.longitude is None)):
            try:
                geolocator = Nominatim(user_agent="travelcompanion_app_1.0_activity")
                location_data = geolocator.geocode(self.location_name, timeout=10)
                if location_data:
                    self.latitude = location_data.latitude
                    self.longitude = location_data.longitude
                else:
                    self.latitude = None
                    self.longitude = None
            except (GeocoderTimedOut, GeocoderUnavailable):
                pass
            except Exception as e:
                print(f"Geocoding error for Activity {self.nom}: {e}")
                pass
        super().save(*args, **kwargs)
        self._original_location_name = self.location_name

    def __str__(self):
        return f"{self.nom} - {self.Trip}"


class Post (models.Model):
    owner = models.ForeignKey(User, related_name='posts_created_by_user', on_delete=models.CASCADE, null=True, blank=False)
    image = models.ImageField(upload_to = 'posts/', null=True, blank=True)
    Add_Place=models.CharField(max_length=50)
    Description=models.CharField(max_length=100) # Consider making this a TextField for longer descriptions
    created_at = models.DateTimeField(auto_now_add=True, null=True) # Added null=True temporarily for existing rows
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    _original_add_place = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_add_place = self.Add_Place

    def save(self, *args, **kwargs):
        if (self.Add_Place and self._original_add_place != self.Add_Place) or \
           (self.Add_Place and (self.latitude is None or self.longitude is None)):
            try:
                geolocator = Nominatim(user_agent="travelcompanion_app_1.0") # Replace with your app's name/version
                location = geolocator.geocode(self.Add_Place, timeout=10)
                if location:
                    self.latitude = location.latitude
                    self.longitude = location.longitude
                else:
                    self.latitude = None
                    self.longitude = None
            except (GeocoderTimedOut, GeocoderUnavailable):
                pass
            except Exception as e:
                print(f"Geocoding error for Post {self.id or 'New Post'}: {e}")
                pass
        super().save(*args, **kwargs)
        self._original_add_place = self.Add_Place

    def __str__(self):
        return self.Add_Place

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Comment by {self.user} on {self.post.Add_Place}"


class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

