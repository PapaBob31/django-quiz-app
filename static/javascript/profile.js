(function() {
		var quizLikeBtns = document.querySelectorAll(".like-quiz-btn")
		var quizDislikeBtns = document.querySelectorAll(".dislike-quiz-btn")

		$.each(quizLikeBtns, function(index, btn){
			btn.addEventListener("click", likeOrDislikeQUiz)
		})
		$.each(quizDislikeBtns, function(index, btn){
			btn.addEventListener("click", likeOrDislikeQUiz)
		})
})();
var usernameForm = document.getElementById("username-form") // form for updating username
var emailForm = document.getElementById("email-form") // form for updating email
var deleteQuizBtn = document.getElementById('delete') // delete button inside the delete quiz prompt 

emailForm.addEventListener('submit', function(event){event.preventDefault();})
usernameForm.addEventListener('submit', function(event){event.preventDefault()})
deleteQuizBtn.addEventListener('click', deleteQuiz)

var quizContainer = document.getElementById("quiz-container")
var token = quizContainer.querySelector("input").value

// each link in quizDeleteLinks has an href attribute which is the request url for deleting a particular quiz
// each link triggers a delete quiz prompt and doesn't actually send the request.
var quizDeleteLinks = document.querySelectorAll(".delete-quiz")
$.each(quizDeleteLinks, function(index, link){link.addEventListener("click", beforeDeleting)})

// Element that shows the status of a request's response. The display is hidden by default
var alertContainer = document.getElementById("actionAlert")
var alertMsg = alertContainer.querySelector("span")
var alertCloseBtn = alertContainer.querySelector("button")
alertCloseBtn.addEventListener("click", function(){
	alertContainer.className = "alert alert-dismissible fade"
})

// This function helps to pass arguments to a function refrence
function partial(func) {
	var args = Array.prototype.slice.call(arguments, 1);
	return function() {
		var allArguments = args.concat(Array.prototype.slice.call(arguments))
		return func.apply(this, allArguments)
	}
}

function beforeDeleting(event) {
	deleteQuizBtn.setAttribute('data-targetId', event.target.id)

	// hide alertContainer if it's being shown or reset it's class if it has been modified
	alertContainer.className = "alert alert-dismissible fade"
}

function deleteQuiz(event) {
	var linkId = deleteQuizBtn.getAttribute('data-targetId')
	var deleteLink = document.getElementById(linkId)

	// parent element of deleteLink that also contains the target quiz link
	var parentDiv = deleteLink.parentNode
	parentDiv.classList.add('deleting') // displays an animation to indicate that the quiz is being deleted

	var httpRequest = new XMLHttpRequest()
	httpRequest.onreadystatechange = partial(validate, httpRequest, parentDiv)
	httpRequest.open("POST", deleteLink.getAttribute('data-href'))
	httpRequest.setRequestHeader('X-CSRFToken', token)
	httpRequest.setRequestHeader('Cache-Control', 'no-cache')
	httpRequest.send()
}

function validate(response, quiz) {
	if (response.readyState === XMLHttpRequest.DONE) {
		if (response.status === 200) {
			alertUser("Quiz deleted Succesfully!", "alert-success")
			quizContainer.removeChild(quiz) // removing the quiz shows the user that it has been deleted 
		}else {
			alertUser("Something went wrong! pls try again later.", "alert-danger")
			quiz.classList.remove('deleting') // stop animation to indicate that the quiz couldn't be deleted
		}
	}
	deleteQuizBtn.removeAttribute('data-targetId')
}

// Sends a request for liking or disliking a quiz
function likeOrDislikeQUiz(event) {
	event.preventDefault()
	alertContainer.className = "alert alert-dismissible fade"

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

/** Displays a request's response/result in a way understandable by the user
 * @param {type}: a class that changes alertContainer's colour to indicate the type of response e.g sucessful, failure
 **/
function alertUser(msg, type) {
	alertMsg.textContent = msg
	alertContainer.classList.add(type, "show") // the "show" class added displays alertContainer on screen
}