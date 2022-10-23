from django.urls import path
from .views import (
	login_view, logout_view, signup_view, unactivated_account_view, get_user_bookmarks,
	activate_account, get_userprofile, edit_and_save_profile, page_not_found
)

urlpatterns = [
	path('signup/', signup_view, name='signup'),
	path('login/', login_view, name='login'),
	path('logout/', logout_view, name='logout'),
	path('profiles/<str:username>/', get_userprofile, name='userprofile'),
	path('profiles/<str:username>/edit', edit_and_save_profile, name="edit_profile"),
	path('unactivated-account/', unactivated_account_view, name="unactivated_account"),
	path('activate/<uidb64>/<token>/', activate_account, name="activate"),
	path('profiles/<str:username>/bookmarks', get_user_bookmarks, name="user_bookmarks"),
]

handler404 = page_not_found