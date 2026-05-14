const API = "https://unilife-backend-qgap.onrender.com/api/auth";

/* =========================
   UTILITAIRES
========================= */
function showLoader(btnId, textId, loaderId) {
    const btn = document.getElementById(btnId);
    const text = document.getElementById(textId);
    const loader = document.getElementById(loaderId);

    if (btn) btn.disabled = true;
    if (text) text.style.display = "none";
    if (loader) loader.style.display = "inline";
}

function hideLoader(btnId, textId, loaderId) {
    const btn = document.getElementById(btnId);
    const text = document.getElementById(textId);
    const loader = document.getElementById(loaderId);

    if (btn) btn.disabled = false;
    if (text) text.style.display = "inline";
    if (loader) loader.style.display = "none";
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* =========================
   FORGOT PASSWORD
========================= */
async function sendResetLink() {
    const email = document.getElementById("email").value.trim();

    if (!email) {
        alert("Veuillez entrer votre email");
        return;
    }

    if (!isValidEmail(email)) {
        alert("Veuillez entrer un email valide");
        return;
    }

    try {
        showLoader("resetBtn", "resetText", "resetLoader");

        const res = await fetch(`${API}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        hideLoader("resetBtn", "resetText", "resetLoader");

        if (data.success) {
            alert("✅ Lien de réinitialisation envoyé ! Vérifiez votre boîte mail (et les spams).");
            // Optionnel : rediriger après succès
            // setTimeout(() => window.location.href = "login.html", 2000);
        } else {
            alert("❌ " + (data.message || "Une erreur est survenue"));
        }

    } catch (err) {
        console.error(err);
        hideLoader("resetBtn", "resetText", "resetLoader");
        alert("Erreur de connexion au serveur");
    }
}

/* =========================
   LOGIN
========================= */
async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Tous les champs sont obligatoires");
        return;
    }

    if (!isValidEmail(email)) {
        alert("Email invalide");
        return;
    }

    try {
        showLoader("loginBtn", "loginText", "loginLoader");

        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        hideLoader("loginBtn", "loginText", "loginLoader");

        if (data.success && data.token) {
            localStorage.setItem("token", data.token);
            window.location.href = "index.html";
        } else {
            alert("❌ " + (data.message || "Email ou mot de passe incorrect"));
        }

    } catch (err) {
        console.error(err);
        hideLoader("loginBtn", "loginText", "loginLoader");
        alert("Erreur de connexion au serveur");
    }
}

/* =========================
   REGISTER
========================= */
async function register() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword")?.value; // Si tu ajoutes ce champ

    if (!name || !email || !password) {
        alert("Tous les champs sont obligatoires");
        return;
    }

    if (!isValidEmail(email)) {
        alert("Veuillez entrer un email valide");
        return;
    }

    if (password.length < 6) {
        alert("Le mot de passe doit contenir au moins 6 caractères");
        return;
    }

    if (confirmPassword && password !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas");
        return;
    }

    try {
        // Si tu as un bouton register avec loader
        const registerBtn = document.getElementById("registerBtn");
        const registerText = document.getElementById("registerText");
        const registerLoader = document.getElementById("registerLoader");

        if (registerBtn) registerBtn.disabled = true;
        if (registerText) registerText.style.display = "none";
        if (registerLoader) registerLoader.style.display = "inline";

        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (registerBtn) registerBtn.disabled = false;
        if (registerText) registerText.style.display = "inline";
        if (registerLoader) registerLoader.style.display = "none";

        if (data.success && data.token) {
            localStorage.setItem("token", data.token);
            alert("✅ Compte créé avec succès !");
            window.location.href = "index.html";
        } else {
            alert("❌ " + (data.message || "Erreur lors de l'inscription"));
        }

    } catch (err) {
        console.error(err);
        // Reset loader en cas d'erreur
        const registerBtn = document.getElementById("registerBtn");
        const registerText = document.getElementById("registerText");
        const registerLoader = document.getElementById("registerLoader");
        
        if (registerBtn) registerBtn.disabled = false;
        if (registerText) registerText.style.display = "inline";
        if (registerLoader) registerLoader.style.display = "none";

        alert("Erreur de connexion au serveur");
    }
}

/* =========================
   NOUVELLE FONCTION : LOGOUT
========================= */
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

/* =========================
   NOUVELLE FONCTION : VÉRIFIER SI CONNECTÉ
========================= */
async function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        const res = await fetch(`${API}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        return data.success;
    } catch (err) {
        console.error(err);
        return false;
    }
}