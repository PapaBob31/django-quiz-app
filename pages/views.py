from django.shortcuts import render
from django.urls import reverse
from django.views.generic import ListView
from .models import Quiz, Question, Option
from django.http import JsonResponse, HttpResponseRedirect, Http404, HttpResponse
from accounts.models import CustomUser
import random, string, json

class HomePage(ListView):
	model = Quiz
	template_name = 'home.html'
	fields = ['author', 'quiz_title']
	context_object_name = 'quiz_list'

def page_not_found(request, exception):
	return render(request, "404.html", {})

def create_quiz_object(request):
	title = request.POST.get('title')
	short_description = request.POST.get('description')
	quiz = None
	if not title or not short_description:
		return False
	slug = ''
	for no in range(10):
		slug += random.choice(string.ascii_letters) # random string to be used as quiz id
	is_draft = request.POST.get('is_draft')	
	if is_draft:
		quiz = Quiz(author=request.user, quiz_title=title, description=short_description, slug_id=slug, is_a_draft=True)
		quiz.save()
		request.user.drafts.add(quiz)
	else:
		quiz = Quiz(author=request.user, quiz_title=title, description=short_description, slug_id=slug)
		quiz.save()
	return quiz

def create_quiz_questions(questions_data, quiz_obj):
	question_object, option_object = None, None
	for data in questions_data:
		question_text = data.get('question')
		if not question_text:
			return False
		question_object = Question(quiz=quiz_obj, content=question_text)
		question_object.save()
		for option in data.get("options"):
			if not option:
				return False
			option_object = Option(content=option, question=question_object)
			option_object.save()
			if option == data.get("correct_option"):
				question_object.correct_option = option_object
				question_object.save()
		if not question_object.correct_option:
			return False
	return True

def delete_questions_from_db(deleted_questions_id):
	for question_id in deleted_questions_id:
		question = Question.objects.get(id=question_id)
		question.delete()

def delete_options_from_db(deleted_options_id):
	for option_id in deleted_options_id:
		option = Option.objects.get(id=option_id)
		option.delete()

def update_options_in_db(edited_options):
	for option_attrs in edited_options:
		target_question = Question.objects.get(id=option_attrs["question_id"])
		if option_attrs["id"]:
			target_option = target_question.options.get(id=option_attrs["id"])	
			if option_attrs["value_changed"]:
				edited_option = target_option
				edited_option.content = option_attrs["new_content"]
				edited_option.save()
			if option_attrs["new_answer"]:
				target_question.correct_option = target_option
				target_question.save()
		else:
			if option_attrs["new_option"]:
				new_option = Option.objects.create(content=option_attrs["new_content"], question=target_question)
				new_option.save()
			if option_attrs["new_answer"]:
				target_question.correct_option = new_option
				target_question.save()

def save_edited_questions(edited_questions):
	for question_attr in edited_questions:
		edited_question = Question.objects.get(id=question_attr["id"])
		edited_question.content = question_attr["new_content"]
		edited_question.save()

def check_and_update_edited_fields(quiz, edited_data):
	new_title =  edited_data.get("new_title")
	new_description =  edited_data.get("new_description")
	if new_title:
		quiz.quiz_title = new_title
	if new_description:
		quiz.description = new_description
	if new_title or new_description:
		quiz.save()
	deleted_questions_id = edited_data.get("deleted_questions")
	if deleted_questions_id:
		delete_questions_rom_db(deleted_questions_id)
	deleted_options_id =  edited_data.get("deleted_options")
	if deleted_options_id:
		delete_options_from_db(deleted_options_id)
	new_questions = edited_data.get("new_questions")
	if new_questions:
		create_quiz_questions(new_questions, quiz)
	edited_options = edited_data.get("edited_options")
	if edited_options:
		update_options_in_db(edited_options)			
	edited_questions = edited_data.get("edited_questions")
	if edited_questions:
		save_edited_questions(edited_questions)

def edit_quiz(request, slug):
	try:
		quiz = Quiz.objects.get(slug_id=slug)
	except Quiz.DoesNotExist:
		raise Http404()
	else:
		if request.user != quiz.author:
			raise Http404()
	if request.method == "GET":
		if not request.user.is_authenticated:
			return HttpResponseRedirect(reverse("login"))
		if not request.user.has_activated_account:
			return HttpResponseRedirect(reverse('unactivated_account'))
		return render(request, "edit_quiz.html", {'quiz': quiz})
	elif request.method == "POST":
		if not request.user.is_authenticated:
			return HttpResponse('', status=401)
		if not request.user.has_activated_account:
			return HttpResponse('', status=403)
		data = json.loads(request.body)
		check_and_update_edited_fields(quiz, data)
		return JsonResponse({"url": quiz.get_absolute_url()})

def create_quiz(request):
	if request.method == 'POST':
		if not request.user.is_authenticated:
			return HttpResponse('', status=401)
		if not request.user.has_activated_account:
			return HttpResponse('', status=403)

		quiz_object = create_quiz_object(request)
		questions_data = request.POST.get('questions_data')
		questions_data = json.loads(questions_data)
		if not quiz_object or not questions_data:
			return HttpResponse('', status=400)
		if create_quiz_questions(questions_data, quiz_object):
			return JsonResponse({"url": quiz_object.get_absolute_url()})
		else:
			quiz_object.delete()
			return HttpResponse('', status=400)

	elif request.method == 'GET':
		if not request.user.is_authenticated:
			return HttpResponseRedirect(reverse("login"))
		if not request.user.has_activated_account:
			return HttpResponseRedirect(reverse('unactivated_account'))
		return render(request, 'create_quiz.html', {})

def get_quiz(request, slug):
	"""Returns the requested quiz that's about to be played"""
	if request.method == 'GET':
		try:
			quiz = Quiz.objects.get(slug_id=slug)
		except Quiz.DoesNotExist:
			raise Http404()
		else:
			if quiz.is_a_draft:
				raise Http404()
			else:
				return render(request, 'play_quiz.html', {'quiz': quiz})
	raise Http404()

def delete_quiz(request, slug):
	if request.method == "POST":
		if not request.user.is_authenticated:
			return HttpResponse('', status=401)
		if not request.user.has_activated_account:
			return HttpResponse('', status=403)
		try:
			quiz_to_be_deleted = Quiz.objects.get(slug_id=slug)
		except Quiz.DoesNotExist:
			return HttpResponse('', status=404)
		else:
			if request.user == quiz_to_be_deleted.author:
				quiz_to_be_deleted.delete()
				return HttpResponse('', status=200)
			else:
				return HttpResponse('', status=403)
	raise Http404()

def search_quiz(request):
	search_string = request.GET.get('q')
	result = Quiz.objects.filter(quiz_title__icontains=search_string)
	if result:
		return render(request, 'search.html', {'search_results': result})
	else:
		return render(request, 'search.html', {})

def bookmark_quiz(request, slug):
	if request.method == "POST":
		if not request.user.is_authenticated:
			return HttpResponse('', status=401)
		if not request.user.has_activated_account:
			return HttpResponse('', status=403)
		try:
			bookmarked_quiz = Quiz.objects.get(slug_id=slug)
		except Quiz.DoesNotExist:
			raise Http404()
		else:
			if bookmarked_quiz in request.user.bookmarks.all():
				request.user.bookmarks.remove(bookmarked_quiz)
				request.user.save()
				return JsonResponse({"removedBookmark": "true"})
			else:
				request.user.bookmarks.add(bookmarked_quiz)
				request.user.save()
				return JsonResponse({"addedBookmark": "true"})
	raise Http404()

def remove_bookmark(request, quiz_id):
	if request.method == "POST":
		if not request.user.is_authenticated:
			return HttpResponse('', status=401)
		if not request.user.has_activated_account:
			return HttpResponse('', status=403)
		try:
			target_quiz = Quiz.objects.get(slug_id=quiz_id)
		except Quiz.DoesNotExist:
			return HttpResponse('', status=404)
		else:
			if target_quiz in request.user.bookmarks.all():
				request.user.bookmarks.remove(target_quiz)
				return HttpResponse('', status=200)
			else:
				return HttpResponse('', status=400)
	return HttpResponse('', status=404)

def like_quiz(request, quiz_id):
	if request.method == "POST":
		if not request.user.is_authenticated:
			return HttpResponse('', status=401)
		if not request.user.has_activated_account:
			return HttpResponse('', status=403)
		if Quiz.objects.filter(slug_id=quiz_id).exists():
			quiz = Quiz.objects.get(slug_id=quiz_id)
			if quiz.is_a_draft: # There isn't a like button to click for drafts on the page. But just in case.
				return JsonResponse({'msg': 'Invalid request'}, status=400)
			if quiz.likes.filter(email=request.user.email).exists():
				quiz.likes.remove(request.user)
				return JsonResponse({"removedLike": "true"})
			elif quiz.dislikes.filter(email=request.user.email).exists():
				quiz.dislikes.remove(request.user)
				quiz.likes.add(request.user)
				return JsonResponse({"addedLike": "true", "removedDislike": "true"})
			else:
				quiz.likes.add(request.user)
				return JsonResponse({"addedLike": "true"})
		return HttpResponse('', status=404)
	raise Http404()

def dislike_quiz(request, quiz_id):
	if request.method == "POST":
		if not request.user.is_authenticated:
			return HttpResponse('', status=401)
		if not request.user.has_activated_account:
			return HttpResponse('', status=403)
		if Quiz.objects.filter(slug_id=quiz_id).exists():
			quiz = Quiz.objects.get(slug_id=quiz_id)
			if quiz.is_a_draft: # There isn't a dislike button to click for drafts on the page. But just in case.
				return JsonResponse({'msg': 'Invalid request'}, status=400)
			if quiz.dislikes.filter(email=request.user.email).exists():
				quiz.dislikes.remove(request.user)
				return JsonResponse({"removedDislike": "true"})
			elif quiz.likes.filter(email=request.user.email).exists():
				quiz.likes.remove(request.user)
				quiz.dislikes.add(request.user)
				return JsonResponse({"addedDislike": "true", "removedLike": "true"})
			else:
				quiz.dislikes.add(request.user)
				return JsonResponse({"addedDislike": "true"})
		return HttpResponse('', status=404)
	raise Http404()
