// script.js

document.addEventListener('DOMContentLoaded', init);

// Initializes the document
function init() {
  bindListeners();
}

// Binds the event listener to the form
function bindListeners() {
  const form = document.querySelector('form');
  form.addEventListener('submit', setNewMsg);
}

// Sets the new message on the my-button element
function setNewMsg(e) {
  // Prevent the form from refreshing the page
  e.preventDefault();
  // Select the needed elements
  const newMsg = document.querySelector('input');
  const myBtn = document.querySelector('my-button');
  const output = document.querySelector('output');
  // Set the new attribute value and display a message
  myBtn.setAttribute('msg', newMsg.value);
  newMsg.value = '';
  output.innerHTML = 'New message set!';
  // Clear the output message after a second
  setTimeout(() => {
    output.innerHTML = '';
  }, 1000);
}