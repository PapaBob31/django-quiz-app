(function() {
		var quizLikeBtns = document.querySelectorAll(".like-quiz-btn")
		var quizDislikeBtns = document.querySelectorAll(".dislike-quiz-btn")
		var removeBookmarkBtns = document.querySelectorAll(".remove-bookmark")

		$.each(quizLikeBtns, function(index, btn){
			btn.addEventListener("click", likeOrDislikeQUiz)
		})
		$.each(quizDislikeBtns, function(index, btn){
			btn.addEventListener("click", likeOrDislikeQUiz)
		})
		$.each(removeBookmarkBtns, function(index, btn){
			btn.addEventListener("click", removeBookmark)
		})
})();

var bookmarksContainer = document.querySelector("main")
var token = bookmarksContainer.querySelector("input").value

var alertContainer = document.getElementById("actionAlert")
var alertMsg = alertContainer.querySelector("span")
var alertCloseBtn = alertContainer.querySelector("button")
alertCloseBtn.addEventListener("click", function(){
	alertContainer.className = "alert alert-dismissible fade"
})

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
		}else {alertUser("Something went wrong! pls try again later.", "alert-danger")}
	}
}

// Sends a request to remove a quiz from a user bookmarks 
function removeBookmark(event) {
	// hide alertContainer if it's being shown or reset it's class if it has been modified
	alertContainer.className = "alert alert-dismissible fade"
	var removeBookmarkButton = event.target
	var url = removeBookmarkButton.getAttribute('data-href')
	var parentDiv = removeBookmarkButton.parentNode // parent element that also contains the target quiz link
	parentDiv.classList.add('removing') // displays an animation to indicate that the quiz is being removed from bookmarks
	
	var httpRequest = new XMLHttpRequest()
	httpRequest.open("POST", url)
	httpRequest.onreadystatechange = partial(updateDisplay, httpRequest, parentDiv)
	httpRequest.setRequestHeader('X-CSRFToken', token)
	httpRequest.setRequestHeader('Content-Type', 'text/plain')
	httpRequest.setRequestHeader('Cache-Control', 'no-cache')
	httpRequest.send()
}


function updateDisplay(response, quiz) {
	if (response.readyState === XMLHttpRequest.DONE) {
		if (response.status === 200) {
			alertUser("Bookmark removed succesfully!", "alert-success")
			bookmarksContainer.removeChild(quiz) // removing the quiz shows the user that it is no longer bookmarked
		}else {
			alertUser("Something went wrong! pls try again later.", "alert-danger")
			quiz.classList.remove('removing') // stop animation to indicate that the bookmark couldn't be removed
		}
	}
}

/** Displays a request's response/result in a way understandable by the user
 * @param {type}: a class that changes alertContainer's colour to indicate the type of response e.g sucessful, failure
 **/
function alertUser(msg, type) {
	alertMsg.textContent = msg
	alertContainer.classList.add(type, "show") // the "show" class added displays alertContainer on screen
}