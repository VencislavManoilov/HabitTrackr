function signin() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if(name && email && password) {
        fetch("/auth/signin", {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', },
            body: new URLSearchParams({
                name: name,
                email: email,
                password: password
            })
        })
        .then((resp) => resp.json())
        .then(function(response) {
            if(response.error) {
                document.getElementById("error").innerHTML = response.error;
            } else if(response.success) {
                document.location.href = "./login.html";
            }
            return response;
        })
    }
}