

function isSpouse(personobj, name) {
    if (personobj.spouse === name) {
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
            console.log(name, isSpouse(people[name], "Monica"))
            console.log(name, isSelf(name, "Monica"))
            namelist.push(name);
            //namelist.push("<li>" + name + ", " + info.spouse + "</li>");
        });

        console.log(namelist);

        console.log(people[namelist[0]]);

        var notcomplete = true;

        while (notcomplete) {
            var matchers = namelist.slice();
            var matchies = namelist.slice();
            var matchesmade = [];
            var megaimpossible = false;
            while (matchers.length > 0) {
                var notimpossible = true;
                var rand = 0;
                while (notimpossible && !megaimpossible) {

                    rand = Math.floor(Math.random() * (matchies.length));

                    notimpossible = (isSpouse(people[matchers[0]], matchies[rand])) || isSelf(matchers[0], matchies[rand]);



                    if (matchies <= 2 && notimpossible) {
                        var index = matchies[matchies.length - rand];
                        megaimpossible = (isSpouse(people[matchers[0]], matchies[index])) || isSelf(matchers[0], matchies[index]);
                    }

                    console.log(rand, notimpossible, megaimpossible);
                }
                if (megaimpossible) {
                    break;
                }

                matchesmade.push([matchers[0], matchies[rand]]);
                matchers.shift();
                matchies.splice(rand, 1);


            }
            if (!megaimpossible) {
                notcomplete = false;
            }
        }

        //matchesmade.push([matchnames[0], matchnames[1]]);

        console.log(matchesmade);

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


