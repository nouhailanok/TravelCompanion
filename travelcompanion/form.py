from django import forms
from .models import Trip , Post ,Comment,Activite

class TripForm(forms.ModelForm):
    class Meta:
        model = Trip
        fields = ('nom', 'destination', 'start_date', 'end_date', 'trip_type')

    start_date = forms.DateField(
        widget=forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date'}),
        input_formats=['%Y-%m-%d'],
        required=True
    )
    end_date = forms.DateField(
        widget=forms.DateInput(format='%Y-%m-%d', attrs={'type': 'date'}),
        input_formats=['%Y-%m-%d'],
        required=True
    )

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ('image', 'Add_Place', 'Description')
        image=forms.ImageField()
        Add_Place = forms.CharField(max_length=100)
        Description = forms.CharField(max_length=100)

class ActiviteForm(forms.ModelForm):
    voyage = forms.ModelChoiceField(queryset=Trip.objects.all(), label="Voyage associé", widget=forms.Select(attrs={'class': 'form-control'}))

    class Meta:
        model = Activite
        fields = ['Trip', 'nom', 'description']
        widgets = {
            'nom': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control'}),
        }

class RechercheActiviteForm(forms.Form):
    voyage = forms.ModelChoiceField(queryset=Trip.objects.all(), required=False, label="Filtrer par voyage")


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ('text',)
