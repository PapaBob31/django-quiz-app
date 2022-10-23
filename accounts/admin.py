from django.contrib import admin
from .models import CustomUser
from django.contrib.auth.admin import UserAdmin

from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm


class CustomUserCreationForm(UserCreationForm):
	class Meta:
		model = CustomUser
		fields = ('email', 'username', 'password')

class CustomUserChangeForm(UserChangeForm):
	class Meta:
		model = CustomUser
		fields = ('email', 'username', 'password', 'bookmarks', 'drafts')

class CustomUserAdmin(UserAdmin):
	model = CustomUser
	form = CustomUserChangeForm
	add_form = CustomUserChangeForm
	list_display = ['email', 'username', 'is_staff', 'is_active']
	list_filter = ['email', 'is_superuser', 'is_staff', 'is_active']

	fieldsets = (
		(None, {'fields': ('email', 'username',)},),
		('Permissions', {'fields': ('is_staff', 'is_active',)},),
	)

	add_fieldsets = (
		(None, {
			'classes': ('wide',),
			'fields': ('email', 'username', 'is_staff', 'is_active',)
		},),
	)

admin.site.register(CustomUser, CustomUserAdmin)
