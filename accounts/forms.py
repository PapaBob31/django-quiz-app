from django import forms

class SignUpForm(forms.Form):
	username = forms.CharField(label="Username", max_length=30, help_text='username', widget=forms.TextInput(
		attrs={'id': 'username', 'class': "mb-2 rounded-1 p-1 mt-1",  'autocomplete':'on'}
	))
	email = forms.EmailField(label="Email", max_length=150, help_text='email', widget=forms.EmailInput(
		attrs={'id': 'email', 'class': "mb-2 rounded-1 p-1 mt-1",  'autocomplete':'on'}
	))
	password1 = forms.CharField(label="Password", max_length=20, help_text='password1', widget=forms.PasswordInput(
		attrs={'id': 'password1', 'class': "mb-2 rounded-1 p-1 mt-1",  'autocomplete':'new-password'}
	))
	password2 = forms.CharField(label="Password again", max_length=20, help_text='password2', widget=forms.PasswordInput(
		attrs={'id': 'password2', 'class': "mb-2 rounded-1 p-1 mt-1",  'autocomplete':'new-password'}
	))