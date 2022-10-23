if (window.history.replaceState) {
	// prevent page from resubmitting form on page reload
	window.history.replaceState(null, null, window.location.href);
}

var form = document.getElementById("signup-form")
var submitBtn = document.getElementById('submit-btn')
var username = document.getElementById("username")
var email = document.getElementById("email")
var email_error = document.getElementById("email-error").querySelector("span")
var password_one = document.getElementById("password1")
var password_two = document.getElementById("password2")
var username_error = document.getElementById("username-error").querySelector("span")
var password_one_error = document.getElementById("password1-error").querySelector("span")
var password_two_error = document.getElementById("password2-error").querySelector("span")
var closeAlertBtns = document.querySelectorAll(".btn-close")
submitBtn.addEventListener('click', verify_details);

(function(){
	for (var i = closeAlertBtns.length - 1; i >= 0; i--) {
		closeAlertBtns[i].addEventListener('click', removeAlert)
	}
})();

function removeAlert(event) {
	event.preventDefault()
	var parentElement = event.target.parentNode
	parentElement.classList.add("d-none")
}

function verify_details(event) {
	event.preventDefault()
	remove_error_values()
	if (username_is_valid() && password_is_valid()) {
		if (/^\S+@\S+\.\S+$/.test(email.value)){
			// if email value is in the format emailname@mailservice.com
			form.submit()
		}else {
			email_error.textContent = "Invalid email."
			email_error.parentNode.classList.remove("d-none")
			email.focus()
		}
	}
}

function remove_error_values() {
	email_error.parentNode.classList.add("d-none")
	password_one_error.parentNode.classList.add("d-none")
	password_two_error.parentNode.classList.add("d-none")
	username_error.parentNode.classList.add("d-none")
}

function username_is_valid() {
	var error = ""
	if (username.value.length < 5) {
		error = "Username must be at least 5 characters long, contain at least one letter\
						and must not contain special characters like `#$<>/!+-;:@' e.t.c."
	}
	if (!/[a-zA-Z]/g.test(username.value)) {
		// if username.value doesn't contain any letter of the english aplphabet.
		error = "Username must be at least 5 characters long, contain at least one letter\
						and must not contain special characters like `#$<>/!+-;:@' e.t.c."
	}
	if (/[^\w]/.test(username.value)) {
		// if username.value contains any special character like `#$<>/!+-;:@'.
		error = "Username must be at least 5 characters long, contain at least one letter\
						and must not contain special characters like `#$<>/!+-;:@' e.t.c."
	}
	if (error) {
		username_error.textContent = error;
		username_error.parentNode.classList.remove("d-none")
		username.focus()
		return false
	}else {
		return true
	}
}

function password_is_valid() {
	if (password_one.value.length < 8) {
		password_one_error.textContent = "Password must be at least 8 characters long"
		password_one_error.closest("div").classList.remove("d-none")
		password_one.focus()
		return false;
	}

	if (password_one.value !== password_two.value) {
		password_one_error.textContent = "The two passwords must match"
		password_two_error.textContent = "The two passwords must match"
		password_one_error.parentNode.classList.remove("d-none")
		password_two_error.parentNode.classList.remove("d-none")
		password_one.focus()
		password_two.focus()
		return false
	}
	return true
}