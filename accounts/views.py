from django.shortcuts import render
from django.contrib.auth import login, authenticate, logout
from django.http import JsonResponse, HttpResponseRedirect, Http404, HttpResponse
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from django.utils.encoding import force_str, force_bytes
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.contrib.sites.shortcuts import get_current_site
from .forms import SignUpForm
from .models import CustomUser

def page_not_found(request, exception):
	return render(request, "404.html", {})

def login_view(request):
	if request.method == "POST":
		email = request.POST.get('email')
		password = request.POST.get('password')
		user = authenticate(request, username=email, password=password)
		if user is not None:
			login(request, user)
			return HttpResponseRedirect(reverse("home"))
		else:
			return render(request, "registration/login.html",
				{"error_msg": "invalid email or password", "error_email": email, "error_password": password}
			)
	else:
		return render(request, "registration/login.html", {})

def logout_view(request):
	logout(request)
	return HttpResponseRedirect(reverse("login"))

def unactivated_account_view(request):
	return render(request, 'unactivated.html', {})

def activate_account(request, uidb64, token):
	try:
		uid = force_str(urlsafe_base64_decode(uidb64))
		user = CustomUser.objects.get(pk=uid)
	except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
		user = None

	if user is not None and token_generator.check_token(user, token):
		user.has_activated_account = True
		user.save()
		return HttpResponseRedirect(reverse('login'))
	else:
		return HttpResponse("Activation link is invalid")

class AcctActivationTokenGenerator(PasswordResetTokenGenerator):
	def _make_hash_value(self, user, timestamp):
		return (str(user.is_active) + str(user.pk) + str(timestamp))

token_generator = AcctActivationTokenGenerator()

def send_activation_email(request, user, user_email):
	message = render_to_string('acct_activation.html', {
		'user': user,
		'domain': get_current_site(request),
		'uid': urlsafe_base64_encode(force_bytes(user.pk)),
		'token':  token_generator.make_token(user),
	})
	mail_subject = "Pls Activate your account"
	email = EmailMessage(mail_subject, message, to=[user_email])
	email.send()

def signup_view(request):
	if request.method == "POST":
		form = SignUpForm(request.POST)
		if form.is_valid():
			new_email = form.cleaned_data.get("email")
			new_username = form.cleaned_data.get("username")
			password1 = form.cleaned_data.get("password1")
			password2 = form.cleaned_data.get("password2")
			if password1 == password2:
				CustomUser.objects.create_user(email=new_email, password=password1, username=new_username)
				new_user = authenticate(request, username=new_email, password=password1)
				login(request, new_user)
				#send_activation_email(request, new_user, new_email)
				return render(request, 'unactivated.html', {"just_created_account": "True"})
			else:
				return render(request, "registration/signup.html", {
					'form': form,
					'password_error': 'The two passwords must match'
				})
		else:
			error_form = copy.copy(form)
			for field in error_form.errors:
				error_form[field].field.widget.attrs['class'] = ' input-error'
			return render(request, "registration/signup.html", {'form': error_form})
	else:
		form = SignUpForm()
		return render(request, "registration/signup.html", {'form': form})

def get_user_bookmarks(request, username):
	if not request.user.is_authenticated:
		return HttpResponseRedirect(reverse("login"))
	if not request.user.has_activated_account:
		return HttpResponseRedirect(reverse('unactivated_account'))
	if request.method == "GET":
		if request.user.username == username:
			return render(request, "bookmarks.html", {})
		else:
			raise Http404()
	raise Http404()

def edit_and_save_profile(request, username):
	if not request.user.is_authenticated:
		return HttpResponseRedirect(reverse("login"))
	if not request.user.has_activated_account:
		return HttpResponseRedirect(reverse("unactivated_account"))
	if CustomUser.objects.filter(username=username).exists():
		requested_user = CustomUser.objects.get(username=username)
	else:
		raise Http404()
	if request.user == requested_user:
		if request.method == "GET":
			return render(request, "edit_profile.html", {})
	else:
		raise Http404()
	if request.method == "POST":
		if save_profile(request, requested_user):
			return JsonResponse({})

def save_profile(request, user):
	if request.POST.get("username"):
		user.username = request.POST.get("username")
	if request.POST.get("email"):
		user.email = request.POST.get("email")
	user.save()
	return True

def get_userprofile(request, username):
	if request.method == 'GET':
		try:
			profile_owner = CustomUser.objects.get(username=username)
			if profile_owner == request.user:
				return render(request, 'profile.html', {"profile_owner": profile_owner, "user_owns_profile": True})
			else:
				return render(request, 'profile.html', {"profile_owner": profile_owner, "user_owns_profile": False})
		except CustomUser.DoesNotExist:
			raise Http404()
	else:
		raise Http404()