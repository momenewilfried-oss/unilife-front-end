
let subjectsData = [];
let isLocked = false;
let lastResult = null;
let savedStudentId = null;

/* =========================
   PWA INSTALL PROMPT
========================= */
let deferredPrompt = null;

/* =========================
   PRODUCTION API
========================= */
// Backend Render URL
const API = "https://unilife-backend-qgap.onrender.com";

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
   PWA INSTALL MANAGEMENT
========================= */
function initPWA() {
    const downloadBtn = document.getElementById("downloadAppBtn");
    const downloadHint = document.querySelector(".download-hint");

    console.log("🔍 Initialisation PWA - Navigateur:", navigator.userAgent);
    console.log("🔍 Service Worker disponible:", 'serviceWorker' in navigator);
    console.log("🔍 BeforeInstallPromptEvent disponible:", 'BeforeInstallPromptEvent' in window);

    // TOUJOURS enregistrer le listener, ne pas retourner trop tôt
    // ===== EVENT: beforeinstallprompt =====
    window.addEventListener("beforeinstallprompt", (e) => {
        console.log("✅ Événement beforeinstallprompt reçu!");

        // Empêcher l'affichage automatique du prompt
        e.preventDefault();

        // Stocker l'événement pour plus tard
        deferredPrompt = e;

        // Afficher le bouton d'installation
        if (downloadBtn) {
            downloadBtn.style.display = "inline-flex";
            console.log("✅ Bouton d'installation affiché");
        }

        // Masquer le hint
        if (downloadHint) {
            downloadHint.style.display = "none";
        }

        console.log("🎯 PWA disponible pour installation");
    });

    // ===== EVENT: appinstalled =====
    window.addEventListener("appinstalled", () => {
        console.log("🎉 PWA installée avec succès");

        // Masquer le bouton après installation
        if (downloadBtn) {
            downloadBtn.style.display = "none";
        }

        // Effacer la référence
        deferredPrompt = null;
    });

    // ===== VÉRIFICATION: Mode Standalone =====
    if (window.matchMedia("(display-mode: standalone)").matches) {
        console.log("📱 Application en mode standalone");
        if (downloadBtn) {
            downloadBtn.style.display = "none";
        }
        if (downloadHint) {
            downloadHint.style.display = "none";
        }
    }

    // ===== VÉRIFIER APRÈS DÉLAI =====
    setTimeout(() => {
        // Si après 5 secondes, deferredPrompt n'est toujours pas défini
        // c'est que beforeinstallprompt n'a pas été déclenché
        if (!deferredPrompt && downloadBtn) {
            console.warn("⚠️ Après 5s, beforeinstallprompt n'a pas été reçu");
            console.log("🔍 Vérification diagnostic:");
            console.log("  - Service Worker:", 'serviceWorker' in navigator);
            console.log("  - BeforeInstallPromptEvent:", 'BeforeInstallPromptEvent' in window);
            console.log("  - Manifest tag:", !!document.querySelector('link[rel="manifest"]'));
            console.log("  - HTTPS/localhost:", location.protocol === 'https:' || location.hostname === 'localhost');
            console.log("  - Standalone mode:", window.matchMedia("(display-mode: standalone)").matches);
            
            // Afficher le message d'erreur
            if (downloadHint) {
                downloadHint.innerHTML = `<small>Installation PWA non disponible sur ce navigateur. Utilisez Chrome ou Edge pour une meilleure expérience.</small>`;
                downloadHint.style.display = "block";
            }
            if (downloadBtn) {
                downloadBtn.style.display = "none";
            }
        }
    }, 5000);
}

function downloadApp() {
    const downloadBtn = document.getElementById("downloadAppBtn");

    console.log("🔍 Tentative d'installation PWA");
    console.log("🔍 deferredPrompt disponible:", !!deferredPrompt);
    console.log("🔍 Navigateur:", navigator.userAgent);

    if (!deferredPrompt) {
        // Message plus informatif selon le navigateur
        const isEdge = /Edg/.test(navigator.userAgent);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

        let message = "Installation PWA non disponible sur ce navigateur.";

        if (isEdge) {
            message += "\\n\\n💡 Pour Edge :\\n- Assurez-vous d'utiliser HTTPS (ou localhost)\\n- Vérifiez que le manifest.json est valide\\n- Essayez de rafraîchir la page\\n- Consultez EDGE-PWA-TROUBLESHOOTING.md\\n- Utilisez Chrome pour une meilleure compatibilité";
        } else if (isFirefox) {
            message += "\\n\\n💡 Pour Firefox :\\n- L'installation PWA est limitée\\n- Utilisez Chrome ou Edge pour l'installation";
        } else if (isSafari) {
            message += "\\n\\n💡 Pour Safari :\\n- Utilisez le menu Partager → \"Ajouter à l'écran d'accueil\"\\n- Ou utilisez Chrome pour une meilleure expérience";
        } else {
            message += "\\n\\n💡 Essayez :\\n- Chrome ou Edge pour l'installation PWA\\n- Rafraîchir la page\\n- Vider le cache du navigateur";
        }

        alert(message);
        return;
    }

    // Afficher le prompt d'installation
    console.log("🚀 Affichage du prompt d'installation");
    deferredPrompt.prompt();

    // Attendre la réponse de l'utilisateur
    deferredPrompt.userChoice.then((choiceResult) => {
        console.log("📊 Réponse utilisateur:", choiceResult.outcome);

        if (choiceResult.outcome === "accepted") {
            console.log("✅ Utilisateur a accepté l'installation PWA");
            // Masquer le bouton après l'acceptation
            if (downloadBtn) {
                downloadBtn.style.display = "none";
            }
        } else {
            console.log("❌ Utilisateur a refusé l'installation PWA");
        }
        // Réinitialiser le deferredPrompt
        deferredPrompt = null;
    }).catch((error) => {
        console.error("❌ Erreur lors de l'installation:", error);
        alert("Erreur lors de l'installation. Veuillez réessayer.");
    });
}

// Initialiser PWA au chargement du DOM
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPWA);
} else {
    initPWA();
}

/* =========================
   PWA COMPATIBILITY CHECK
========================= */
function checkPWACompatibility() {
    const results = {
        serviceWorker: 'serviceWorker' in navigator,
        beforeInstallPrompt: 'onbeforeinstallprompt' in window || 'BeforeInstallPromptEvent' in window,
        manifest: !!document.querySelector('link[rel="manifest"]'),
        https: location.protocol === 'https:' || location.hostname === 'localhost',
        standalone: window.matchMedia('(display-mode: standalone)').matches
    };

    console.log("🔍 Diagnostic PWA:", results);

    // Vérifications spécifiques pour Edge
    const isEdge = /Edg/.test(navigator.userAgent);
    if (isEdge) {
        console.log("🔍 Navigateur Edge détecté - vérifications supplémentaires");

        // Edge peut être plus strict sur HTTPS
        if (!results.https) {
            console.warn("⚠️ Edge nécessite HTTPS pour PWA (localhost est OK)");
        }

        // Vérifier que le manifest est accessible
        fetch('manifest.json')
            .then(response => {
                if (!response.ok) {
                    console.error("❌ Manifest.json non accessible:", response.status);
                } else {
                    console.log("✅ Manifest.json accessible");
                }
            })
            .catch(error => {
                console.error("❌ Erreur chargement manifest:", error);
            });
    }

    return results;
}

// Appeler la vérification après l'initialisation
setTimeout(checkPWACompatibility, 1000);

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
