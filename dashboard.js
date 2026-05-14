let subjectsData = [];
let isLocked = false;
let lastResult = null;
let savedStudentId = null;

/* =========================
   PRODUCTION API
========================= */
// Change cette ligne :

// Par celle-ci (pour travailler en local) :
const API = "https://unilife-backend-qgap.onrender.com/api";

/* =========================
   VALIDATIONS
========================= */
function isValidText(text) {
    return /^[a-zA-ZÀ-ÿ0-9\s'-]+$/.test(text);
}

function isPositiveNumber(value) {
    return !isNaN(value) && Number(value) > 0;
}

/* =========================
   THEME SYSTEM
========================= */
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    const themeBtn = document.querySelector(".theme-btn i");
    if (themeBtn) {
        themeBtn.className = theme === "dark" 
            ? "fa-solid fa-sun" 
            : "fa-solid fa-moon";
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? "dark" : "light");
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
}

initTheme();

/* =========================
   AUTH CHECK
========================= */
async function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`${API}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        if (data.user) {
            document.getElementById("userInfo").innerText = data.user.name || "Utilisateur";
        } else {
            logout();
        }
    } catch (err) {
        console.error(err);
        logout();
    }
}

checkAuth();

/* =========================
   LOGOUT
========================= */
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

/* =========================
   GENERATE SUBJECTS
========================= */
function generateSubjects() {
    const total = Number(document.getElementById("totalSubjects").value);
    const container = document.getElementById("subjectsContainer");

    container.innerHTML = "";
    subjectsData = [];
    isLocked = false;
    lastResult = null;
    document.getElementById("saveBtn").style.display = "none";

    if (!isPositiveNumber(total) || total > 20) {
        alert("Veuillez entrer un nombre valide entre 1 et 20");
        return;
    }

    for (let i = 0; i < total; i++) {
        container.innerHTML += `
            <div class="subject-block">
                <input class="subject" type="text" placeholder="Matière / Subject">
                <input class="grade" type="number" placeholder="Note (0-20)" min="0" max="20">
                <input class="coef" type="number" placeholder="Coefficient" min="1">
                <button class="delete-btn" onclick="deleteSubject(this)">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    }
}

/* =========================
   DELETE SUBJECT
========================= */
function deleteSubject(btn) {
    if (isLocked) {
        alert("Modification impossible après calcul");
        return;
    }
    btn.parentElement.remove();
}

/* =========================
   CALCULATE
========================= */
function calculate() {
    if (isLocked) return alert("Résultat déjà calculé");

    const subjects = document.querySelectorAll(".subject");
    const grades = document.querySelectorAll(".grade");
    const coefs = document.querySelectorAll(".coef");

    let total = 0;
    let totalCoef = 0;
    subjectsData = [];

    for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i].value.trim();
        const grade = Number(grades[i].value);
        const coef = Number(coefs[i].value);

        if (!isValidText(subject)) return alert("Nom de matière invalide");
        if (isNaN(grade) || grade < 0 || grade > 20) return alert("Note invalide (0-20)");
        if (!isPositiveNumber(coef)) return alert("Coefficient invalide");

        total += grade * coef;
        totalCoef += coef;

        subjectsData.push({
            nom_matiere: subject,
            note: grade,
            coef: coef
        });

        subjects[i].disabled = true;
        grades[i].disabled = true;
        coefs[i].disabled = true;
    }

    if (totalCoef <= 0) return alert("Coefficient invalide");

    const moyenne = total / totalCoef;
    const mention = moyenne >= 18 ? "Excellent" :
                    moyenne >= 16 ? "Très Bien" :
                    moyenne >= 14 ? "Bien" :
                    moyenne >= 12 ? "Assez Bien" :
                    moyenne >= 10 ? "Passable" : "Échec";

    document.getElementById("result").innerHTML = `
        <div class="result-box">
            <p><i class="fa-solid fa-chart-line"></i> Moyenne : <strong>${moyenne.toFixed(2)}</strong></p>
            <p><i class="fa-solid fa-trophy"></i> Mention : <strong>${mention}</strong></p>
        </div>
    `;

    document.getElementById("saveBtn").style.display = "block";
    isLocked = true;
    lastResult = { moyenne, mention, coef: totalCoef };
}

/* =========================
   RESET
========================= */
function resetAll(preserveSavedStudentId = false) {
    document.getElementById("subjectsContainer").innerHTML = "";
    document.getElementById("result").innerHTML = "";
    document.getElementById("saveBtn").style.display = "none";
    const pdfBtn = document.getElementById("downloadPdfBtn");
    if (pdfBtn && !preserveSavedStudentId) pdfBtn.style.display = "none";
    document.getElementById("className").value = "";
    document.getElementById("studentName").value = "";
    document.getElementById("totalSubjects").value = "";

    subjectsData = [];
    isLocked = false;
    lastResult = null;
    if (!preserveSavedStudentId) savedStudentId = null;
}

/* =========================
   SAVE RESULT
========================= */
async function saveResult() {
    const token = localStorage.getItem("token");
    if (!token) return logout();

    if (!lastResult) return alert("Veuillez d'abord calculer la moyenne");

    const studentName = document.getElementById("studentName").value.trim();
    const className = document.getElementById("className").value.trim();

    if (!isValidText(studentName) || !isValidText(className)) {
        return alert("Nom étudiant ou classe invalide");
    }

    const data = {
        class_name: className,
        student_name: studentName,
        moyenne: lastResult.moyenne,
        mention: lastResult.mention,
        total_coef: lastResult.coef,
        subjects: subjectsData
    };

    try {
        const response = await fetch(`${API}/save`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            const studentId = result.studentId || result.id;
            savedStudentId = studentId || null;
            alert("Bulletin enregistré avec succès !");
            resetAll(true);
            if (savedStudentId) {
                const downloadBtn = document.getElementById("downloadPdfBtn");
                if (downloadBtn) {
                    downloadBtn.style.display = "inline-flex";
                }
            }
        } else {
            alert("❌ " + result.message);
        }
    } catch (err) {
        console.error(err);
        alert("Erreur de connexion au serveur");
    }
}

async function downloadBulletinPDF(studentId) {
    const token = localStorage.getItem("token");
    if (!token) return logout();

    const id = studentId || savedStudentId;
    if (!id) {
        alert("Aucun bulletin disponible pour le téléchargement.");
        return;
    }

    try {
        const response = await fetch(`${API}/student/${id}/pdf`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const data = await response.json().catch(() => null);
            const message = data?.message || "Erreur lors du téléchargement du PDF.";
            throw new Error(message);
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `bulletin-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
        console.error(err);
        alert("Impossible de télécharger le bulletin PDF : " + err.message);
    }
}