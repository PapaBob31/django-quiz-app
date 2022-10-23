from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.base_user import BaseUserManager
from django.utils.translation import gettext_lazy as _
from pages.models import Quiz

class CustomUserManager(BaseUserManager):
	def create_user(self, email, password, username='', **extra_fields):
		if not email:
			raise ValueError('Email is required')
		email = self.normalize_email(email)
		user = self.model(email=email, username=username, **extra_fields)
		user.set_password(password)
		user.save()
		return user

	def create_superuser(self, email, password, **extra_fields):
		extra_fields.setdefault('is_staff', True)
		extra_fields.setdefault('is_superuser', True)
		extra_fields.setdefault('is_active', True)

		if extra_fields.get('is_staff') is not True:
			raise ValueError('super user must be a staff')

		if extra_fields.get('is_superuser') is not True:
			raise ValueError('super user must be a superuser obviously')

		return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
	email = models.EmailField(_('Email Address'), unique=True)
	username = models.CharField(_('Username'), unique=True, max_length=30, blank=True)
	is_staff = models.BooleanField(default=False)
	is_active = models.BooleanField(default=True)
	has_activated_account = models.BooleanField(default=False)
	following = models.ManyToManyField('accounts.CustomUser', related_name="followers")
	bookmarks = models.ManyToManyField(Quiz, related_name="bookmarked_by")
	drafts = models.ManyToManyField(Quiz, related_name="saved_as_draft_by")
	USERNAME_FIELD = 'email'
	objects = CustomUserManager()

	def __str__(self):
		return self.email