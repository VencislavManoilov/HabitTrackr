function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if(email && password) {
        fetch("/auth/login", {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', },
            body: new URLSearchParams({
                email: email,
                password: password
            })
        })
        .then((resp) => resp.json())
        .then(function(response) {
            if(response.error) {
                document.getElementById("error").innerHTML = response.error;
            } else if(response.success) {
                setCookie("session", response.session, 356);
                document.location.href = "/home";
            }
            return response;
        })
    }
}