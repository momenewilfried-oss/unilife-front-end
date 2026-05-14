# 🛠️ Documentation Technique PWA - UNILIFE

## Vue d'Ensemble Technique

### Architecture PWA

```
┌─────────────────────────────────────────┐
│         Navigation du Navigateur        │
│     (beforeinstallprompt event)        │
└────────────────┬──────────────────────┘
                 │
                 ↓
        ┌────────────────────┐
        │   Détection PWA    │
        │   (initPWA())      │
        └─────────┬──────────┘
                  │
      ┌───────────┴──────────────┐
      │                          │
      ↓                          ↓
┌───────────────┐        ┌──────────────┐
│ Afficher      │        │ Masquer hint │
│ le bouton     │        │ (si dispo)   │
└───────────────┘        └──────────────┘
      │
      │ (Utilisateur clique)
      ↓
┌──────────────────────┐
│  downloadApp()       │
│  - Affiche prompt    │
│  - Gère réponse      │
└──────────────────────┘
      │
      ├─→ Accepté: Installation + Masque bouton
      └─→ Refusé: Log + Réinitialise state
```

---

## 1. Code JavaScript Détaillé (dashboard.js)

### Variable Globale

```javascript
/* Variable stockée au niveau global pour gérer le prompt */
let deferredPrompt = null;
```

**Pourquoi?**
- Persiste entre appels de fonction
- Accessible au moment du clic utilisateur
- Réinitialisée après utilisation (évite memory leaks)

---

### Fonction initPWA()

```javascript
function initPWA() {
    // Récupérer les éléments du DOM
    const downloadBtn = document.getElementById("downloadAppBtn");
    const downloadHint = document.querySelector(".download-hint");

    // ===== EVENT: beforeinstallprompt =====
    window.addEventListener("beforeinstallprompt", (e) => {
        // 1. Empêcher le prompt automatique du navigateur
        e.preventDefault();
        
        // 2. Stocker l'événement pour plus tard
        deferredPrompt = e;
        
        // 3. Afficher le bouton d'installation
        if (downloadBtn) {
            downloadBtn.style.display = "inline-flex";
            // inline-flex: Pour que le bouton prenne la place qu'il faut
            // et aligne les enfants correctement (icône + texte)
        }
        
        // 4. Masquer le hint (conseil d'installation)
        if (downloadHint) {
            downloadHint.style.display = "none";
        }
        
        // 5. Log pour debug
        console.log(\"PWA disponible pour installation\");
    });

    // ===== EVENT: appinstalled =====
    window.addEventListener(\"appinstalled\", () => {
        console.log(\"PWA installée avec succès\");
        
        // Masquer le bouton après installation réussie
        if (downloadBtn) {
            downloadBtn.style.display = \"none\";
        }
        
        // Nettoyer la référence
        deferredPrompt = null;
    });

    // ===== VÉRIFICATION: Mode Standalone =====
    if (window.matchMedia(\"(display-mode: standalone)\").matches) {
        // L'app est déjà en mode standalone
        // (installée ou lancée depuis l'écran d'accueil)
        
        if (downloadBtn) {
            downloadBtn.style.display = \"none\";
        }
        if (downloadHint) {
            downloadHint.style.display = \"none\";
        }
        console.log(\"Application en mode standalone\");
    }
}
```

**Points Clés:**
- `beforeinstallprompt`: Déclenché quand le navigateur détecte une PWA
- `preventDefault()`: Empêche l'affichage auto du prompt (on contrôle quand l'afficher)
- `deferredPrompt`: Stocke l'événement pour appel ultérieur
- `display: inline-flex`: Important pour l'alignement du bouton
- `appinstalled`: Confirme l'installation réussie
- `display-mode: standalone`: Détecte si l'app est déjà installée

---

### Fonction downloadApp()

```javascript
function downloadApp() {
    // Récupérer le bouton
    const downloadBtn = document.getElementById(\"downloadAppBtn\");
    
    // ===== VÉRIFICATION: Prompt disponible? =====
    if (!deferredPrompt) {
        alert(\"Installation PWA non disponible sur ce navigateur.\");
        return;
    }

    // ===== ACTION: Afficher le Prompt =====
    deferredPrompt.prompt();
    // Le prompt natif du navigateur s'affiche ici
    // Utilisateur voit: \"Installer l'app UNILIFE?\" avec boutons

    // ===== ATTENDRE: Réponse utilisateur =====
    deferredPrompt.userChoice.then((choiceResult) => {
        // choiceResult = { outcome: 'accepted' | 'dismissed' }
        
        if (choiceResult.outcome === \"accepted\") {
            console.log(\"Utilisateur a accepté l'installation PWA\");
            
            // Masquer le bouton (installation en cours)
            if (downloadBtn) {
                downloadBtn.style.display = \"none\";
            }
            // Note: L'événement 'appinstalled' se déclenche ensuite
            
        } else {
            console.log(\"Utilisateur a refusé l'installation PWA\");
            // Le bouton reste visible pour une future tentative
        }
        
        // ===== CLEANUP: Réinitialiser le prompt =====
        deferredPrompt = null;
        // Important: Sinon on peut avoir un erreur à la prochaine tentative
    });
}
```

**Flux Utilisateur:**
```
Clic → prompt() → Utilisateur voit popup → Accepte/Refuse
                     ↓
              Installation/Refus
                     ↓
              deferredPrompt = null
```

---

### Initialisation au Chargement

```javascript
// ===== SOLUTION: Initialiser dès que possible =====
if (document.readyState === \"loading\") {
    // DOM pas encore chargé
    document.addEventListener(\"DOMContentLoaded\", initPWA);
} else {
    // DOM déjà chargé (script chargé tard)
    initPWA();
}
```

**Pourquoi ce check?**
- Si `dashboard.js` est chargé avec defer, le DOM est peut-être chargé
- Si chargé normalement, le DOM n'est pas encore chargé
- On s'assure que `initPWA()` s'exécute au bon moment

---

## 2. HTML Structure

### Bouton d'Installation

```html
<button
    id=\"downloadAppBtn\"
    class=\"download-app-btn\"
    onclick=\"downloadApp()\"
    title=\"Installer l'application sur votre appareil\"
    style=\"display: none;\"
>
    <i class=\"fa-solid fa-download\"></i>
    Installer l'application
</button>
```

**Points Importants:**
- `id=\"downloadAppBtn\"`: Permet la sélection en JavaScript
- `style=\"display: none\"`: Masqué par défaut (affichage contrôlé)
- `onclick=\"downloadApp()\"`: Appelé directement (ou addEventListener)
- `fa-solid fa-download`: Icône Font Awesome

### Service Worker Registration

```html
<script>
    // Vérifie que le navigateur supporte les Service Workers
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('service-worker.js')
                .then(function (registration) {
                    console.log('✅ Service worker enregistré:', registration.scope);
                    
                    // Gestion des mises à jour
                    registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // Nouvelle version disponible
                                console.log('⚡ Nouvelle version disponible');
                                // Optionnel: Afficher une notification
                            }
                        });
                    });
                })
                .catch(function (error) {
                    console.error('❌ Erreur enregistrement SW:', error);
                });
        });
    }
</script>
```

**Événements:**
- `load`: Attend que la page soit complètement chargée
- `updatefound`: Nouvelle version du SW disponible
- `statechange`: Changement d'état du nouveau worker

---

## 3. CSS Détaillé

### Bouton Download

```css
.download-app-btn {
    display: inline-flex !important;      /* Force display même si style inline dit none */
    align-items: center;                  /* Centre verticalement l'icône et le texte */
    gap: 8px;                             /* Espace entre icône et texte */
    padding: 10px 16px;                   /* Rembourrage */
    
    /* Gradient transparent pour effet glass */
    background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
    color: white;
    border: 1px solid rgba(255,255,255,0.3);
    
    border-radius: 20px;                  /* Très arrondi (pill-shaped) */
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    
    transition: all 0.3s ease;            /* Animation fluide */
    white-space: nowrap;                  /* Évite le wrapping du texte */
}

.download-app-btn:hover {
    background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.2));
    border-color: rgba(255,255,255,0.5);
    transform: translateY(-1px);          /* Remonte légèrement */
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

.download-app-btn:active {
    transform: translateY(0);             /* Revient à position normale au clic */
}

.download-app-btn i {
    font-size: 16px;                      /* Icône légèrement plus grande */
}
```

### Hint (Info Text)

```css
.download-hint {
    position: absolute;                   /* Se positionne par rapport au parent */
    top: 70px;                            /* En dessous du header */
    right: 15px;                          /* À droite */
    
    background: rgba(0,0,0,0.8);          /* Noir semi-transparent */
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    
    font-size: 12px;
    max-width: 250px;
    word-wrap: break-word;
    
    pointer-events: none;                 /* N'interfère pas avec les clics */
    z-index: 10;                          /* Au-dessus du contenu normal */
    
    animation: fadeInDown 0.3s ease;      /* Animation d'entrée */
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

### Responsive Design

```css
@media (max-width: 768px) {
    .download-hint {
        display: none !important;         /* Masquer le hint sur mobile */
    }

    .download-app-btn {
        padding: 8px 12px;                /* Padding plus petit */
        font-size: 13px;                  /* Texte plus petit */
    }
    
    .download-app-btn i {
        font-size: 14px;                  /* Icône plus petite */
    }
}
```

---

## 4. Manifest.json Configuration

### Structure Complète

```json
{
  \"name\": \"UNILIFE - Gestion des notes\",
  \"short_name\": \"UNILIFE\",
  \"description\": \"Plateforme universitaire de gestion des notes et bulletins PDF\",
  
  \"start_url\": \"./\",
  \"display\": \"standalone\",
  \"orientation\": \"portrait-primary\",
  
  \"background_color\": \"#ffffff\",
  \"theme_color\": \"#2563eb\",
  \"scope\": \"./\",
  
  \"icons\": [
    {
      \"src\": \"logo.png.png\",
      \"sizes\": \"192x192\",
      \"type\": \"image/png\",
      \"purpose\": \"any\"
    },
    {
      \"src\": \"logo.png.png\",
      \"sizes\": \"512x512\",
      \"type\": \"image/png\",
      \"purpose\": \"any\"
    },
    {
      \"src\": \"logo.png.png\",
      \"sizes\": \"192x192\",
      \"type\": \"image/png\",
      \"purpose\": \"maskable\"
    },
    {
      \"src\": \"logo.png.png\",
      \"sizes\": \"512x512\",
      \"type\": \"image/png\",
      \"purpose\": \"maskable\"
    }
  ],
  
  \"categories\": [\"education\", \"productivity\"],
  
  \"screenshots\": [
    {
      \"src\": \"logo.png.png\",
      \"sizes\": \"540x720\",
      \"type\": \"image/png\",
      \"form_factor\": \"narrow\"
    },
    {
      \"src\": \"logo.png.png\",
      \"sizes\": \"1280x720\",
      \"type\": \"image/png\",
      \"form_factor\": \"wide\"
    }
  ],
  
  \"shortcuts\": [
    {
      \"name\": \"Calculer les notes\",
      \"short_name\": \"Calculer\",
      \"description\": \"Accès rapide au calcul des notes\",
      \"url\": \"./\",
      \"icons\": [{
        \"src\": \"logo.png.png\",
        \"sizes\": \"96x96\",
        \"type\": \"image/png\"
      }]
    }
  ]
}
```

### Explications des Propriétés

| Propriété | Valeur | Explication |
|-----------|--------|-------------|
| `name` | UNILIFE... | Nom complet de l'app (Google Play) |
| `short_name` | UNILIFE | Nom court (écran d'accueil) |
| `start_url` | ./ | URL de démarrage |
| `display` | standalone | Mode fullscreen sans barre navigateur |
| `orientation` | portrait-primary | Portrait par défaut |
| `theme_color` | #2563eb | Couleur de la barre d'état (Android) |
| `scope` | ./ | Périmètre de la PWA |
| `purpose: maskable` | Icons adaptés aux formes | Voir [Maskable Icons](https://web.dev/maskable-icon/) |
| `categories` | education | Pour app stores |
| `screenshots` | Images 540x720 + 1280x720 | Galerie d'app store |
| `shortcuts` | Actions rapides | Menu long-press sur Android |

---

## 5. Service Worker (Caching Strategy)

### Cache First Strategy

```javascript
// Nom du cache (version 2)
const CACHE_NAME = \"unilife-v2\";

// Fichiers à mettre en cache
const urlsToCache = [
  \"/\",
  \"/index.html\",
  \"/login.html\",
  \"/register.html\",
  \"/forgot-password.html\",
  \"/reset-password.html\",
  \"/style.css\",
  \"/style2.css\",
  \"/dashboard.js\",
  \"/auth.js\",
  \"/manifest.json\",
  \"/logo.png.png\",
  \"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css\",
  \"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css.map\"
];

// INSTALL: Cache tous les fichiers
self.addEventListener(\"install\", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((err) => {
        console.warn(\"Cache partiel (ressources externes):\", err);
        // Continuer même si certains fichiers échouent
        return cache.addAll(
          urlsToCache.filter((url) => !url.includes(\"https://\"))
        );
      });
    })
  );
  self.skipWaiting();
});

// ACTIVATE: Nettoyer les anciens caches
self.addEventListener(\"activate\", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Supprimer les vieilles versions
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH: Cache first, network fallback
self.addEventListener(\"fetch\", (event) => {
  if (event.request.method !== \"GET\") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // 1. Chercher dans le cache
      if (response) {
        return response;
      }

      // 2. Si pas en cache, récupérer du réseau
      return fetch(event.request)
        .then((response) => {
          // Ne cacher que les réponses valides
          if (!response || response.status !== 200) {
            return response;
          }

          // Cloner et mettre en cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Offline: Afficher une page d'erreur simple
          return new Response(
            \"<h1>Mode hors ligne</h1><p>Vérifiez votre connexion</p>\",
            { headers: { \"Content-Type\": \"text/html; charset=utf-8\" } }
          );
        });
    })
  );
});
```

### Flow de la Stratégie

```
Request → Cache lookup → Trouvé? → Retourner du cache
                             ↓ Non
                          Fetch réseau
                             ↓
                        Réponse valide?
                        ↙          ↘
                      Oui          Non
                       ↓             ↓
                   Mettre      Retourner
                   en cache    directement
                       ↓             ↓
                    Retourner   (pas de cache)
```

---

## 6. Événements et État

### Timeline d'Événements

```
1. Page charge
   ↓
2. beforeinstallprompt (event)
   → initPWA() écoute
   → deferredPrompt stocké
   → Bouton affiché
   ↓
3. Utilisateur clique le bouton
   → downloadApp()
   → deferredPrompt.prompt()
   → Popup d'installation
   ↓
4a. Accepte
   → Installation
   → appinstalled (event)
   → Bouton masqué
   
4b. Refuse
   → Log \"Refused\"
   → Bouton reste visible
   ↓
5. App installée
   → display-mode: standalone
   → Prochain lancement: mode fullscreen
```

### État du deferredPrompt

```javascript
// Avant beforeinstallprompt
deferredPrompt = null;

// Après beforeinstallprompt
deferredPrompt = Event { /* beforeinstallprompt */ };

// Après userChoice
deferredPrompt = null;  // Réinitialisé
```

---

## 7. Débogage et Outils

### Chrome DevTools

```
1. Onglet \"Application\"
   → Manifest: Voir la configuration PWA
   → Service Workers: État du worker (active, stopping, etc)
   → Cache Storage: Voir le cache unilife-v2

2. Onglet \"Console\"
   → Logs: \"PWA disponible pour installation\"
   → Erreurs: Problèmes PWA

3. Simuler offline:
   → Network tab → Offline checkbox
   → Chercher: Application fonctionne?
```

### Lighthouse Audit

```
Chrome DevTools → Lighthouse → PWA Audit

Checklist complète:
✅ HTTPS ou localhost
✅ manifest.json valide
✅ Icons 192x192 + 512x512
✅ Service worker enregistré
✅ Meta viewport
✅ Responsive design
```

### Logging Personnalisé

```javascript
// Dans dashboard.js
console.log(\"PWA disponible pour installation\");
console.log(\"Utilisateur a accepté l'installation PWA\");
console.log(\"Application en mode standalone\");

// Dans index.html
console.log(\"✅ Service worker enregistré:\", registration.scope);
console.log(\"⚡ Nouvelle version de l'app disponible\");
```

---

## 8. Cas Limites et Gestion d'Erreurs

### Erreurs Possibles

1. **beforeinstallprompt jamais déclenché**
   - Cause: HTTPS non configuré
   - Solution: Utiliser HTTPS en production, localhost en dev

2. **\"Cannot read property 'prompt' of null\"**
   - Cause: `deferredPrompt` null (pas d'événement reçu)
   - Solution: Check console pour logs PWA

3. **Service Worker ne s'enregistre pas**
   - Cause: Pas de HTTPS
   - Solution: Configurer HTTPS ou localhost

4. **Cache ne fonctionne pas**
   - Cause: Même site à différentes URL
   - Solution: Accéder via http://localhost ou https://

### Gestion Défensive

```javascript
// Toujours vérifier l'existence des éléments
const downloadBtn = document.getElementById(\"downloadAppBtn\");
if (downloadBtn) {
    downloadBtn.style.display = \"inline-flex\";
}

// Vérifier deferredPrompt avant utilisation
if (!deferredPrompt) {
    alert(\"Installation non disponible\");
    return;
}

// Vérifier le support du navigateur
if ('serviceWorker' in navigator) {
    // Enregistrer SW
}
```

---

## 9. Performance et Optimisation

### Tailles de Fichiers

| Fichier | Taille Estimée |
|---------|---|
| dashboard.js | +2KB (code PWA) |
| manifest.json | <2KB |
| service-worker.js | ~3KB |
| CSS (bouton) | +1KB |

**Total overhead:** ~6KB (négligeable)

### Stratégies de Caching

```javascript
// Fichiers statiques: Cache toujours
// HTML, CSS, JS, Images

// Fichiers dynamiques: Network avec fallback
// API calls, données utilisateur

// Ressources externes: Cache avec éloigner
// CDN, images, fonts
```

---

## 10. Mise à Jour et Maintenance

### Mise à Jour PWA

```javascript
// Quand modifier service-worker.js:
// 1. Incrémenter CACHE_NAME
const CACHE_NAME = \"unilife-v3\";  // v2 → v3

// 2. Ajouter new resources à urlsToCache
const urlsToCache = [
  // ... existing
  \"/new-file.js\",
];

// 3. L'ancien cache sera nettoyé automatiquement
```

### Nettoyage du Cache

```javascript
// Dans la console:
caches.keys().then(names => {
    names.forEach(name => {
        console.log(\"Cache:\", name);
        caches.delete(name);  // Supprimer un cache
    });
});
```

---

## Résumé Technique

✅ **Variables:** `deferredPrompt` stocke l'événement  
✅ **Événements:** `beforeinstallprompt`, `appinstalled`, `updatefound`  
✅ **DOM:** Bouton caché par défaut, affiché via JS  
✅ **CSS:** Gradient + transitions + responsive  
✅ **Manifest:** Config complète avec icons + shortcuts  
✅ **Service Worker:** Cache-first strategy  
✅ **Erreurs:** Gestion défensive et logging

---

**Créé:** Mai 2026  
**Version:** Technical Spec v1.0
