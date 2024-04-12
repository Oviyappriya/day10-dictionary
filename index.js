let form = document.getElementById('dictform');
let wordInfo = document.getElementById('meaningforward');
let wordInput = document.getElementById('wordinput');
let searchHistory = document.getElementById('searchHistory');

let history = [];

try {
    // get the search history from the local storage
    history = JSON.parse(localStorage.getItem('searchHistory')) || [];
} catch (error) {
    // log the error to the console
    console.log(error);
}   

wordInput.addEventListener('click', (e) => {
    // clear the search word from the input box
    wordInput.value = '';

    // show a div below the search box with the search
    // history
    searchHistory.innerHTML = '';

    // create a list
    let list = document.createElement('ul');
    list.classList.add('list-group');

    // populate the list with the list items
    // for every word in the history array
    history.forEach(word => {
        // create a new list item
        let listItem = document.createElement('li');
        listItem.classList.add('list-group-item', 'list-group-item-action');

        // add the word to the list item
        listItem.textContent = word;

        // attach an event listener to the list item
        listItem.addEventListener('click', (e) => {
            // get the dictionary definition of the word
            getmeaning(e.target.textContent);
            searchHistory.style.display = 'none';
            wordInput.value = e.target.textContent;
        });

        list.appendChild(listItem);
    });

    // append the list to the search history div
    searchHistory.appendChild(list);

    searchHistory.style.display = 'block';
});

// attach an event listener to the form element
form.addEventListener('submit', (e) => {
    // prevent the default form submission
    e.preventDefault();

    // get the input word from the form
    let word = document.getElementById('wordinput').value;

    // get the dictionary definition of the word
    getmeaning(word); // asynchronous function

    if (word) {
        // check if the word exists in the history already
        if (!history.includes(word.toLowerCase())) {
            // add the word to the history
            history.push(word.toLowerCase());
        }
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }

    searchHistory.style.display = 'none';
});

async function getmeaning(word) {
    try {
        // make a request to the api
        let response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

        // get the response from the api
        let data = await response.json();

        // parse the meaning of the word from the response to the html page
        let paragraph = document.createElement('div');
        let list = document.createElement('ul');
        let meanings = data[0].meanings;

        list.style.listStyleType = 'none';
        meanings.forEach(meaning => {
            let listItem = document.createElement('li');
            listItem.innerHTML = `PartOfSpeech: <strong>${meaning.partOfSpeech}</strong>:`;

            let definitions = meaning.definitions;
            let subList = document.createElement('ol');

            for (let definition of definitions) {
                let subListItem = document.createElement('li');
                subListItem.innerHTML = `<em>${definition.definition}</em>`
                subList.appendChild(subListItem);
            }

            listItem.appendChild(subList);
            list.appendChild(listItem);
        });

        paragraph.innerHTML = `
        <span class='fas fa-volume-up' id='audio-icon'></span>
        <audio id='audio'>
            <source src=${data[0].phonetics[0].audio.toString()} type='audio/mpeg'>
        </audio>
        Word: <strong>${data[0].word}</strong>`;

        wordInfo.innerHTML = '';
        wordInfo.appendChild(paragraph);
        wordInfo.appendChild(list);

        document.getElementById('audio-icon').addEventListener('click', () => {
            document.getElementById('audio').play();
        });
    } catch (error) {
        // log the error to the console
        console.log(error);
        wordInfo.innerHTML = `<p class='text-danger'>The word <strong>${word}</strong> is not found in the dictionary</p>`;
    }
}