# 🔧 Dépannage PWA - Microsoft Edge

## Problème : "Installation PWA non disponible sur ce navigateur"

### ✅ Solutions pour Edge

#### 1. **Vérifier les Prérequis**
- ✅ **HTTPS requis** : Edge nécessite HTTPS en production
- ✅ **localhost OK** : `http://localhost:3002` fonctionne pour le développement
- ✅ **Manifest valide** : Vérifiez que `manifest.json` est accessible
- ✅ **Service Worker** : Doit être enregistré correctement

#### 2. **Étapes de Diagnostic**

##### Ouvrir les Outils de Développement (F12)
```
1. Onglet "Console"
   → Chercher les logs de diagnostic PWA
   → "🔍 === DIAGNOSTIC PWA ==="

2. Onglet "Application"
   → "Manifest" : Doit afficher les propriétés
   → "Service Workers" : Doit être "active and running"
```

##### Vérifier la Console
```
✅ Logs attendus :
🔍 === DIAGNOSTIC PWA ===
🔍 URL: http://localhost:3002/app/
🔍 Protocol: http:
🔍 Hostname: localhost
🔍 Service Worker: true
🔍 BeforeInstallPrompt: true
🔍 Manifest link: true
```

#### 3. **Solutions Spécifiques Edge**

##### **Solution A : Mode Incognito**
```
1. Ouvrir Edge en mode Incognito (Ctrl+Shift+N)
2. Accéder à http://localhost:3002/app/
3. Attendre 2-3 secondes
4. Le bouton devrait apparaître
```

##### **Solution B : Vider le Cache**
```
1. Ouvrir les paramètres Edge (Ctrl+Shift+Suppr)
2. Cocher :
   ✅ Cookies et autres données de site
   ✅ Images et fichiers en cache
   ✅ Données de sites web hébergés
3. Supprimer
4. Rafraîchir la page
```

##### **Solution C : Redémarrer Edge**
```
1. Fermer complètement Edge
2. Attendre 10 secondes
3. Relancer Edge
4. Accéder à l'app
```

##### **Solution D : Utiliser Chrome**
```
Si Edge ne fonctionne pas :
1. Ouvrir Chrome
2. Accéder à http://localhost:3002/app/
3. Le bouton devrait apparaître immédiatement
4. Chrome a un meilleur support PWA
```

#### 4. **Vérifications Techniques**

##### Manifest.json
```json
{
  "name": "UNILIFE - Gestion des notes",
  "short_name": "UNILIFE",
  "start_url": "./",
  "display": "standalone",
  "icons": [
    {
      "src": "logo.png.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

##### Service Worker
```javascript
// Vérifier dans DevTools → Application → Service Workers
✅ Status: active and running
✅ URL: service-worker.js
✅ Scope: http://localhost:3002/
```

##### Icône
```bash
# Vérifier que le fichier existe
ls -la logo.png.png
# Doit afficher : -rw-r--r-- [...] logo.png.png
```

#### 5. **Messages d'Erreur Courants**

##### "PWA non supporté sur ce navigateur"
```
Cause : Edge version ancienne
Solution : Mettre à jour Edge
```

##### "beforeinstallprompt non reçu"
```
Cause : Conditions non remplies
Solutions :
- Utiliser HTTPS (ou localhost)
- Rafraîchir la page
- Vider le cache
- Essayer en mode incognito
```

##### "Service worker non enregistré"
```
Cause : Erreur de chargement
Solutions :
- Vérifier la console pour les erreurs
- S'assurer que service-worker.js existe
- Vérifier les permissions
```

#### 6. **Test sur Différents Environnements**

##### Localhost (Développement)
```
✅ http://localhost:3002/app/ → Devrait fonctionner
✅ http://127.0.0.1:3002/app/ → Devrait fonctionner
❌ http://192.168.x.x:3002/app/ → NE fonctionne PAS (IP externe)
```

##### Production (HTTPS)
```
✅ https://mondomaine.com/app/ → Fonctionne
❌ http://mondomaine.com/app/ → NE fonctionne PAS
```

#### 7. **Alternative pour Edge**

Si l'installation PWA ne fonctionne pas sur Edge, les utilisateurs peuvent :

##### **Méthode Alternative 1 : Raccourci Bureau**
```
1. Ouvrir l'app dans Edge
2. Cliquer sur les 3 points (⋮) → "Plus d'outils"
3. "Créer un raccourci"
4. Nommer "UNILIFE"
5. Cocher "Ouvrir comme fenêtre"
6. Créer
```

##### **Méthode Alternative 2 : Épingler à la Barre des Tâches**
```
1. Ouvrir l'app dans Edge
2. Cliquer sur l'icône de l'onglet
3. "Épingler à la barre des tâches"
```

#### 8. **Logs de Debug**

##### Activer les Logs Détaillés
```javascript
// Dans la console Edge (F12)
console.log(navigator.userAgent);
console.log('Service Worker:', 'serviceWorker' in navigator);
console.log('BeforeInstallPrompt:', 'onbeforeinstallprompt' in window);
console.log('HTTPS:', location.protocol === 'https:' || location.hostname === 'localhost');
```

##### Résultats Attendus
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0
Service Worker: true
BeforeInstallPrompt: true
HTTPS: true
```

---

## 🚀 Test Rapide

### 5 Minutes Test
```
1. Ouvrir Edge en mode incognito
2. Aller sur http://localhost:3002/app/
3. Ouvrir F12 → Console
4. Attendre les logs de diagnostic
5. Vérifier si le bouton apparaît
6. Si oui → Tester l'installation
7. Si non → Suivre les solutions ci-dessus
```

### Si Ça Ne Marche Toujours Pas
```
🔄 Essayer Chrome (meilleur support PWA)
📞 Contacter le support technique
📋 Fournir les logs de la console
```

---

**Note :** Edge a parfois des comportements spécifiques avec PWA. Chrome offre généralement une meilleure expérience d'installation PWA.

**Dernière mise à jour :** Mai 2026