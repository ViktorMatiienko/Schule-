# Bridge v4 Launch Kit

Bridge v4 ist eine cloud-ready Web-App für Konfliktklärung, Mediation, Terminbuchung und Rollensteuerung in Schulen und Organisationen.

## Standard-Logins im lokalen Modus
- admin@example.com / ChangeMe123!
- teacher@example.com / Teacher123!
- mediator@example.com / Mediator123!

## Was in v4 enthalten ist
- öffentliche Startseite mit Nutzenargumentation
- Terminbuchung
- Workspace mit Rollen: admin, teacher, mediator
- Fallstatus, Prioritäten, Verantwortliche, Notizen, Verlauf
- Team Board + lokales Anlegen neuer Rollen
- Kalenderübersicht
- Galerie
- PDF-Export
- PWA Installierbarkeit
- Firebase-ready Struktur

## Schnellstart lokal
1. Archiv entpacken.
2. Dateien auf GitHub Pages, Netlify oder Vercel hochladen oder lokal über einen kleinen Webserver öffnen.
3. Mit einem Standardkonto anmelden.

## Live-Betrieb mit Firebase – Schritt für Schritt

### 1) Firebase Projekt erstellen
- Firebase Console öffnen.
- **Projekt hinzufügen** wählen.
- Ein neues Projekt erstellen, z. B. `bridge-school`.

### 2) Web-App registrieren
- Im Projekt auf **</> Web** klicken.
- Einen App-Namen vergeben.
- Die Konfigurationsdaten kopieren.

### 3) Authentication aktivieren
- **Authentication** → **Sign-in method**.
- **E-Mail/Passwort** aktivieren.
- Konten für Admin, Lehrkraft und Mediator erstellen.

### 4) Firestore aktivieren
- **Firestore Database** → **Create database**.
- Produktivmodus wählen.
- Region auswählen.

### 5) Storage aktivieren
- **Storage** → **Get started**.
- Danach die bereitgestellten Regeln übernehmen.

### 6) Konfigurationsdatei füllen
- `firebase-config.example.js` nach `firebase-config.js` kopieren, falls nötig.
- Ihre Werte einsetzen.
- `enabled: true` setzen.

### 7) Regeln und Indizes übernehmen
- Inhalt aus `firestore.rules` in Firestore Rules einfügen.
- Inhalt aus `storage.rules` in Storage Rules einfügen.
- Optional `firestore.indexes.json` importieren.

### 8) Deploy und Domain freigeben
- Projekt deployen.
- In Firebase unter **Authentication → Settings → Authorized domains** Ihre Live-Domain hinzufügen.

## Empfohlene Collections
- `bookings`
- `gallery`
- `users`
- `notifications`

## Erster Live-Test
1. Admin einloggen.
2. Termin anlegen.
3. Fall im Workspace übernehmen.
4. Notiz schreiben.
5. Status ändern.
6. PDF exportieren.

## Hinweise
- Ohne Firebase läuft Bridge komplett lokal im Browser.
- Mit Firebase werden Daten und Logins zwischen Geräten synchronisiert.
- Für sensible Daten sollten Datenschutz, Hosting und Rechte intern geprüft werden.
