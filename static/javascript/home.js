(function() {
		var bookmarkBtns = document.querySelectorAll(".bookmark-quiz-btn")
		var quizLikeBtns = document.querySelectorAll(".like-quiz-btn")
		var quizDislikeBtns = document.querySelectorAll(".dislike-quiz-btn")

		$.each(bookmarkBtns, function(index, btn){
			btn.addEventListener("click", bookmarkQuiz)
		})
		$.each(quizLikeBtns, function(index, btn){
			btn.addEventListener("click", likeOrDislikeQUiz)
		})
		$.each(quizDislikeBtns, function(index, btn){
			btn.addEventListener("click", likeOrDislikeQUiz)
		})
})();

// This function helps to pass parameters to a function refrence
function partial(func) {
	var args = Array.prototype.slice.call(arguments, 1);
	return function() {
		var allArguments = args.concat(Array.prototype.slice.call(arguments))
		return func.apply(this, allArguments)
	}
}

// Sends a request for liking or disliking a quiz
function likeOrDislikeQUiz(event) {
	event.preventDefault()
	if (errorElement.classList.contains("show")) {
		errorElement.classList.remove("show")
	}
	var element = event.target
	// url determines if the it is a like or dislike request when it reaches the server
	var url = element.getAttribute('data-href')
	token = document.getElementsByName("csrfmiddlewaretoken")[0].value
	
	var httpRequest = new XMLHttpRequest()
	httpRequest.open("POST", url)
	httpRequest.onreadystatechange = partial(updateBtn, httpRequest, element)
	httpRequest.setRequestHeader('X-CSRFToken', token)
	httpRequest.setRequestHeader('Content-Type', 'text/plain')
	httpRequest.setRequestHeader('Cache-Control', 'no-cache')
	httpRequest.send()
}

var errorElement = document.getElementById("post-error")
var closeBtn = errorElement.querySelector("button")
closeBtn.addEventListener("click", function(){
	errorElement.className = "alert alert-danger p-2 alert-dismissible fade"
})

function updateBtn(response, button) {
	if (response.readyState === XMLHttpRequest.DONE) {
		if (response.status === 200) {
			response = JSON.parse(response.responseText)
			var parentElement = button.parentNode
			var likeBtn = parentElement.querySelector(".like-quiz-btn")
			var dislikeBtn = parentElement.querySelector(".dislike-quiz-btn")
			var no_of_likes = parentElement.querySelector(".like-count")
			var no_of_dislikes = parentElement.querySelector(".dislike-count")

			if (response.addedLike) {
				likeBtn.classList.add("liked-quiz")
				no_of_likes.textContent = (parseInt(no_of_likes.textContent) + 1)
			}
			if (response.removedDislike) {
				dislikeBtn.classList.remove("disliked-quiz")
				no_of_dislikes.textContent = (parseInt(no_of_dislikes.textContent) - 1)
			}
			if (response.removedLike) {
				likeBtn.classList.remove("liked-quiz")
				no_of_likes.textContent = (parseInt(no_of_likes.textContent) - 1)
			}
			if (response.addedDislike) {
				dislikeBtn.classList.add("disliked-quiz")
				no_of_dislikes.textContent = (parseInt(no_of_dislikes.textContent) + 1)
			}
		}else {errorElement.classList.add("show")}
	}
}


// Sends a request to bookmark a quiz
function bookmarkQuiz(event) {
	event.preventDefault()
	if (errorElement.classList.contains("show")) {
		errorElement.classList.remove("show")
	}
	var bookmark_element = event.target
	var url = bookmark_element.getAttribute('data-href')
	token = document.getElementsByName("csrfmiddlewaretoken")[0].value

	var httpRequest = new XMLHttpRequest()
	httpRequest.open("POST", url)
	httpRequest.onreadystatechange = partial(updateDisplay, bookmark_element, httpRequest)
	httpRequest.setRequestHeader('X-CSRFToken', token)
	httpRequest.setRequestHeader('Content-Type', 'text/plain')
	httpRequest.setRequestHeader('Cache-Control', 'no-cache')
	httpRequest.send()
}

function updateDisplay(element, response) {
	if (response.readyState === XMLHttpRequest.DONE) {
		if (response.status === 200) {
			response = JSON.parse(response.responseText)
			if (response.addedBookmark) {
				element.classList.add("bookmarked-quiz")
				element.textContent = 'bookmark'
			}
			if (response.removedBookmark) {
				element.classList.remove("bookmarked-quiz")
				element.textContent = 'bookmark_border'
			}
		}else {
			errorElement.classList.add("show")
		}
	}
}