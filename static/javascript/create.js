"use strict";
var questionsContainer = document.getElementById('questions-container')
var metaForm = document.getElementById('meta-form')
var url = metaForm.action
var csrf_token = metaForm.querySelector('input').value
var title = metaForm.querySelector('#title')
var description = metaForm.querySelector('textarea')
var postQuizBtn = document.getElementById('post-quiz')
var saveAsDraftBtn = document.getElementById("save-as-draft")
var multipleQuestionsBtn = document.getElementById('create-questions-btn')
var addQuestionBtn = document.getElementById('add-question-btn')
var templates = document.getElementById("templates")
var questionTemplate = templates.firstElementChild
var noOfQuestionsContainer = document.getElementById('no-of-questions-container')
var no_of_questions_display = noOfQuestionsContainer.querySelector('small')
var dropupBtn = document.getElementById('dropup-btn')
var dropup_container = document.getElementById('no-of-questions-dropup')

metaForm.addEventListener('submit', function(event){event.preventDefault()})
multipleQuestionsBtn.addEventListener('click', createQuestionsForms)
addQuestionBtn.addEventListener('click', addQuestionForm)
postQuizBtn.addEventListener('click', function(event){event.preventDefault(); submitQuizz(false)})
saveAsDraftBtn.addEventListener("click", function(event){event.preventDefault(); submitQuizz(true)});
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

var questionForms = document.getElementsByClassName('question-form')

// Creates a single question form and adds it to the document
function addQuestionForm() {
	check_total_no_of_questions(1)
	var total_no_of_questions = questionForms.length
	var new_question_form = questionTemplate.cloneNode(true)
	addListenersToForm(new_question_form)
	addFormAttributes(new_question_form)
}

var formsFragment = document.createDocumentFragment()

// Creates one or more question forms and adds them to the document
function createQuestionsForms() {
	var no_of_questions = document.getElementById('total-no-input').value // no of question forms to be created
	no_of_questions = parseInt(no_of_questions)
	var total_no_of_questions = questionForms.length
	check_total_no_of_questions(no_of_questions)

	for (var i=0,n=no_of_questions; i<n; i++) {
		var new_question_form = questionTemplate.cloneNode(true)
		addListenersToForm(new_question_form)
		addFormAttributes(new_question_form, total_no_of_questions)
		formsFragment.appendChild(new_question_form)

		// manually increment the total_no_of_questions since none of the newly created forms have been added
		// to the DOM yet making both total_no_of_questions and questionForms outdated in the current loop.
		total_no_of_questions += 1
	}
	questionsContainer.appendChild(formsFragment)
}

function check_total_no_of_questions(no_of_questions_to_create) {
	var total_no_of_questions = questionForms.length
	if (total_no_of_questions + no_of_questions_to_create > 30) {
		showError("You can't have more than 30 questions on a quiz")
	}
	if (total_no_of_questions == 0) {
		// remove the 'No question created yet' string from the container
		noOfQuestionsContainer.removeChild(noOfQuestionsContainer.querySelector('span'))
	}
}

function addFormAttributes(new_form, total_no_of_questions) {
	new_form.className = 'question-form'
	var questionBtnLink = document.createElement('a') // anchor tag for the new form
	questionBtnLink.className = 'questions-no'
	if (!total_no_of_questions) {
		var total_no_of_questions = questionForms.length
	}
	new_form.querySelector('label').textContent = 'Question ' + (total_no_of_questions + 1) + ':'

	// Each form should have an id of one less than it's position e.g form 1 should have an id of 0
	// as this would make it very easy to change the remaining forms attributes if a form is removed the DOM
	new_form.id = total_no_of_questions

	questionBtnLink.textContent = (total_no_of_questions + 1)
	questionBtnLink.href = '#' + total_no_of_questions
	new_form.button_link = questionBtnLink
	questionsContainer.appendChild(new_form)
	noOfQuestionsContainer.appendChild(questionBtnLink)
	no_of_questions_display.textContent = total_no_of_questions
}

// adds the necessary event listeners to specific child elements of a form
function addListenersToForm(form) {
	var removeFormBtn = form.querySelector(".remove-form-btn")
	var markOptionButtons = form.querySelectorAll('.mark')
	var removeOptionButtons = form.querySelectorAll('.remove-input')
	var addOptionBtn = form.querySelector(".add-option-btn")

	form.addEventListener('submit', function(event){event.preventDefault()})
	removeFormBtn.addEventListener("click", removeForm)
	addOptionBtn.addEventListener("click", addOptionInput)
	$.each(markOptionButtons, function(index, button){button.addEventListener("click", chooseOptionAsAnswer)})
	$.each(removeOptionButtons, function(index, button){button.addEventListener("click", removeOption)})
}

function chooseOptionAsAnswer(event) {
	if (!event.target.classList.contains('marked')) { // If option wasn't already marked as answer
		var parentForm = $(event.target).closest('form')[0]
		var container = event.target.parentNode
		var containerInputElement = container.querySelector('input')
		var formerAnswer = parentForm.querySelector('.answer')
		var markedBtn = parentForm.querySelector('.marked')

		if (formerAnswer){
			// if there's a formerAnswer, there must also be a markedBtn
			markedBtn.classList.remove('marked')
			formerAnswer.classList.remove('answer')
		}
		containerInputElement.classList.add('answer')
		event.target.classList.add('marked')
	}
}

function removeOption(event) {
	var container = event.target.parentNode
	var parentForm = $(event.target).closest('form')[0]

	// individual html input element (a.k.a option) in parentForm has a div as it's parentNode
	var formOptionsList = parentForm.querySelectorAll("div")

	if (formOptionsList.length > 2) {
		parentForm.removeChild(container)
	}else {
		showError("Each question must have at least two options!")
	}
}

function addOptionInput(event) {
	var optionTemplate = templates.lastElementChild
	var parentForm = $(event.target).closest('form')[0]
	var add_option_btn = parentForm.querySelector('.add-option-btn')
	if (parentForm.querySelectorAll('div').length < 4) {
		parentForm.insertBefore(optionTemplate.cloneNode(true), add_option_btn)
	}else {showError("You can't have more than 4 options on a question")}
}

function removeForm(event) {
	var parentForm = $(event.target).closest('form')[0]

	// id of the removed form which corresponds
	// to the form's index in the questionForms live HTML nodelist
	var starting_form_id = parseInt(parentForm.id)

	noOfQuestionsContainer.removeChild(parentForm.button_link)
	questionsContainer.removeChild(parentForm)
	renumber_forms(starting_form_id)
	var total_no_of_questions = questionForms.length

	if (total_no_of_questions == 0) {
		var empty_text = document.createElement('span')
		empty_text.textContent = "No question created yet"
		noOfQuestionsContainer.appendChild(empty_text)
	}
	no_of_questions_display.textContent = total_no_of_questions
}

// updates the numbered attributes of all forms after the removed form by using the starting_index 
// parameter which will be the new index of the form that immediately follows the removed form
function renumber_forms(starting_index) {
	for (let i=starting_index,l=questionForms.length; i<l; i++) {
		questionForms[i].querySelector('label').textContent = 'Question ' + (i + 1) + ':'
		questionForms[i].button_link.textContent = (i + 1)
		questionForms[i].button_link.href = "#" + i
		questionForms[i].id = i
	}
}

function submitQuizz(quiz_is_draft) {
	if (!title.value.trim() || !description.value.trim()) {
		showError("Quiz must have a title as well as a description.")
	}
	if (questionForms.length === 0) {
		showError("Quiz must have at least one question.")
	}
	var quizData = getQuizQuestions(questionForms)
	if (quizData) {
		sendDataToServer(url, title.value, description.value, quizData, csrf_token, quiz_is_draft)
	}
}

function getQuizQuestions(formElements) {
	var questions_and_options = [];
	for (var i=0,q=formElements.length; i<q; i++) {
		var data = processFormData(formElements[i])
		if (!data) {
			return undefined
		}
		questions_and_options.push(data)
	}
	return questions_and_options;		
}


/** Checks if a form's data is valid and returns it
 * @param {question_form}: this is the form to be checked */
function processFormData(question_form) {
	// This is the format of each new question's data that will be used to update the database in the server side
	var question_data = {question: '', options: [], correct_option: ''}
	var options = question_form.querySelectorAll('input')
	var question_input = question_form.querySelector('textarea').value.trim()
	var answer = ""

	if (!question_input) {
		showError("Question input musn't be empty", question_form)
	}
	question_data.question = question_input
	question_data.options = getOptionsContent(question_form, options)
	if (question_data.options.length < 2) {
		showError("Each question must have at least two options!", question_form)
	}
	if (question_form.querySelector('.answer')) {
		answer = question_form.querySelector('.answer').value.trim()
	}else {
		showError("All Questions must have an option marked as the answer", question_form)
	}
	question_data.correct_option = answer
	return question_data
}


/** Checks if each input element in a form is valid and returns it
 * @param {form}: the target form; used in notifying the user about invalid option inputs
 * @param {optionList}: list of all html input elements (a.k.a options) in the form
*/
function getOptionsContent(form, optionList) {
	var previous_option = ''
	var formated_options = []
	for (var i=0,l=optionList.length; i<l; i++) {
		var option = optionList[i].value.trim()
		if (!option) {
			showError('Each option must have a value', form)
		}
		if (previous_option === option) {
			// Checks if two different options have the same value
			// if they do, it throws an error in the showError function
			showError('Each option must be unique', form)
		}
		previous_option = option
		formated_options.push(option)
	}
	return formated_options;
}

var animationContainer = document.getElementById("loader")
var animation = document.querySelector('.circle-loader')
var loaderTriggerBtn = document.getElementById('loader-trigger')
var closeLoaderBtn = document.getElementById('close-loader')
var animationMessage = document.getElementById("animation-msg")
var checkmark = document.querySelector('.checkmark')

// This function helps to pass parameters to a function refrence
function partial(func) {
	var args = Array.prototype.slice.call(arguments, 1);
	return function(){
		var allArguments = args.concat(Array.prototype.slice.call(arguments))
		return func.apply(this, allArguments)
	}
}

function sendDataToServer(url, title, description, quiz_data, token, save_as_draft) {
	var data = new FormData()
	data.append('csrfmiddlewaretoken', token)
	data.append('title', title)
	data.append('description', description)
	if (save_as_draft) {
		data.append('is_draft', "true")
	}
	data.append('questions_data', JSON.stringify(quiz_data))

	var httpRequest = new XMLHttpRequest()
	httpRequest.open("POST", url)
	httpRequest.onreadystatechange = partial(validate, httpRequest)
	httpRequest.setRequestHeader('X-CSRFToken', token)
	httpRequest.setRequestHeader('Cache-Control', 'no-cache')
	httpRequest.send(data)
	animationMessage.textContent = "Creating Quiz..."
	animation.className = "circle-loader"
	loaderTriggerBtn.click()
}

function validate(response) {
	if (response.readyState === XMLHttpRequest.DONE) {
		if (response.status === 200) {
			animation.classList.add("load-complete")
			checkmark.style.display = 'block'
			animationMessage.style.color = '#5cb85c'
			animationMessage.textContent = "Quiz created successfully."
			response = JSON.parse(response.responseText)
			// opens the url of the newly created quiz
			window.open(window.location.origin + response.url, '_self')
		}else {
			animation.classList.add("error-icon")
			animationMessage.style.color = 'rgb(210, 0, 0)'
			animationMessage.textContent = "Something went Wrong! Please try again."
			animationContainer.removeAttribute('data-backdrop')
		}
	}
}

var popupErrorContainer = document.getElementById("popupError")
var popupErrorMsg = popupErrorContainer.querySelector(".modal-body")
var errorTrigger = document.getElementById("error-trigger");

function showError(text, formElement) {
	popupErrorMsg.textContent = text
	errorTrigger.click() // displays popupErrorContainer
	if (formElement) {
		var formElementErr = formElement.querySelector("p")
		formElement.button_link.classList.add('error')
		formElementErr.textContent = text
		formElement.classList.add("error-input")
		formElement.addEventListener("focusin", function(){
			formElement.classList.remove("error-input")
			formElement.button_link.classList.remove('error')
		})
	}
	throw 'Error: ' + text
}