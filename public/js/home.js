const xhr = new XMLHttpRequest();
let user = {};
let size = [];

function init() {
    xhr.open("GET", "/user", true);
    xhr.send();
    xhr.onload = () => {
        if(xhr.status === 200) {
            user = JSON.parse(xhr.response);
            formData(user);
        } else if(xhr.status === 400 || xhr.response.error) {
            let error = document.getElementById("error");
            error.style.display = "inline";
            error.innerHTML = xhr.response.error;
        }

        xhr.open("GET", "/quote", true);
        xhr.send();
        xhr.onload = () => {
            const data = JSON.parse(xhr.response);
            document.getElementById("quote").innerHTML += "<p>" + data.quote + "</p";
            document.getElementById("quote").innerHTML += "<p id='author'>- " + data.author + "</p";
        }
    }

    preset();
}

function formData(data) {
    document.getElementById("welcome").innerHTML = "Здравей, <span>" + data.name + "</span>";
    
    document.getElementById("habits").innerHTML = "";
    if (data.habits.length > 0) {
        let daysDiv = document.createElement("div");
        daysDiv.id = "days";
        document.getElementById("habits").appendChild(daysDiv);

        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 7);
        for (let i = 0; i < 7; i++) {
            let dayElement = document.createElement("span");
            dayElement.textContent = currentDate.getDate();
            document.getElementById("days").appendChild(dayElement);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    checkboxes = {};

    for(let i = 0; i < data.habits.length; i++) {
        let days = "", num = 0, addUn = "";

        size.push({id: data.habits[i].id, big: false});

        const habitDiv = document.createElement('div');
        habitDiv.classList.add('habit');
        habitDiv.id = data.habits[i].id;
        habitDiv.onclick = () => {expand(data.habits[i].id)};
        
        const textDiv = document.createElement('div');
        textDiv.classList.add('text');

        const checkboxInput = document.createElement('input');
        checkboxInput.type = 'checkbox';
        checkboxInput.id = data.habits[i].id;
        checkboxInput.checked = data.habits[i].check;
        textDiv.appendChild(checkboxInput);
        
        const textSpan = document.createElement('a');
        textSpan.textContent = data.habits[i].text;
        // textSpan.href = "/open?id=" + data.habits[i].id;
        textDiv.appendChild(textSpan);

        habitDiv.appendChild(textDiv);

        const daysDiv = document.createElement('div');
        daysDiv.classList.add('days');

        for(let j = 0; j < 7; j++) {
            let date = new Date(`${new Date().getMonth() + 1}/${new Date().getDate() - 7 + j}/${new Date().getFullYear()}`);
            let count = 0;
            for(let k = 0; k < data.habits[i].graph.length; k++) {
                if(date.getDate() == new Date(data.habits[i].graph[k].day).getDate() && date.getMonth() == new Date(data.habits[i].graph[k].day).getMonth()) {
                    days += data.habits[i].graph[k].check ? "<span class='yes'>✔</span>" : "<span class='no'>✘</span>";
                    count++;
                    break;
                }
            }

            if(count == 0) {
                days += "<span class='idk'>-</span>";
            }
        }

        daysDiv.innerHTML = days;

        habitDiv.appendChild(daysDiv);
        document.getElementById("habits").appendChild(habitDiv);

        checkboxes[data.habits[i].id] = checkboxInput;
        addEventListenerToCheckbox(data.habits[i].id);
    }
}

let checkboxes = {};

function addEventListenerToCheckbox(id) {
    checkboxes[id].addEventListener("input", () => {
        if(checkboxes[id].checked) {
            check(id);
        } else {
            uncheck(id);
        }
    });
}

function expand(id) {
    expandHabit(id, !size.find(h => h.id === id).big, user.habits.find(h => h.id === id));
}

function expandHabit(id, big, data) {
    if(big) {
        size.find(h => h.id === id).big = true;

        let currentDate = new Date();
        let firstDayOfTheMonth = new Date((currentDate.getMonth() + 1) + "/1/" + currentDate.getFullYear());
        let lastDayOfTheMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        document.getElementById("days").innerHTML = "<span>П</span><span>В</span><span>С</span><span>Ч</span><span>П</span><span>С</span><span>Н</span>"

        document.getElementById(id).classList = ["habit-big"];
        document.getElementById(id).firstChild.classList = ["text-big"];
        document.getElementById(id).lastChild.classList = ["days-big"];
        document.getElementById("days").id = "days-big";

        let percent = document.createElement("p");
        percent.innerText = "Успеваемост: " + Math.floor((data.streak / data.goal) * 1000)/10 + "%";
        // percent.innerText = "Успеваемост: 46.6%";
        percent.classList.add("percent");
        document.getElementById(id).firstChild.appendChild(percent);

        let deleteButton = document.createElement("button");
        deleteButton.classList.add("delete");
        deleteButton.innerHTML = "<i class='fa fa-trash-o'></i>";
        deleteButton.onclick = () => {deleteHabit(id)};
        document.getElementById(id).firstChild.appendChild(deleteButton);

        let graph = document.getElementById(id).lastChild;
        graph.innerHTML = "";
        
        for(let i = firstDayOfTheMonth.getDay() - 1; i > 0 ; i--) {
            let daysElement = document.createElement("div");
            daysElement.classList.add("day-big");
            daysElement.classList.add("lastMonth");
            let date = new Date().setDate(firstDayOfTheMonth.getDate() - i);
            daysElement.innerHTML = "<p>" + new Date(currentDate.getFullYear(), currentDate.getMonth(), firstDayOfTheMonth.getDate() - i).getDate() + "</p>";
            graph.appendChild(daysElement);
        }

        for(let i = 0; i < currentDate.getDate(); i++) {
            let daysElement = document.createElement("div");
            daysElement.classList.add("day-big");
            
            let date = new Date(currentDate.getFullYear(), currentDate.getMonth(), firstDayOfTheMonth.getDate() + i);

            for(let j = 0; j < data.graph.length; j++) {
                if(date.getDate() == new Date(data.graph[j].day).getDate() && date.getMonth() == new Date(data.graph[j].day).getMonth()) {
                    daysElement.classList.add(data.graph[j].check ? "done" : "not-done");
                    j = data.graph.length;
                }
            }

            daysElement.innerHTML = "<p>" + date.getDate() + "</p>";
            graph.appendChild(daysElement);
        }

        for(let i = 1; i <= lastDayOfTheMonth.getDate() - currentDate.getDate(); i++) {
            let daysElement = document.createElement("div");
            daysElement.classList.add("day-big");
            daysElement.classList.add("futureThisMonth");
            daysElement.innerHTML = "<p>" + new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + i).getDate() + "</p>";
            graph.appendChild(daysElement);
        }

        for(let i = 1; i < 8 - lastDayOfTheMonth.getDay(); i++) {
            let daysElement = document.createElement("div");
            daysElement.classList.add("day-big");
            daysElement.classList.add("nextMonth");
            let date = new Date().setDate(lastDayOfTheMonth.getDate() + i);
            daysElement.innerHTML = "<p>" + new Date(currentDate.getFullYear(), currentDate.getMonth(), lastDayOfTheMonth.getDate() + i).getDate() + "</p>";
            graph.appendChild(daysElement);
        }
    } else {
        size.find(h => h.id === id).big = false;

        document.getElementById(id).classList = ["habit"];
        document.getElementById(id).firstChild.classList = ["text"];
        document.getElementById(id).lastChild.classList = ["days"];
        document.getElementById("days-big").id = "days";

        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 7);
        document.getElementById("days").innerHTML = "";
        for(let i = 0; i < 7; i++) {
            let dayElement = document.createElement("span");
            dayElement.textContent = currentDate.getDate();
            document.getElementById("days").appendChild(dayElement);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        let days = "";
        for(let j = 0; j < 7; j++) {
            let date = new Date(`${new Date().getMonth() + 1}/${new Date().getDate() - 7 + j}/${new Date().getFullYear()}`);
            let count = 0;
            for(let k = 0; k < data.graph.length; k++) {
                if(date.getDate() == new Date(data.graph[k].day).getDate() && date.getMonth() == new Date(data.graph[k].day).getMonth()) {
                    days += data.graph[k].check ? "<span class='yes'>✔</span>" : "<span class='no'>✘</span>";
                    count++;
                    break;
                }
            }

            if(count == 0) {
                days += "<span class='idk'>-</span>";
            }
        }
        
        document.getElementById(id).lastChild.innerHTML = days;
        document.getElementById(id).firstChild.removeChild(document.getElementById(id).firstChild.lastChild);
        document.getElementById(id).firstChild.removeChild(document.getElementById(id).firstChild.lastChild);
    }
}

function addHabit() {
    const text = document.getElementById("habit-text").value;
    const goal = parseInt(document.getElementById("goal").value);
    
    if(text && goal) {
        fetch("/habit/create", {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', },
            body: new URLSearchParams({
                id: user.id,
                text: text,
                when: 1,
                goal: goal
            })
        })
        .then((resp) => resp.json())
        .then(function(response) {
            if(response.error) {
                document.getElementById("error").innerHTML = response.error;
            } else {
                user.habits = response;

                document.getElementById("habit-text").value = "";

                formData(user);
            }
            return response;
        })
    }
}

function check(id) {
    fetch("/habit/check", {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', },
        body: new URLSearchParams({
            id: user.id,
            habitId: id,
        })
    })
    .then((resp) => resp.json())
    .then(function(response) {
        if(response.error) {
            document.getElementById("error").innerHTML = response.error;
        } else {
            user.habits = response;
        }
        return response;
    })
}

function uncheck(id) {
    fetch("/habit/uncheck", {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', },
        body: new URLSearchParams({
            id: user.id,
            habitId: id,
        })
    })
    .then((resp) => resp.json())
    .then(function(response) {
        if(response.error) {
            document.getElementById("error").innerHTML = response.error;
        } else {
            user.habits = response;
            formData(user);
        }
        return response;
    })
}

function deleteHabit(id) {
    fetch("/habit/delete", {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', },
        body: new URLSearchParams({
            id: user.id,
            habitId: id,
        })
    })
    .then((resp) => resp.json())
    .then(function(response) {
        if(response.error) {
            let error = document.getElementById("error");
            error.style.display = "inline";
            error.innerHTML = response.error;
        } else {
            user.habits = response;
            formData(user);
        }
        return response;
    })
}

function logout() {
    xhr.open("GET", "/auth/logout");
    xhr.send();
    xhr.onload = () => {
        const response = JSON.parse(xhr.response);

        if(response.success) {
            deleteCookie("session");
            document.location.href = "/";
        }
    }
}

function preset() {
    const habits = [
        {bad: "Успиване", good: ["Ставане по-рано"]},
        {bad: "Мързелуване", good: ["Спорт", "Разходки", "Каране на колело"]},
        {bad: "Използване на телефон", good: ["Четене на книга", "Разходка", "Разговор/виждане с познати"]},
        {bad: "Неконтролируемо харчене", good: ["Ненадвишаване бюджета за деня"]},
        {bad: "Липса на задължения", good: ["Изготвяне на план за деня", "Изпълнение на плана"]},
        {bad: "Лоша комуникация", good: ["Повече усмихване", "Повече смеене", "Повече общуване"]},
    ];

    const presetObj = document.getElementById("preset");
    presetObj.innerHTML += "<p>Избери и замени:</p>";

    for(let i = 0; i < habits.length; i++) {
        presetObj.innerHTML += "<p class='bad'>" + habits[i].bad + ":</p>";
        for(let j = 0; j < habits[i].good.length; j++) {
            presetObj.innerHTML += `<button class='good' onclick='setHabitTextValue("${habits[i].good[j]}")'>` + habits[i].good[j] + "</button>";
        }
    }
}

function setHabitTextValue(text) {
    document.getElementById("habit-text").value = text;
}