from django.db import models
from django.urls import reverse


class Quiz(models.Model):
	author = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, related_name='quizzes')
	quiz_title = models.CharField(max_length=250)
	description = models.CharField(max_length=250, blank=True, default="")
	slug_id = models.CharField(max_length=10)
	is_a_draft = models.BooleanField(default=False)
	no_of_times_played = models.IntegerField(default=0)
	likes = models.ManyToManyField('accounts.CustomUser', blank=True, related_name="liked_posts")
	dislikes = models.ManyToManyField('accounts.CustomUser', blank=True, related_name="disliked_posts")

	def __str__(self):
		return self.quiz_title

	def get_absolute_url(self):
		return reverse("quiz", args=[self.slug_id])


class Question(models.Model):
	quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
	content = models.CharField(max_length=250)
	correct_option = models.OneToOneField("Option", on_delete=models.SET_NULL, related_name='current_question', null=True)

	def __str__(self):
		if len(self.content) > 80:
			return self.content[:80] + '...'
		return self.content[:80]

	
class Option(models.Model):
	content = models.CharField(max_length=250)
	question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options', null=True)

	def __str__(self):
		if len(self.content) > 60:
			return self.content[:60] + '...'
		return self.content[:60]

