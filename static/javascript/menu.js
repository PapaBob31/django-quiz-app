
var menu = document.getElementById('menu')
var menuBackdrop = document.getElementById('menu-backdrop')
var menuTrigger = document.getElementById("menu-trigger")
var closeMenuBtn = menu.querySelector("#close-menu")
menuTrigger.addEventListener('click', showMenu)
menuBackdrop.addEventListener('click', hideMenu)
closeMenuBtn.addEventListener('click', hideMenu)

function showMenu() {
	document.body.cssText="overflow: hidden; padding-right: 0px;"
	menu.classList.add('show')
	menuBackdrop.classList.add('show')
}

function hideMenu() {
	menu.classList.remove('show')
	menuBackdrop.classList.remove('show')
	// menu.classList.add('offscreen')
}

var searchBar = document.getElementById('search-form')
var searchBarToggle = document.getElementById('search-bar-toggle')
var closeFormBtn = document.getElementById('close-form')
searchBarToggle.addEventListener('click', function(){searchBar.classList.add('show')})
closeFormBtn.addEventListener('click', function(){searchBar.classList.remove('show')})