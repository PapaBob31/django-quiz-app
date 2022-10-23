from django.contrib.auth import get_user_model
from django.test import TestCase
from .models import CustomUser
from django.urls import reverse

class AccountsTest(TestCase):
	def setUp(self):
		self.user = get_user_model().objects.create_user(
			username="john35",
			email="john35@gmail.com",
			password="johnisgood",
			has_activated_account=True
		)

		self.bad_user = get_user_model().objects.create_user(
			username="bad boi",
			email="test@gmail.com",
			password="Iamabaduser",
			has_activated_account=True
		)

	def test_string_representation(self):
		self.assertEqual(str(self.user), "john35@gmail.com")

	def test_login_view(self):
		response = self.client.post(reverse("login"), {"email": "john35@gmail.com", "password": "johnisgood"})
		self.assertRedirects(response, "/")

		response = self.client.post(reverse("login"), {"email": "john35@gmail.com", "password": "johnisbad"})
		self.assertContains(response, "invalid email or password")

		response = self.client.get(reverse("login"))
		self.assertEqual(response.status_code, 200)
		self.assertTemplateUsed(response, "registration/login.html")

	def test_logout_view(self):
		response = self.client.get(reverse("logout"))
		self.assertRedirects(response, "/login/")

	def test_get_user_bookmarks(self):
		self.client.login(username="john35@gmail.com", password="johnisgood")
		response = self.client.get(reverse("user_bookmarks", args=[self.user.username]))
		self.assertEqual(response.status_code, 200)
		self.assertTemplateUsed(response, "bookmarks.html")

		response = self.client.post(reverse("user_bookmarks", args=[self.user.username]), {})
		self.assertEqual(response.status_code, 404)

		self.user.has_activated_account = False
		self.user.save()
		response = self.client.get(reverse("user_bookmarks", args=[self.user.username]))
		self.assertRedirects(response, "/unactivated-account/")

		self.client.logout()
		response = self.client.get(reverse("user_bookmarks", args=[self.user.username]))
		self.assertRedirects(response, "/login/")

		self.client.login(username="test@gmail.com", password="Iamabaduser")
		response = self.client.get(reverse("user_bookmarks", args=[self.user.username]))
		self.assertEqual(response.status_code, 404)


	def test_get_user_profile(self):
		self.client.login(username="john35@gmail.com", password="johnisgood")
		response = self.client.get(reverse("userprofile", args=[self.user.username]))
		self.assertEqual(response.status_code, 200)
		self.assertContains(response, 'john35@gmail.com')
		self.assertTemplateUsed(response, "profile.html")

		response = self.client.post(reverse("userprofile", args=[self.user.username]), {})
		self.assertEqual(response.status_code, 404)

		self.client.logout()
		response = self.client.get(reverse("userprofile", args=[self.user.username]))
		self.assertEqual(response.status_code, 200)
		self.assertNotContains(response, 'john35@gmail.com')
		self.assertTemplateUsed(response, "profile.html")

		response = self.client.post(reverse("userprofile", args=[self.user.username]), {})
		self.assertEqual(response.status_code, 404)

		self.client.login(username="test@gmail.com", password="Iamabaduser")
		response = self.client.get(reverse("userprofile", args=[self.user.username]))
		self.assertEqual(response.status_code, 200)
		self.assertNotContains(response, 'john35@gmail.com')
		self.assertTemplateUsed(response, "profile.html")

		response = self.client.post(reverse("userprofile", args=[self.user.username]), {})
		self.assertEqual(response.status_code, 404)

