const xhr = new XMLHttpRequest();

function init() {
    const session = getCookie("session");

    if(session !== "") {
        fetch("/auth/session", {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', },
            body: new URLSearchParams({
                session: session
            })
        })
        .then((resp) => resp.json())
        .then(function(response) {
            if(response.error) {
                deleteCookie("session");
                document.location.href = "/";
            } else if(response.success) {
                document.location.href = "/home";
            }

            return response;
        })
    } else {
        document.getElementById("auth").style.display = "flex";
    }

    xhr.open("GET", "/quote", true);
    xhr.send();
    xhr.onload = () => {
        const data = JSON.parse(xhr.response);
        document.getElementById("quote").innerHTML += "<p>" + data.quote + "</p";
        document.getElementById("quote").innerHTML += "<p id='author'>- " + data.author + "</p";
    }
}