var globalJSON = {};

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





function mainRandomizer() {
    var namelist = [];
    Object.keys(globalJSON).forEach(key => {
        namelist.push(key);
    });
    if(namelist.length < 3){
        $("#result").empty();

        $("<div/>", {
            "class": "error-message",
            html: "<p class=\"error-text\">Must have at least 3 names entered to randomize</p>"
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
                    matchesmade.push([currentMatcher, matchiesWithoutMatcher[myind]]);
                    matchers.shift();
                    matchiesWithoutMatcher.splice(myind, 1);
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
                matchesmade.push([currentMatcher, matchiesWithoutMatcher[randBagnum]]);
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
        htmlList.push("<tr><td>" + matchesmade[i][0] + "</td><td> buys for -> </td><td>" + matchesmade[i][1] + "</td></tr>");
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
const pref2 = document.querySelector("#pref2");
const pref3 = document.querySelector("#pref3");
const aversion1 = document.querySelector("#aversion1");
const aversion2 = document.querySelector("#aversion2");
const aversion3 = document.querySelector("#aversion3");
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
        prefListDiv.textContent = "Preferences: " + toDo.getPrefList();
        const aversionListDiv = document.createElement("div");
        aversionListDiv.textContent = "Aversions: " + toDo.getAversionList();
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
    if (pref1.value !== "") {
        prefList.push(pref1.value.toUpperCase())
    }
    if (pref2.value !== "") {
        prefList.push(pref2.value.toUpperCase())
    }
    if (pref3.value !== "") {
        prefList.push(pref3.value.toUpperCase())
    }
    if (aversion1.value !== "") {
        aversionList.push(aversion1.value.toUpperCase())
    }
    if (aversion2.value !== "") {
        aversionList.push(aversion2.value.toUpperCase())
    }
    if (aversion3.value !== "") {
        aversionList.push(aversion3.value.toUpperCase())
    }

    if (firstName.value !== "") {
        List.append(new ToDo(firstName.value.toUpperCase(), prefList, aversionList));

        var personObj = {}
        personObj["banned"] = aversionList;
        personObj["preferences"] = prefList;
        globalJSON[firstName.value.toUpperCase()] = personObj;
        console.log(globalJSON);


        clearListElement();
        displayList(List.getList());

        firstName.value = "";
        pref1.value = "";
        pref2.value = "";
        pref3.value = "";
        aversion1.value = "";
        aversion2.value = "";
        aversion3.value = "";
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
