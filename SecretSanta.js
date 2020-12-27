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
    $.getJSON('people.json', function (people) {

        var namelist = [];
        $.each(people, function (name, info) {
            namelist.push(name);
            //namelist.push("<li>" + name + ", " + info.banned + "</li>");
        });

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
                preferencelist = (people[matchers[0]].preferences).slice();
                shuffle(preferencelist);
                while (preferencelist.length > 0 && indicator) {
                    if (matchies.includes(preferencelist[0])) {
                        const myind = matchies.indexOf(preferencelist[0]);
                        matchesmade.push([matchers[0], matchies[myind]]);
                        matchers.shift();
                        matchies.splice(myind, 1);
                        indicator = false;
                    }
                    else {
                        preferencelist.shift();
                    }
                }

                if (preferencelist.length === 0) {
                    randmBag.empty;
                    for(var i = 0; i < matchies.length; i++){
                        randmBag.push(i);
                    }

                    shuffle(randmBag);
                    while (impossible && randmBag.length > 0) {

                        randBagnum = randmBag[0];

                        impossible = (isbanned(people[matchers[0]], matchies[randBagnum])) || isSelf(matchers[0], matchies[randBagnum]);
                        randmBag.shift();

                    }
                    matchesmade.push([matchers[0], matchies[randBagnum]]);
                    matchers.shift();
                    matchies.splice(randBagnum, 1);
                }

            }

            if(randmBag.length === 0){
                notcomplete = false;
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


    });
}


