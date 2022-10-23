from .views import (
	HomePage, create_quiz, get_quiz, bookmark_quiz, edit_quiz, remove_bookmark,
	dislike_quiz, page_not_found, like_quiz, delete_quiz, search_quiz
)
from django.urls import path

urlpatterns = [
	path('', HomePage.as_view(), name='home'),
	path('create/', create_quiz, name='create_quiz'),
	path('quizzes/<str:slug>/', get_quiz, name='quiz'),
	path('quizzes/<str:slug>/delete/', delete_quiz, name='delete_quiz'),
	path('quizzes/<str:slug>/bookmark', bookmark_quiz, name="bookmark_quiz"),
	path('bookmarks/<str:quiz_id>/remove/', remove_bookmark, name="remove_bookmark"),
	path('quizzes/<str:slug>/edit', edit_quiz, name="edit_quiz"),
	path('quizzes/<quiz_id>/like', like_quiz, name="like_quiz"),
	path('quizzes/<quiz_id>/dislike', dislike_quiz, name="dislike_quiz"),
	path('search/', search_quiz, name="search"),
]

handler404 = page_not_found