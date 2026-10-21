var globalJSON = {};
let globalFlagName = 'USAFlag';

// Define language content
const languageContent = {
    'BRFlag': {
        'secretSantaHead': 'Gerador de Amigo Secreto',
        'namePlaceholder': 'Nome',
        'preferencesPlaceholder': 'Preferências',
        'aversionsPlaceholder': 'Aversões',
        'addButtonText': '+Adicionar',
        'randomizeButtonText': 'Sortear',
        'buysFor': ' compra para -> ',
        'nameLinkHere': 'Copie aqui o link do nome ->',
        'errorMessage': 'Deve ter pelo menos 3 nomes inseridos para Sortear',
        'footerMainText': '🎅 Ajudante do Amigo Secreto! 🎁',
        'footerJoiningFun': 'Participar da diversão agora ficou fácil! Este ajudante explica tudo o que faz. Vamos começar! ☃️',
        'footerName': '📛 <strong>Nome:</strong> Adicione os nomes dos amigos secreto que fará parte da brincadeira, em seguida, pergunte se eles tem <strong>Preferências</strong> ou <strong>Aversões</strong>',
        'footerPreferences': '🎯 <strong>Preferências:</strong> Nome daqueles que você <strong>ESPERA COMPRAR PRESENTES PARA</strong> separados por espaço ou vírgula.',
        'footerAversions': '🚫 <strong>Aversões:</strong> Nome daqueles que você <strong>NÃO QUER COMPRAR PRESENTE PARA</strong>, separar nomes com espaços ou vírgulas',
        'footerWarning': 'Certifique-se de que os nomes nas \'Preferências\' e \'Aversões\' estão escritos corretamente para evitar confusões',
        'footerFinally': 'Finalmente, clique em \'SORTEAR\' e fique feliz por não precisar tirar o seu próprio nome de dentro do chapéu.',
        'footerClosing': 'Feliz Natal e feliz entrega de presentes!'
    },
    'USAFlag': {
        'secretSantaHead': 'Secret Santa Generator',
        'namePlaceholder': 'Name',
        'preferencesPlaceholder': 'Preferences',
        'aversionsPlaceholder': 'Aversions',
        'addButtonText': '+ Add',
        'randomizeButtonText': 'Randomize',
        'buysFor': ' buys for -> ',
        'nameLinkHere': 'Link to Name. Copy Here -> ',
        'errorMessage': 'Must have at least 3 names entered to randomize',
        'footerMainText': '🎅 Secret Santa Helper! 🎁',
        'footerJoiningFun': 'Joining in the fun is as easy as a reindeer\'s hop! This helper explains what everything does. Lets Get Started! ☃️',
        'footerName': '📛 <strong>Name:</strong> Name a festive friend who\'s in your gift exchange next they may list <strong>Preferences</strong> or <strong>Aversions</strong>',
        'footerPreferences': '🎯 <strong>Preferences:</strong> Names of those you <strong>HOPE TO BUY FOR</strong> separated by a space or comma.',
        'footerAversions': '🚫 <strong>Aversions:</strong> Names of those you hope to have <strong>SOMEONE ELSE BUY FOR</strong> separate names with spaces or commas.',
        'footerWarning': 'Be sure that names in the \'Preferences\' and \'Aversions\' are spelled right to keep our Christmas elves from getting mixed up!',
        'footerFinally': 'Finally, hit \'Randomize\' and be glad you don\'t need to pick your own name out of a hat.',
        'footerClosing': 'Merry Christmas and happy gift giving!'
    }
};


// Function to switch language
function switchLanguage(flagName) {
    globalFlagName = flagName;
    if (languageContent[globalFlagName]) {
        // Update header
        document.querySelector('.header-logo').textContent = languageContent[globalFlagName].secretSantaHead;

        // Update placeholders
        document.querySelector('.fname').placeholder = languageContent[globalFlagName].namePlaceholder;
        document.querySelector('#pref1').placeholder = languageContent[globalFlagName].preferencesPlaceholder;
        document.querySelector('#aversion1').placeholder = languageContent[globalFlagName].aversionsPlaceholder;

        // Update button text
        document.querySelector('.add-button').textContent = languageContent[globalFlagName].addButtonText;
        document.querySelector('.randomizer').textContent = languageContent[globalFlagName].randomizeButtonText;
        if(document.querySelector('.error-text')) {
            document.querySelector('.error-text').textContent = languageContent[globalFlagName].errorMessage;
        }
        document.querySelector('.footer-main-text').textContent = languageContent[globalFlagName].footerMainText;
        document.querySelector('.footer-after-main').textContent = languageContent[globalFlagName].footerJoiningFun;
        document.querySelector('.footer-fname').innerHTML = languageContent[globalFlagName].footerName;
        document.querySelector('.footer-pref').innerHTML = languageContent[globalFlagName].footerPreferences;
        document.querySelector('.footer-aversion').innerHTML = languageContent[globalFlagName].footerAversions;
        document.querySelector('.footer-warning').textContent = languageContent[globalFlagName].footerWarning;
        document.querySelector('.footer-finally').textContent = languageContent[globalFlagName].footerFinally;
        document.querySelector('.footer-closing').textContent = languageContent[globalFlagName].footerClosing;

        // ...more updates as needed
    } else {
        console.log("No Flag Selected");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    switchLanguage('USAFlag'); // Set default language
});

// Rest of your code...


const bodyInnerHTML = `
<header>
    <h1 class="header-logo">Secret Santa Generator</h1>
    <div class="flags-container">
        <button class="flag-button" onclick="switchLanguage('BRFlag')"><img src="BRFlag.png" /></button>
        <button class="flag-button" onclick="switchLanguage('USAFlag')"><img src="USAFlag.png" /></button>
    </div>
</header>
<div class="container">
<form class="to-do-form" autocomplete="off">
    <input class="fname" type="text" placeholder="Name" required>
    <p>
        <input class="pref" id="pref1" type="text" placeholder="Preferences" required>
    </p>
    <p>
        <input class="aversion" id="aversion1" type="text" placeholder="Aversions" required>
    </p>
    <button class="add-button">+Add</button>
</form>
<div class="list-container">
    <ul class="to-do-list">
    </ul>
</div>
</div>
<div class="randomizer-container">
<button onclick="mainRandomizer()" class="randomizer">Randomize!</button>
</div>
<div id="result"></div>
<footer>
<p class="footer-main-text">🎅 Secret Santa Helper! 🎁</p>
<p class="footer-after-main">Joining in the fun is as easy as a reindeer's hop! This helper explains what everything does. Lets Get Started! ☃️ </p>
<p class="footer-fname">📛 <strong>Name:</strong> Name a festive friend who's in your gift exchange next they may list <strong>Preferences</strong> or <strong>Aversions</strong>
<p class="footer-pref">🎯 <strong>Preferences:</strong> Names of those you <strong>HOPE TO BUY FOR</strong> separated by a space or comma.</p>
<p class="footer-aversion">🚫 <strong>Aversions:</strong> Names of those you hope to have <strong>SOMEONE ELSE BUY FOR</strong> separate names with spaces or commas.</p>
<p class="footer-warning">Be sure that names in the 'Preferences' and 'Aversions' are spelled right to keep our Christmas elves from getting mixed up!</p>
<p class="footer-finally">Finally, hit 'Randomize' and be glad you don't need to pick your own name out of a hat.</p>
<p class="footer-closing">Merry Christmas and happy gift giving!</p>
</footer>`

document.body.innerHTML = bodyInnerHTML;

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function isbanned(personobj, name) {
    if (personobj.banned.includes(name)) {
        return true;
    }
    return false;
}

function isSelf(name1, name2) {
    if (name1 === name2) {
        return true;
    }
    return false;
}

function getBuyForLink(matchesElement) {
    const encryptedName = encryptName(matchesElement);
    const encodedName = encodeURIComponent(encryptedName);

    // Construct the new URL with the encrypted and encoded parameter
    const currentUrl = window.location.href;
    const newUrl = currentUrl.includes('?') ? currentUrl + '&name=' + encodedName : currentUrl + '?name=' + encodedName;

    return newUrl;
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function mainRandomizer() {
    var namelist = [];
    Object.keys(globalJSON).forEach(key => {
        namelist.push(key);
    });
    if(namelist.length < 3){
        $("#result").empty();

        $("<div/>", {
            "class": "error-message",
            html: `<p class=\"error-text\">${languageContent[globalFlagName].errorMessage}</p>`
        }).appendTo("#result");
        return;
    }

    shuffle(namelist);

    var notcomplete = true;


    var matchesmade = [];
    var preferencelist = [];
    var randBagnum = 0;

    while (notcomplete) {
        var matchers = namelist.slice();
        var matchies = namelist.slice();
        matchesmade.empty;
        preferencelist.empty;

        while (matchers.length > 0) {
            var impossible = true;
            var indicator = true;
            var randmBag = [];
            const currentMatcher = matchers[0];
            const matchiesWithoutMatcher = matchies.slice();
            const index = matchiesWithoutMatcher.indexOf(currentMatcher);
            if (index !== -1) {
                matchiesWithoutMatcher.splice(index, 1);
            }
            preferencelist = (globalJSON[currentMatcher].preferences).slice();
            shuffle(preferencelist);
            while (preferencelist.length > 0 && indicator) {
                if (matchiesWithoutMatcher.includes(preferencelist[0])) {
                    const myind = matchiesWithoutMatcher.indexOf(preferencelist[0]);
                    matchesmade.push([currentMatcher, matchiesWithoutMatcher[myind], false]);
                    matchers.shift();
                    matchiesWithoutMatcher.splice(myind, 1);
                    const matchIndex = matchies.indexOf(preferencelist[0]);
                    matchies.splice(matchIndex, 1);
                    indicator = false;
                }
                else {
                    preferencelist.shift();
                }
            }

            if (preferencelist.length === 0) {
                randmBag.empty;
                for (var i = 0; i < matchiesWithoutMatcher.length; i++) {
                    randmBag.push(i);
                }

                shuffle(randmBag);
                while (impossible && randmBag.length > 0) {

                    randBagnum = randmBag[0];

                    impossible = (isbanned(globalJSON[currentMatcher], matchiesWithoutMatcher[randBagnum])) || isSelf(currentMatcher, matchiesWithoutMatcher[randBagnum]);
                    randmBag.shift();

                }
                matchesmade.push([currentMatcher, matchiesWithoutMatcher[randBagnum], false]);
                matchers.shift();
                const matchIndex = matchies.indexOf(matchiesWithoutMatcher[randBagnum]);
                matchies.splice(matchIndex, 1);
            }
        }

        if (randmBag.length === 0 && matchesmade[matchesmade.length - 1][1]) {
            notcomplete = false;
        } else {
            matchesmade = [];
        }
    }

    var htmlList = []

    for (var i = 0; i < matchesmade.length; i++) {
        const link = getBuyForLink(matchesmade[i][1]);
        htmlList.push(
            `<tr>
                <td><div class="td-styling">${matchesmade[i][0]}</div></td>
                <td><div class="td-styling">${languageContent[globalFlagName].buysFor}</div></td>
                <td>
                    <div class="td-styling"> <a href="${link}" target="_blank">${languageContent[globalFlagName].nameLinkHere}</a>
                    <button onclick="copyToClipboard('${link}')" class="copy-button">
                        <img src="copyIcon.png" alt="Copy" class="copy-icon"/>
                    </button>
                    </div>
                </td>
            </tr>`
        );
    }

    $("#result").empty();

    $("<table/>", {
        "class": "my-new-list",
        html: htmlList.join("")
    }).appendTo("#result");
}

class Document {
    constructor(paragraph) {
        this.paragraph = paragraph;
    }

    getParagraph() {
        return this.paragraph;
    }

    getTermFrequency() {
        let wordVector = {};
        this.getParagraph()
            .split(" ")
            .forEach((word) => {
                if (!Object.keys(wordVector).includes(word)) {
                    wordVector[word] = 1;
                } else {
                    wordVector[word]++;
                }
            });
        return wordVector;
    }

    getLength() {
        let result = 0;
        Object.values(this.getTermFrequency()).forEach((freq) => {
            result += freq * freq;
        });
        return Math.sqrt(result);
    }
}

// IMPLEMENTATION CLASS
class ToDo {
    constructor(paragraph, prefList, aversionList) {
        this.document = new Document(paragraph);
        this.prefList = prefList;
        this.aversionList = aversionList
    }

    getDocument() {
        return this.document;
    }

    getPrefList() {
        return this.prefList;
    }

    getAversionList() {
        return this.aversionList;
    }
}

class ToDoList {
    constructor() {
        this.listAll = [];
    }

    append(todo) {
        this.listAll.push(todo);
    }

    delete(todo) {
        this.listAll = this.listAll.filter((TD) => {
            return (
                TD.getDocument().getParagraph() !== todo.getDocument().getParagraph()
            );
        });
    }

    getList() {
        return this.listAll
    }
}

// OBJECT INSTANTIATION
const List = new ToDoList();

// SELECTION
const toDoForm = document.querySelector(".to-do-form");

const container = document.querySelector(".container");

const firstName = document.querySelector(".fname");
const pref1 = document.querySelector("#pref1");
const aversion1 = document.querySelector("#aversion1");
const toDoButton = document.querySelector(".add-button");

const toDoList = document.querySelector(".to-do-list");


// EVENT LISTENER
toDoButton.addEventListener("click", addToDo);

toDoList.addEventListener("click", deleteToDo);

// EVENT FUNCTION
function clearListElement() {
    while (toDoList.firstChild) {
        toDoList.firstChild.remove();
    }
}

function displayList(L) {
    L.forEach((toDo) => {
        const toDoDiv = document.createElement("div");
        toDoDiv.classList.add("list-item");

        const toDoElement = document.createElement("li");
        toDoElement.classList.add("to-do-content");
        toDoElement.textContent = toDo.getDocument().getParagraph();
        const prefListDiv = document.createElement("div");
        prefListDiv.textContent = languageContent[globalFlagName].preferencesPlaceholder + ": " + toDo.getPrefList();
        const aversionListDiv = document.createElement("div");
        aversionListDiv.textContent = languageContent[globalFlagName].aversionsPlaceholder + ": " + toDo.getAversionList();
        toDoElement.appendChild(prefListDiv);
        toDoElement.appendChild(aversionListDiv);
        toDoDiv.appendChild(toDoElement);

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete-button");
        deleteButton.textContent = "\u2715";
        toDoDiv.appendChild(deleteButton);

        toDoList.appendChild(toDoDiv);
    });
}

function addToDo(event) {
    event.preventDefault();
    let prefList = [];
    let aversionList = [];

     // Split the input value by comma or space and add each item to prefList
     if (pref1.value !== "") {
        prefList = pref1.value.split(/[\s,]+/).map(function(item) {
            return item.trim().toUpperCase(); // Trim whitespace and convert to uppercase
        }).filter(function(item) {
            return item !== ""; // Filter out any empty strings from the array
        });
    }
    
    // Split the input value by comma or space and add each item to aversionList
    if (aversion1.value !== "") {
        aversionList = aversion1.value.split(/[\s,]+/).map(function(item) {
            return item.trim().toUpperCase(); // Trim whitespace and convert to uppercase
        }).filter(function(item) {
            return item !== ""; // Filter out any empty strings from the array
        });
    }

    if (firstName.value !== "") {
        List.append(new ToDo(firstName.value.toUpperCase(), prefList, aversionList));

        var personObj = {}
        personObj["banned"] = aversionList;
        personObj["preferences"] = prefList;
        globalJSON[firstName.value.toUpperCase()] = personObj;


        clearListElement();
        displayList(List.getList());

        firstName.value = "";
        pref1.value = "";
        aversion1.value = "";
    }
}

function deleteToDo(event) {
    event.preventDefault();

    const item = event.target;

    if (item.classList[0] === "delete-button") {
        let currentName = item.parentElement.firstChild.textContent;
        if (currentName.includes("Preferences")) {
            let index = currentName.indexOf("Preferences");
            currentName = currentName.substr(0, index);
        }
        delete globalJSON[currentName];
        List.delete(
            new ToDo(
                currentName
            )
        );

        clearEvent(event);
    }
}


function clearEvent(event) {
    event.preventDefault();

    container.firstChild.remove();
    container.prepend(toDoForm);

    clearListElement();
    displayList(List.getList());
}
