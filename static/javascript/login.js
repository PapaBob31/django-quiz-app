if (window.history.replaceState) {
	// prevent page from resubmitting form on page reload
	window.history.replaceState(null, null, window.location.href);
}

const emailInput = document.getElementById("email_id")
const passwordInput = document.getElementById("password_id")
emailInput.addEventListener("focus", function(){emailInput.classList.remove("input-error")})
passwordInput.addEventListener("focus", function(){passwordInput.classList.remove("input-error")})