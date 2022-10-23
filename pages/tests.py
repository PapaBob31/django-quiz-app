from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from .models import Quiz, Question, Option
import json

class QuizTests(TestCase):
	def setUp(self):
		self.activated_user = get_user_model().objects.create_user(
			username="john35",
			email="john35@gmail.com",
			password="johnisgood"
		)
		self.unactivated_user = get_user_model().objects.create_user(
			username="unactivated_user",
			email="baduser@gmail.com",
			password="baduser"
		)
		self.activated_user.has_activated_account = True
		self.activated_user.save()
		self.client.login(username="john35@gmail.com", password="johnisgood")
		self.posted_quiz = Quiz.objects.create(quiz_title="test quiz", slug_id="qwerVty3Ym", is_a_draft=False, author=self.activated_user, description="This is a test quiz")
		self.posted_quiz.save()
		self.posted_quiz_question = Question.objects.create(quiz=self.posted_quiz, content="what is the name of this framework?")
		self.posted_quiz_question.save()
		self.posted_quiz_option1 = Option.objects.create(content="django", question=self.posted_quiz_question)
		self.posted_quiz_option2 = Option.objects.create(content="ruby on rails", question=self.posted_quiz_question)
		self.posted_quiz_option1.save()
		self.posted_quiz_option2.save()
		self.posted_quiz_question.correct_option = self.posted_quiz_option1
		self.posted_quiz_question.save()

		self.draft_quiz = Quiz.objects.create(quiz_title="draft quiz", slug_id="qwerVty4Ym", is_a_draft=True, author=self.activated_user, description="This is another test quiz")
		self.draft_quiz.save()
		self.draft_quiz_question = Question.objects.create(quiz=self.draft_quiz, content="is this just a draft quiz?")
		self.draft_quiz_question.save()
		self.draft_quiz_option1 = Option.objects.create(content="yes", question=self.draft_quiz_question)
		self.draft_quiz_option2 = Option.objects.create(content="no", question=self.draft_quiz_question)
		self.draft_quiz_option1.save()
		self.draft_quiz_option2.save()
		self.draft_quiz_question.correct_option = self.draft_quiz_option1
		self.draft_quiz_question.save()

	def test_string_representation(self):
		self.assertEqual(str(self.posted_quiz), self.posted_quiz.quiz_title)
		self.assertEqual(str(self.draft_quiz), self.draft_quiz.quiz_title)

	def test_get_absolute_url(self):
		self.assertEqual(self.posted_quiz.get_absolute_url(), "/quizzes/qwerVty3Ym/")
		self.assertEqual(self.draft_quiz.get_absolute_url(), "/quizzes/qwerVty4Ym/")

	def test_posted_quiz_content(self):
		self.assertEqual(self.posted_quiz.quiz_title, "test quiz")
		self.assertEqual(self.posted_quiz.description, "This is a test quiz")
		self.assertEqual(self.posted_quiz_question.content, "what is the name of this framework?")
		self.assertIn(self.posted_quiz_option1, self.posted_quiz_question.options.all())
		self.assertIn(self.posted_quiz_option2, self.posted_quiz_question.options.all())
		self.assertEqual(self.posted_quiz_option1.content, "django")
		self.assertEqual(self.posted_quiz_option2.content, "ruby on rails")
		self.assertEqual(self.posted_quiz_question.correct_option, self.posted_quiz_option1)
		self.assertEqual(self.posted_quiz_question.correct_option.content, "django")

	def test_draft_content(self):
		self.assertEqual(self.draft_quiz.quiz_title, "draft quiz")
		self.assertEqual(self.draft_quiz.description, "This is another test quiz")
		self.assertEqual(self.draft_quiz_question.content, "is this just a draft quiz?")
		self.assertIn(self.draft_quiz_option1, self.draft_quiz_question.options.all())
		self.assertIn(self.draft_quiz_option2, self.draft_quiz_question.options.all())
		self.assertEqual(self.draft_quiz_option1.content, "yes")
		self.assertEqual(self.draft_quiz_option2.content, "no")
		self.assertEqual(self.draft_quiz_question.correct_option, self.draft_quiz_option1)
		self.assertEqual(self.draft_quiz_question.correct_option.content, "yes")

	def test_homepage(self):
		response = self.client.get(reverse("home"))
		self.assertEqual(response.status_code, 200)
		self.assertContains(response, "test quiz")
		self.assertContains(response, "This is a test quiz")
		self.assertNotContains(response, "draft quiz")
		self.assertNotContains(response, "This is another test quiz")
		self.assertTemplateUsed(response, "home.html")

	def with_bad_data(self):
		questions_data = [
			{"question": "Is this a test?", "options": ["yes", "no", "I don't think so"], "correct_option": ""},
			{"question": "Which of these is not a fruit?", "options": [], "correct_option": "cow"}
		]	
		response = self.client.post(reverse("create_quiz"), {
			"title": "Test",
			"description": "This is a test",
			"questions_data": json.dumps(questions_data)
		})
		self.assertEqual(response.status_code, 400)
		self.assertNotEqual(Quiz.objects.last().quiz_title, 'Test')

	def with_good_data(self):
		questions_data = [
			{"question": "Is this a test?", "options": ["yes", "no", "I don't think so"], "correct_option": "yes"},
			{"question": "Which of these is not a fruit?", "options": ["banana", "apple", "cow", "mango"], "correct_option": "cow"}
		]

		response = self.client.post(reverse("create_quiz"), {
			"title": "Test",
			"description": "This is a test",
			"questions_data": json.dumps(questions_data) 
		})
		self.assertEqual(response.status_code, 200)
		self.assertEqual(Quiz.objects.last().quiz_title, 'Test')
		self.assertEqual(Quiz.objects.last().description, 'This is a test')
		self.assertJSONEqual(response.content.decode('utf-8'), {"url": Quiz.objects.last().get_absolute_url()})

	def test_create_quiz(self):
		self.with_bad_data()
		self.with_good_data()

		self.client.logout()
		response1 = self.client.get(reverse("create_quiz"))
		self.assertRedirects(response1, "/login/")

		self.client.login(username="baduser@gmail.com", password="baduser")
		response2 = self.client.get(reverse("create_quiz"))
		self.assertRedirects(response2, "/unactivated-account/")
		
	def test_get_quiz(self):
		response = self.client.get(reverse("quiz", args=[self.posted_quiz.slug_id]))
		self.assertEqual(response.status_code, 200)
		self.assertTemplateUsed(response, 'play_quiz.html')
		self.assertContains(response, "test quiz")
		self.assertContains(response, "This is a test quiz")
		self.assertContains(response, "what is the name of this framework?")
		self.assertContains(response, "django")
		self.assertContains(response, "ruby on rails")

		response2 = self.client.get(reverse("quiz", args=[self.draft_quiz.slug_id]))
		self.assertEqual(response2.status_code, 404)
		response3 = self.client.get(reverse("quiz", args=['invalid_string']))
		self.assertEqual(response3.status_code, 404)
		response4 = self.client.post(reverse("quiz", args=[self.posted_quiz.slug_id]))
		self.assertEqual(response4.status_code, 404)

	def test_search_quiz(self):
		response = self.client.get('/search/?q=quiz')
		self.assertContains(response, "test quiz")
		self.assertNotContains(response, "draft quiz")
		self.assertEqual(response.status_code, 200)

	def assertEditedQuiz(self):
		updated_quiz = Quiz.objects.get(id=self.posted_quiz.id) # queried from the database to get the latest values
		self.assertEqual(updated_quiz.quiz_title, "Edit test")
		self.assertEqual(updated_quiz.description, "This is for testing the quiz editing functionality")
		edited_question = Question.objects.get(id=self.posted_quiz_question.id) # queried from the database to get the latest values
		self.assertNotIn(self.posted_quiz_option2, edited_question.options.all())
		self.assertEqual(edited_question.content, "Is this an edited question")
		edited_option = Option.objects.get(id=self.posted_quiz_question.id) # queried from the database to get the latest values
		self.assertEqual(edited_option.content, "No")
		self.assertTrue(edited_question.options.filter(content="Yes").exists())
		self.assertEqual(edited_question.correct_option.content, "Yes")
		self.assertEqual(edited_question.options.count(), 2)
		self.assertEqual(updated_quiz.questions.count(), 2)
		new_question = updated_quiz.questions.get(content="2+2")
		self.assertTrue(new_question)
		self.assertEqual(new_question.options.count(), 3)
		self.assertTrue(new_question.options.get(content="2"))
		self.assertTrue(new_question.options.get(content="s"))
		self.assertTrue(new_question.options.get(content="4"))
		self.assertEqual(new_question.correct_option.content, "4")

	def test_edit_quiz(self):
		edited_data = {
			"new_title": "Edit test",
			"new_description": "This is for testing the quiz editing functionality",
			"deleted_options": [str(self.posted_quiz_option2.id)],
			"edited_questions": [{"id": str(self.posted_quiz_question.id), "new_content": "Is this an edited question"}],
			"edited_options": [
				{"id": str(self.posted_quiz_option1.id), "value_changed":"true", "new_option": "",
				"new_content": "No", "question_id": str(self.posted_quiz_question.id), "new_answer": ""},
				{"id": "", "value_changed":"", "new_option":"true", "new_content": "Yes",
				"question_id": str(self.posted_quiz_question.id), "new_answer":"true"}
			],
			"new_questions": [{"question":"2+2","options":["4","s","2"],"correct_option":"4"}],
		}
		response = self.client.post(reverse("edit_quiz", args=[self.posted_quiz.slug_id]), json.dumps(edited_data), content_type="application/json")
		self.assertEqual(response.status_code, 200)
		self.assertEditedQuiz()

	def test_bookmark_quiz(self):
		self.client.logout()
		response1 = self.client.post(reverse("bookmark_quiz", args=[self.posted_quiz.slug_id]), {})
		self.assertEqual(response1.status_code, 401)
		response2 = self.client.get(reverse("bookmark_quiz", args=[self.posted_quiz.slug_id]))
		self.assertEqual(response2.status_code, 404)

		self.client.login(username="baduser@gmail.com", password="baduser")
		response1 = self.client.post(reverse("bookmark_quiz", args=[self.posted_quiz.slug_id]), {})
		self.assertEqual(response1.status_code, 403)
		response2 = self.client.get(reverse("bookmark_quiz", args=[self.posted_quiz.slug_id]))
		self.assertEqual(response2.status_code, 404)
	
		self.client.login(username="john35@gmail.com", password="johnisgood")
		response1 = self.client.post(reverse("bookmark_quiz", args=[self.posted_quiz.slug_id]), {})
		self.assertEqual(response1.status_code, 200)
		response2 = self.client.get(reverse("bookmark_quiz", args=[self.posted_quiz.slug_id]))
		self.assertEqual(response2.status_code, 404)
		response3 = self.client.post(reverse("bookmark_quiz", args=['random_string']), {})
		self.assertEqual(response3.status_code, 404)

	def when_user_already_liked_quiz(self, url):
		self.posted_quiz.likes.add(self.activated_user)
		response = self.client.post(reverse(url, args=[self.posted_quiz.slug_id]),{})
		return response

	def when_user_already_disliked_quiz(self, url):
		self.posted_quiz.dislikes.add(self.activated_user)
		response = self.client.post(reverse(url, args=[self.posted_quiz.slug_id]),{})
		return response	

	def when_user_has_neither_liked_nor_disliked_quiz(self, url):
		response = self.client.post(reverse(url, args=[self.posted_quiz.slug_id]),{})
		return response

	def cleanup_likes_and_dislikes_db(self):
		self.posted_quiz.likes.remove(self.activated_user)
		self.posted_quiz.dislikes.remove(self.activated_user)

	def test_like_quiz_with_activated_user(self):
		response_one = self.when_user_already_liked_quiz("like_quiz")
		self.assertEqual(response_one.status_code, 200)
		self.assertNotIn(self.activated_user, self.posted_quiz.likes.all())
		self.assertNotIn(self.activated_user, self.posted_quiz.dislikes.all())
		self.assertJSONEqual(response_one.content.decode("utf-8"), {"removedLike": "true"})
		self.cleanup_likes_and_dislikes_db()

		response_two = self.when_user_already_disliked_quiz("like_quiz")
		self.assertEqual(response_two.status_code, 200)
		self.assertIn(self.activated_user, self.posted_quiz.likes.all())
		self.assertNotIn(self.activated_user, self.posted_quiz.dislikes.all())
		self.assertJSONEqual(response_two.content.decode("utf-8"), {"addedLike": "true", "removedDislike": "true"})
		self.cleanup_likes_and_dislikes_db()

		response_three = self.when_user_has_neither_liked_nor_disliked_quiz("like_quiz")
		self.assertEqual(response_three.status_code, 200)
		self.assertIn(self.activated_user, self.posted_quiz.likes.all())
		self.assertNotIn(self.activated_user, self.posted_quiz.dislikes.all())
		self.assertJSONEqual(response_three.content.decode("utf-8"), {"addedLike": "true"})

		response_four = self.client.get(reverse("like_quiz", args=[self.posted_quiz.slug_id]))
		self.assertEqual(response_four.status_code, 404)

	def test_dislike_quiz_with_activated_user(self):
		response_one = self.when_user_already_liked_quiz("dislike_quiz")
		self.assertEqual(response_one.status_code, 200)
		self.assertIn(self.activated_user, self.posted_quiz.dislikes.all())
		self.assertNotIn(self.activated_user, self.posted_quiz.likes.all())
		self.assertJSONEqual(response_one.content.decode("utf-8"), {"addedDislike": "true", "removedLike": "true"})
		self.cleanup_likes_and_dislikes_db()

		response_two = self.when_user_already_disliked_quiz("dislike_quiz")
		self.assertEqual(response_two.status_code, 200)
		self.assertNotIn(self.activated_user, self.posted_quiz.likes.all())
		self.assertNotIn(self.activated_user, self.posted_quiz.dislikes.all())
		self.assertJSONEqual(response_two.content.decode("utf-8"), {"removedDislike": "true"})
		self.cleanup_likes_and_dislikes_db()

		response_three = self.when_user_has_neither_liked_nor_disliked_quiz("dislike_quiz")
		self.assertEqual(response_three.status_code, 200)
		self.assertIn(self.activated_user, self.posted_quiz.dislikes.all())
		self.assertNotIn(self.activated_user, self.posted_quiz.likes.all())
		self.assertJSONEqual(response_three.content.decode("utf-8"), {"addedDislike": "true"})

		response_four = self.client.get(reverse("like_quiz", args=[self.posted_quiz.slug_id]))
		self.assertEqual(response_four.status_code, 404)

	def test_like_quiz_with_unactivated_user(self):
		self.client.login(username="baduser@gmail.com",password="baduser")
		response = self.client.post(reverse("like_quiz", args=[self.posted_quiz.slug_id]),{})
		self.assertEqual(response.status_code, 403)
		response_two = self.client.get(reverse("like_quiz", args=[self.posted_quiz.slug_id]))
		self.assertEqual(response_two.status_code, 404)

	def test_dislike_quiz_with_unactivated_user(self):
		self.client.login(username="baduser@gmail.com",password="baduser")
		response = self.client.post(reverse("dislike_quiz", args=[self.posted_quiz.slug_id]),{})
		self.assertEqual(response.status_code, 403)
		response_two = self.client.get(reverse("dislike_quiz", args=[self.posted_quiz.slug_id]))
		self.assertEqual(response_two.status_code, 404)

	def test_like_quiz_with_unauthenticated_user(self):
		self.client.logout()
		response = self.client.post(reverse("like_quiz", args=[self.posted_quiz.slug_id]),{})
		self.assertEqual(response.status_code, 401)
		response_two = self.client.get(reverse("like_quiz", args=[self.posted_quiz.slug_id]))
		self.assertEqual(response_two.status_code, 404)

	def test_dislike_quiz_with_unauthenticated_user(self):
		self.client.logout()
		response = self.client.post(reverse("dislike_quiz", args=[self.posted_quiz.slug_id]),{})
		self.assertEqual(response.status_code, 401)		
		response_two = self.client.get(reverse("dislike_quiz", args=[self.posted_quiz.slug_id]))
		self.assertEqual(response_two.status_code, 404)

	def test_delete_quiz(self):
		self.client.logout()
		response1 = self.client.post(reverse("delete_quiz", args=[self.posted_quiz.slug_id]), {})
		self.assertEqual(response1.status_code, 401)
		response2 = self.client.get(reverse("delete_quiz", args=[self.posted_quiz.slug_id]))
		self.assertEqual(response2.status_code, 404)

		self.client.login(username="baduser@gmail.com", password="baduser")
		response1 = self.client.post(reverse("delete_quiz", args=[self.posted_quiz.slug_id]), {})
		self.assertEqual(response1.status_code, 403)
		response2 = self.client.get(reverse("delete_quiz", args=[self.posted_quiz.slug_id]))
		self.assertEqual(response2.status_code, 404)
	
		self.client.login(username="john35@gmail.com", password="johnisgood")
		response1 = self.client.post(reverse("delete_quiz", args=[self.posted_quiz.slug_id]), {})
		self.assertEqual(response1.status_code, 200)
		response2 = self.client.get(reverse("delete_quiz", args=[self.posted_quiz.slug_id]))
		self.assertEqual(response2.status_code, 404)
		response3 = self.client.post(reverse("delete_quiz", args=['random_string']), {})
		self.assertEqual(response3.status_code, 404)
