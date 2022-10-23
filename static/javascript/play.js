var noOfQuestionsContainer = document.getElementById('no-of-questions-container')
var dropupBtn = document.getElementById('dropup-btn')
var dropup_container = document.getElementById('no-of-questions-dropup')

dropupBtn.addEventListener('click', showDropup)
noOfQuestionsContainer.addEventListener('click', showDropup)
showOrHideThirdContainer()
window.addEventListener('resize', showOrHideThirdContainer)

// changes the position of noOfQuestionsContainer based on screen width
function showOrHideThirdContainer(){
	if (window.innerWidth <= 992) {
		dropup_container.appendChild(noOfQuestionsContainer)
		noOfQuestionsContainer.on_screen = false
	}else if (!noOfQuestionsContainer.on_screen) {
		document.body.appendChild(noOfQuestionsContainer)
		noOfQuestionsContainer.invisible = true
	}
}

function showDropup(event){
	event.stopPropagation()
	noOfQuestionsContainer.classList.toggle("show")
}

window.onclick = function(event) {
	noOfQuestionsContainer.classList.remove("show")
}

var just_submitted_quiz = false

var quizOptions = document.querySelectorAll(".option")
$.each(quizOptions, function(index, option) {
	option.addEventListener("click", displaySelectedOption)
})

// display an option element as selected when clicked
function displaySelectedOption(event){
	if (!just_submitted_quiz) {
		var parentQuestion = $(event.target).closest("article")[0]
		var alreadySelectedOption = parentQuestion.querySelector(".selected-option")
		if (alreadySelectedOption) {
			if (alreadySelectedOption === event.target) {
				alreadySelectedOption.classList.remove("selected-option")
				parentQuestion.classList.remove('answered')
				parentQuestion.button_link.classList.remove("answered-question-btn")
				return;
			}else {
				alreadySelectedOption.classList.remove("selected-option")
			}
		}
		parentQuestion.classList.add('answered')
		parentQuestion.button_link.classList.add("answered-question-btn")
		event.target.classList.add("selected-option")
	}
}

var startQuizBtn = document.getElementById("start-quiz-btn")
startQuizBtn.addEventListener("click", startQuiz);

// Quizzes can be taken in two ways: Sequentially or All at once
(function() {
	var sequentiallyBtn = document.getElementById("sequentially-btn")
	var allAtOnceBtn = document.getElementById("all-at-once-btn")
	var optionDisplay = document.getElementById("option-display") // mode of playing drop-down buttton display

	sequentiallyBtn.addEventListener("click", function(){
		optionDisplay.textContent = "Sequentially"
		startQuizBtn.setAttribute('data-ui-type', "sequentially")
	})

	allAtOnceBtn.addEventListener("click", function(){
		optionDisplay.textContent = "All at Once"
		startQuizBtn.setAttribute('data-ui-type', "all-at-once")
	})
})();

var questions = document.getElementsByClassName("question")
var alertDisplay = document.getElementById("alert")
var resultBtn = document.getElementById('result-trigger')
resultBtn.addEventListener('click', function(){allQuestionsAreAnswered(false)})
var resultAlert = document.getElementById("result-alert")
var resultDisplay = resultAlert.querySelector('span')

var promptResultBtn = document.getElementById('promptbtn') 
promptResultBtn.addEventListener('click', function(){allQuestionsAreAnswered(true)})
var alertPlayAgainBtn = document.getElementById('alert-play-again-btn')
alertPlayAgainBtn.addEventListener('click', reset_page)

var modalTrigger = document.getElementById('modal-trigger')
var answered_questions = document.getElementsByClassName('answered')
var unansweredModalCloseBtn = document.getElementById('unansweredModalCloseBtn')

function startQuiz() {
	if (startQuizBtn.getAttribute('data-ui-type') === 'sequentially') {
		// if user chooses to take the quiz questions sequentially
		displayQUiz(true)
	}else {
		// if user chooses to take the quiz questions all at once
		displayQUiz()
	}
	resultBtn.removeAttribute('disabled')
}

// article element that displays info about the quiz before the user clicks the startQuizBtn
var prepMsg = document.getElementById("prep")

var noOfQuestions = parseInt(document.getElementById("no-of-questions").textContent)

// The question that's currently being displayed on screen if the user takes the quiz sequentially
var currentlyShownQuestion = undefined

// Index of currentlyShownQuestion in questions list 
var current_index = 0

function displayQUiz(display_is_sequential) {
	prepMsg.classList.add("d-none") // Change the display to none
	if (display_is_sequential) {
		currentlyShownQuestion = questions[current_index]
		currentlyShownQuestion.classList.remove('d-none') // display currentlyShownQuestion
		addListenersToBtns()
		displayQuestionsNumBtns('button')
	}else {
		// display all the questions in the quiz at once
		$.each(questions, function(index, question) {
			question.classList.remove('d-none')
		})
		displayQuestionsNumBtns('a')
	}
}

// creates a button or anchor element for each question and each button or anchor tag
// can be used to display the question it's mapped to (as in sequentially) or 
// as an hyperlink for the question it's mapped to (as in all at once)
function displayQuestionsNumBtns(button_type) {
	var questions_number_container = document.getElementById("no-of-questions-container")
	var questionHyperLink = document.createElement(button_type)
	questionHyperLink.className = 'questions-no'
	var dummyContainer = document.createDocumentFragment()

	for (let i=0, q=questions.length; i<q; i++) {
		questions[i].id = i
		questions[i].querySelector('h5').textContent = "Question" + (i + 1) + ":"
		questionHyperLink.textContent = (i + 1)
		questionHyperLink = questionHyperLink.cloneNode(true)
		if (button_type === 'button') {
			questionHyperLink.questionId = i;
			(function() {
				var link = questionHyperLink
				link.addEventListener("click", function(){current_index = link.questionId; displayQuestion();})
			})();
		}else {
			questionHyperLink.href = "#" + i
		}
		questions[i].button_link = questionHyperLink
		dummyContainer.appendChild(questionHyperLink)
	}

	questions_number_container.appendChild(dummyContainer)
	questions_number_container.classList.remove('invisible') // displays the created elements
}


// Adds the necessary event listeners to the next and previous buttons when a user takes a quiz sequentially
function addListenersToBtns() {
	var prevQuestionBtn = document.getElementById("prev-question")
	var nextQuestionBtn = document.getElementById("next-question")
	var questionsNavBtnContainer =  document.getElementById("questions-nav-btn-container")

	if (questions.length === 1) {
		nextQuestionBtn.disabled = true
	}

	prevQuestionBtn.addEventListener("click", function(){
		current_index -= 1
		if (current_index === 0) { 
			// if current_index is the first question's index in questions list
			prevQuestionBtn.disabled = true
		}
		if ((current_index < noOfQuestions-1) && nextQuestionBtn.disabled) {
			// if current_index is not the last question's index and nextQuestionBtn is disabled
			nextQuestionBtn.disabled = false
		}
		displayQuestion()
	})

	nextQuestionBtn.addEventListener("click", function(){
		current_index += 1
		if (current_index === noOfQuestions-1) {
			// if current_index is the last question's index in questions list
			nextQuestionBtn.disabled = true
		}
		if (current_index >= 1 && prevQuestionBtn.disabled) {
			// if current_index is not the first question's index and prevQuestionBtn is disabled
			prevQuestionBtn.disabled = false
		}
		displayQuestion()
	})

	questionsNavBtnContainer.className = "d-flex"
}

function displayQuestion() {
	currentlyShownQuestion.classList.add('d-none')
	currentlyShownQuestion = questions[current_index]
	currentlyShownQuestion.classList.remove('d-none')
}

// list containing option elements whose classList has been modified when 
// displaying wrong and correct options whenever the quiz result is shown
var modifiedOptionElements = []

function reset_page() {
	resultBtn.textContent = 'Submit'

	// Can't remove elements from the beginning of a live HTML collection
	// without causing lots of indexing problems. best to loop from the end
	for (var i=answered_questions.length-1; i>=0; i--) {
		answered_questions[i].button_link.classList.remove('answered-question-btn')
		answered_questions[i].classList.remove('answered') // this is the same as removing it from the HTML collection
	}

	$.each(modifiedOptionElements, function(index, option){
		reset(option)
	})
	just_submitted_quiz = false
	modifiedOptionElements = []
}

function reset(option) {
	var correctBtn = option.querySelector(".correct")
	var wrongBtn = option.querySelector(".wrong")
	option.classList.remove('selected-option')
	correctBtn.classList.add('d-none')
	option.classList.remove('display-as-correct')	
	wrongBtn.classList.add('d-none')
	option.classList.remove('display-as-wrong')
}

/** Optionally check if all questions have been answered 
 * @param {bypass_prompt}: boolean that determines if to check for unanswered question 
*/
function allQuestionsAreAnswered(bypass_prompt) {
	if (!just_submitted_quiz) {
		if (!bypass_prompt) {

			// check if all questions have been answered
			if (questions.length > answered_questions.length) {
				modalTrigger.setAttribute('data-target', '#unanswered-questions')

				// displays a message on the screen informing the user about unsanswered questions
				modalTrigger.click() 
				return;
			}
		}
		unansweredModalCloseBtn.click()
		showResult()
	}else {
		// If quiz was just submited, the resultBtn will now act as 'play again' button thereby 
		// resetting the page when clicked.
		reset_page()
	}
}

function showResult() {
	var total = questions.length
	var score = 0;
	for (var n=0, t=total; n<t; n++) {
		var current_question = questions[n]
		var selectedOption = current_question.querySelector(".selected-option")
		var answer = current_question.querySelector(".correct-option")

		// if the user selected an option for the question
		if (selectedOption) { 
			var correctBtn = selectedOption.querySelector(".correct") // icon that displays selectedOption as correct
			var wrongBtn = selectedOption.querySelector(".wrong") // icon that displays selectedOption as wrong
			if (selectedOption === answer) {
				correctBtn.classList.remove("d-none") // show the correct icon
				score += 1
			}else {
				wrongBtn.classList.remove("d-none") // show the wrong icon
				selectedOption.classList.add("display-as-wrong") // display the option as wrong
			}
			modifiedOptionElements.push(selectedOption)
		}

		modifiedOptionElements.push(answer)
		answer.classList.add("display-as-correct") // display the correct option whether it was selectedOption or not
	}
	displayResultAndUpdatePage(score + "/" + total)
}

function displayResultAndUpdatePage(result) {
	modalTrigger.setAttribute('data-target', "#resultAlert")
	resultDisplay.textContent = result
	resultBtn.textContent = 'Play again'
	modalTrigger.click() // displays the result on screen
	just_submitted_quiz = true
}

var quizLikeBtn = document.getElementById("like-btn")
var quizDislikeBtn = document.getElementById("dislike-btn")
quizLikeBtn.addEventListener("click", likeOrDislikeQUiz)
quizDislikeBtn.addEventListener("click", likeOrDislikeQUiz)

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

var alertContainer = document.getElementById("actionAlert")
var alertMsg = alertContainer.querySelector("span")
var alertCloseBtn = alertContainer.querySelector("button")
alertCloseBtn.addEventListener("click", function(){
	alertContainer.className = "alert alert-dismissible fade"
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
				no_of_likes.textContent = (parseInt(no_of_likes.textContent) + 1).toString()
			}
			if (response.removedDislike) {
				dislikeBtn.classList.remove("disliked-quiz")
				no_of_dislikes.textContent = (parseInt(no_of_dislikes.textContent) - 1).toString()
			}
			if (response.removedLike) {
				likeBtn.classList.remove("liked-quiz")
				no_of_likes.textContent = (parseInt(no_of_likes.textContent) - 1).toString()
			}
			if (response.addedDislike) {
				dislikeBtn.classList.add("disliked-quiz")
				no_of_dislikes.textContent = (parseInt(no_of_dislikes.textContent) + 1).toString()
			}
		}else {
			alertMsg.textContent = "Something went wrong! pls try again later."
			alertContainer.classList.add("alert-danger", "show")
		}
	}
}

