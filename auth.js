console.log("AUTH JS LOADED");

/* =========================
   PRODUCTION API
========================= */
const API =
    "https://unilife-backend-qgap.onrender.com/api/auth";

/* =========================
   EMAIL VALIDATION
========================= */
function emailValide(email) {

    const regex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}$/;

    return regex.test(email);
}

/* =========================
   NAME VALIDATION
========================= */
function nomValide(name) {

    const regex =
        /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;

    return regex.test(name);
}

/* =========================
   REGISTER
========================= */
async function register() {

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();

    const registerBtn =
        document.getElementById("registerBtn");

    const registerText =
        document.getElementById("registerText");

    const registerLoader =
        document.getElementById("registerLoader");

    if (!name || !email || !password) {

        alert("Tous les champs sont obligatoires");

        return;
    }

    if (!nomValide(name)) {

        alert("Nom invalide");

        return;
    }

    if (!emailValide(email)) {

        alert("Adresse email invalide");

        return;
    }

    if (password.length < 6) {

        alert("Mot de passe trop court");

        return;
    }

    /* =========================
       START LOADING
    ========================= */

    registerBtn.disabled = true;

    registerText.style.display = "none";

    registerLoader.style.display = "inline-block";

    try {

        const res = await fetch(`${API}/register`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                password
            })
        });

        const data = await res.json();

        alert(data.message);

        if (data.success) {

            window.location.href = "login.html";
        }

    } catch (err) {

        console.log(err);

        alert("Erreur serveur");

    } finally {

        /* =========================
           STOP LOADING
        ========================= */

        registerBtn.disabled = false;

        registerText.style.display = "inline-block";

        registerLoader.style.display = "none";
    }
}

/* =========================
   LOGIN
========================= */
async function login() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value.trim();

    const loginBtn =
        document.getElementById("loginBtn");

    const loginText =
        document.getElementById("loginText");

    const loginLoader =
        document.getElementById("loginLoader");

    if (!email || !password) {

        alert("Tous les champs sont obligatoires");

        return;
    }

    if (!emailValide(email)) {

        alert("Adresse email invalide");

        return;
    }

    /* =========================
       START LOADING
    ========================= */

    loginBtn.disabled = true;

    loginText.style.display = "none";

    loginLoader.style.display = "inline-block";

    try {

        const res = await fetch(`${API}/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await res.json();

        if (data.token) {

            localStorage.setItem(
                "token",
                data.token
            );

            window.location.href = "index.html";

        } else {

            alert(data.message);
        }

    } catch (err) {

        console.log(err);

        alert("Erreur serveur");

    } finally {

        /* =========================
           STOP LOADING
        ========================= */

        loginBtn.disabled = false;

        loginText.style.display = "inline-block";

        loginLoader.style.display = "none";
    }
}
