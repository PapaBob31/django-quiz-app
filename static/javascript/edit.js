// javscript used in editing the contents and attributes of an already created quiz

"use strict";
var questionsContainer = document.getElementById('questions-container')
var metaForm = document.getElementById('meta-form')
var updateQuizBtn = document.getElementById('update-quiz')
var multipleQuestionsBtn = document.getElementById('create-questions-btn')
var addQuestionBtn = document.getElementById('add-question-btn')
var title = document.getElementById("title")
var description = document.getElementById("description")
var templates = document.getElementById("templates")
var questionTemplate = templates.firstElementChild
var optionTemplate = templates.lastElementChild
var noOfQuestionsContainer = document.getElementById('no-of-questions-container')
var no_of_questions_display = noOfQuestionsContainer.querySelector('small')
var dropupBtn = document.getElementById('dropup-btn')
var dropup_container = document.getElementById('no-of-questions-dropup')

metaForm.addEventListener('submit', function(event){event.preventDefault()})
title.addEventListener("input", function(event){event.target.classList.add("edited")})
description.addEventListener("input", function(event){event.target.classList.add("edited")})
multipleQuestionsBtn.addEventListener('click', createQuestionsForms)
addQuestionBtn.addEventListener('click', addQuestionForm)
updateQuizBtn.addEventListener('click', submitQuiz);
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

var questionForms = document.getElementsByClassName('question-form');

// adds necessary attributes to existing question forms that are already present on page
function addAttributesToExistingForms() {
	no_of_questions_display.textContent = questionForms.length
	for (var n=0,q=questionForms.length; n<q; n++) {
		var form = questionForms[n]
		var questionBtnLink = document.createElement('a')
		questionBtnLink.className = 'questions-no'
		form.id = n
		form.querySelector('label').textContent = 'Question ' + (n + 1) + ':'
		questionBtnLink.textContent = (n + 1)
		questionBtnLink.href = '#' + n
		form.button_link = questionBtnLink
		noOfQuestionsContainer.appendChild(questionBtnLink)
	}
}

// adds necessary event listeners to child elements of existing question forms already on the page
(function() {
	var removeFormBtns = questionsContainer.querySelectorAll(".remove-form-btn")
	var markOptionButtons = questionsContainer.querySelectorAll('.mark')
	var removeOptionButtons = questionsContainer.querySelectorAll('.remove-input')
	var addOptionBtns = questionsContainer.querySelectorAll(".add-option-btn")
	var existingQuestionsFields = questionsContainer.querySelectorAll(".question-field")
	var existingOptionsFields = questionsContainer.querySelectorAll(".option-field")

	addAttributesToExistingForms()
	$.each(removeFormBtns, function(index, button){button.addEventListener("click", removeForm)})
	$.each(addOptionBtns, function(index, button){button.addEventListener("click", addOptionInput)})
	$.each(markOptionButtons, function(index, button){button.addEventListener("click", chooseOptionAsAnswer)})
	$.each(removeOptionButtons, function(index, button){button.addEventListener("click", removeOption)})

	// An existing question field becomes 'edited' only if it's value changes
	// The edited-question class is used to indicate that it has been edited
	$.each(existingQuestionsFields, function(index, input){
		input.addEventListener("input", function(event){
			event.target.classList.add("edited-question")
		})
	})
 
 	// An existing option field becomes 'edited' if it's value changes
	// The input-changed class is used to indicate that it has been edited
	$.each(existingOptionsFields, function(index, option){
		option.addEventListener("input", function(event){
			event.target.classList.add("edited-option", "input-changed")})
	})
})();

// adds the necessary event listeners to specific child elements of a form
function addListenersToForm(form) {
	var removeFormBtn = form.querySelector(".remove-form-btn")
	var markOptionButtons = form.querySelectorAll('.mark')
	var removeOptionButtons = form.querySelectorAll('.remove-input')
	var addOptionBtn = form.querySelector(".add-option-btn")

	removeFormBtn.addEventListener("click", removeForm)
	addOptionBtn.addEventListener("click", addOptionInput)
	$.each(markOptionButtons, function(index, button){button.addEventListener("click", chooseOptionAsAnswer)})
	$.each(removeOptionButtons, function(index, button){button.addEventListener("click", removeOption)})
}

// Creates a single question form and adds it to the document
function addQuestionForm() {
	check_total_no_of_questions(1)
	var total_no_of_questions = questionForms.length
	var new_question_form = questionTemplate.cloneNode(true)
	addListenersToForm(new_question_form)
	addFormAttributes(new_question_form)
	questionsContainer.appendChild(new_question_form)
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
}

function addFormAttributes(new_form, total_no_of_questions) {
	// The new-question class added to the form will be used to indicate that the form is a
	// new question when the edited quiz data is being collected to be sent to the server
	new_form.className = 'question-form new-question'

	var questionBtnLink = document.createElement('a') // anchor tag for the new form
	questionBtnLink.className = 'questions-no'
	if (!total_no_of_questions) {
		var total_no_of_questions = questionForms.length
	}
	new_form.querySelector('label').textContent = 'Question ' + (total_no_of_questions + 1) + ':'

	// Each form should have an id of one less than it's position e.g form 1 should have an id of 0
	// as this would make it very easy to change the remaining forms attributes if a form is removed from the DOM
	new_form.id = total_no_of_questions

	questionBtnLink.textContent = (total_no_of_questions + 1)
	questionBtnLink.href = '#' + total_no_of_questions
	new_form.button_link = questionBtnLink
	questionsContainer.appendChild(new_form)
	noOfQuestionsContainer.appendChild(questionBtnLink)
	no_of_questions_display.textContent = total_no_of_questions
}

// sets the input element beside the clicked button as the parent form's answer element
function chooseOptionAsAnswer(event) {
	var clickedBtn = event.target
	if (!clickedBtn.classList.contains('marked')) { // If the clicked button wasn't already clicked
		var parentForm = $(clickedBtn).closest('form')[0]
		var container = $(clickedBtn).closest('div')[0]
		var containerInputElement = container.querySelector('input')
		var formerAnswer = parentForm.querySelector('.answer')
		var markedBtn = parentForm.querySelector('.marked')

		if (formerAnswer){
			// if there's a formerAnswer, there must also be a markedBtn
			markedBtn.classList.remove('marked')
			formerAnswer.classList.remove('answer')
		}
		clickedBtn.classList.add('marked')
		containerInputElement.classList.add('answer')

		if (!parentForm.classList.contains("new-question")) {
			// If parent form is an existing question form, the option chosen as the new answer becomes 'edited'.
			// Classes added below will be used to indicate that it has been edited.
			containerInputElement.classList.add("edited-option", "updated-as-answer")
			return;
		}
	}
}

function removeOption(event) {
	var container = event.target.parentNode
	var option_id = container.querySelector("input").id
	var parentForm = $(event.target).closest('form')[0]

	// individual html input element (a.k.a option) in parentForm has a div as it's parentNode
	var formOptionList = parentForm.querySelectorAll("div")

	if (formOptionList.length > 2) {
		parentForm.removeChild(container)
		if (!parentForm.classList.contains("new-question")) {
			if (!parentForm.deletedOptions){
				// deletedOptions attribute only gets added to a form element object when one of it's option is deleted
				parentForm.deletedOptions = ''
			}

			// The option_id added to parentForm's deletedOptions attribute will be retrieved when the 
			// edited quiz data is being collected to be sent to the server.
			parentForm.deletedOptions += (' ' + option_id)
		}
	}else {
		showError("Each question must have at least two options!", parentForm)
	}
}

function addOptionInput(event) {
	var parentForm = $(event.target).closest('form')[0]
	var add_option_btn = parentForm.querySelector('.add-option-btn')
	var optionElement = optionTemplate.cloneNode(true)
	if (parentForm.querySelectorAll('div').length < 4) {
		if (!parentForm.classList.contains("new-question")) {
			var input = optionElement.querySelector('input')
			// If parent form is an existing question form, the new option added becomes 'edited'.
			// Classes added below will be used to indicate that it has been edited.
			input.classList.add("edited-option", "new-option")
		}
		parentForm.insertBefore(optionElement, add_option_btn)
	}else {showError("You can't have more than 4 options on a question", parentForm)}
}

var deleted_questions = []
function removeForm(event) {
	var parentForm = $(event.target).closest('form')[0]

	// id of the removed form which corresponds
	// to the form's index in the questionForms live HTML nodelist
	var starting_form_id = parseInt(parentForm.id)

	var total_no_of_questions = questionForms.length
	noOfQuestionsContainer.removeChild(parentForm.button_link)
	questionsContainer.removeChild(parentForm)
	renumber_forms(starting_form_id)

	if (total_no_of_questions == 0) {
		var empty_text = document.createElement('span')
		empty_text.textContent = "No question created yet"
		noOfQuestionsContainer.appendChild(empty_text)
	}
	no_of_questions_display.textContent = total_no_of_questions
	deleted_questions.push(parentForm.getAttribute('data-id'))
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

function submitQuiz() { 
	var url = metaForm.action
	var csrf_token = metaForm.querySelector('input').value

	if (!title.value.trim() || !description.value.trim()) {
		showError("Quiz must have a title as well as a description.")
	}
	var quizContainsQuestion = questionsContainer.querySelector('.question-form') // Checks if document contains at least one question
	if (!quizContainsQuestion) {
		showError("Quiz must have at least one question.")
	}
	var newQuestionForms = questionsContainer.querySelectorAll(".new-question")
	if (newQuestionForms.length > 0) {
		var newQuestionsData = getQuizQuestions(newQuestionForms)
		if (newQuestionsData) {
			getAllEditedData(url, csrf_token, newQuestionsData)
			return;
		}
	}
	getAllEditedData(url, csrf_token)
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

	var option_elements = question_form.querySelectorAll('input')
	var question_input = question_form.querySelector('textarea').value.trim()
	var answer = ""

	if (!question_input) {
		showError("Question input musn't be empty", question_form)
	}
	question_data.question = question_input
	question_data.options = getOptionsContent(question_form, option_elements)
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

function get_edited_questions() {
	var edited_questions_attrs = []
	var inputs = questionsContainer.querySelectorAll(".edited-question")
	for (var i=0,l=inputs.length; i<l; i++) {
		var content = inputs[i].value.trim()
		if (content) {
			edited_questions_attrs.push({"id": inputs[i].parentNode.getAttribute('data-id'), "new_content": content})
		}else {
			showError("Each question must have a value", $(inputs[i]).closest("form")[0])
		}
	}
	return edited_questions_attrs
}

// An option becomes 'edited' if it is added as a new option on an existing question, 
// if it's value changes or if it is selected as the new answer of an existing question
function get_edited_options() {
	var edited_options_elements = questionsContainer.querySelectorAll(".edited-option")
	var edited_options_attrs = []

	for (var i=0,e=edited_options_elements.length; i<e; i++) {
		var element = edited_options_elements[i]
		var parentForm = $(element).closest("form")[0]

		// This is the format of each edited option's data that will be used to update the database in the server side
		var attr_obj = {value_changed: '', new_option: '', new_content: element.value, 
										question_id: parentForm.getAttribute('data-id'), new_answer: '', id: element.id}

		if (!element.value.trim()) {
			showError("Each option must have a value", parentForm)
		}
		if (element.classList.contains("input-changed")) {
			attr_obj.value_changed = 'True'
		}else if (element.classList.contains("new-option")) {
			attr_obj.new_option = 'True'
		}if (element.classList.contains("updated-as-answer")) {
			attr_obj.new_answer = 'True'
		}
		edited_options_attrs.push(attr_obj)
	}
	return edited_options_attrs
}

function getdeletedOptions(form_element) {
	var deletedFormOptions = form_element.deletedOptions
	if (deletedFormOptions) {
		deletedFormOptions = deletedFormOptions.trim()
		return deletedFormOptions.split(' ') // A question may have multiple deleted options
	}
}

function getAllEditedData(url, token, new_questions_data) {
	var data = {}
	if (title.classList.contains("edited")){
		data.new_title = title.value.trim()
	}
	if (description.classList.contains("edited")){
		data.new_description = description.value.trim()
	}
	var existingForms = questionsContainer.querySelectorAll('.existing-question')
	var deleted_options = []
	for (var i=0,e=existingForms.length; i<e; i++) {
		if (processFormData(existingForms[i])) { // Checks if existing question's data are all still valid
			var option_id = getdeletedOptions(existingForms[i])
			if (option_id) {
				deleted_options = deleted_options.concat(option_id)
			}
		}else{return;}
	}
	if (deleted_options.length > 0) {
		data.deleted_options = deleted_options
	}
	if (deleted_questions.length > 0) {
		data.deleted_questions = deleted_questions
	}
	var edited_questions = get_edited_questions()
	if (edited_questions.length > 0) {
		data.edited_questions = edited_questions
	}
	var edited_options = get_edited_options()
	if (edited_options.length > 0) {
		data.edited_options = edited_options
	}
	if (new_questions_data) {
		data.new_questions = new_questions_data
	} 
	if (Object.keys(data).length > 0) { // Checks if data is not an empty object
		sendDataToServer(url, token, JSON.stringify(data));
	}else{showError("You didn't update anything")}
}


// This function helps to pass parameters to a function refrence
function partial(func) {
	var args = Array.prototype.slice.call(arguments, 1);
	return function() {
		var allArguments = args.concat(Array.prototype.slice.call(arguments))
		return func.apply(this, allArguments)
	}
}

var animationContainer = document.getElementById("loader")
var animation = document.querySelector('.circle-loader')
var loaderTriggerBtn = document.getElementById('loader-trigger')
var closeLoaderBtn = document.getElementById('close-loader')
var animationMessage = document.getElementById("animation-msg")
var checkmark = document.querySelector('.checkmark')

function sendDataToServer(url, csrf_token, edited_data) {
	var httpRequest = new XMLHttpRequest()
	httpRequest.onreadystatechange = partial(validate, httpRequest)
	httpRequest.open('POST', url)
	httpRequest.setRequestHeader('X-CSRFToken', csrf_token)
	httpRequest.setRequestHeader('Content-Type', 'application/json')
	httpRequest.setRequestHeader('Cache-Control', 'no-cache')
	httpRequest.send(edited_data)
	animationMessage.textContent = "Updating Quiz..."
	animation.className = "circle-loader"
	loaderTriggerBtn.click() // start loading animation
}

function validate(response) {
	if (response.readyState === XMLHttpRequest.DONE) {
		if (response.status === 200) {
			animation.classList.add("load-complete")
			checkmark.style.display = 'block'
			animationMessage.style.color = '#5cb85c'
			animationMessage.textContent = "Quiz created successfully."
			response = JSON.parse(response.responseText)
			// opens the url of the updated quiz
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
var errorTrigger = document.getElementById("error-trigger")

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