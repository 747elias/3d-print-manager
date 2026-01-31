# 🖨️ 3D-Druck Manager

Eine moderne, vollständig dockerisierte Web-App zur Verwaltung von 3D-Druckaufträgen mit automatischer Kostenberechnung, Zahlungstracking und umfassenden Statistiken.

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)

## ✨ Features

### Öffentlicher Bereich (Kein Login)
- 🔍 Druckaufträge eintragen mit allen Details
- 📸 Bilder hochladen
- 🔗 Links zu Printables/Thingiverse hinzufügen
- ⚖️ Filamentverbrauch in Gramm tracken
- 📊 Alle Drucke in übersichtlichen Karten ansehen
- 📈 **Detaillierte Statistiken mit Zeitraumfilter**
  - Total Drucke, Filamentverbrauch, Kosten und Durchschnittspreise
  - Drucke pro Monat (Balkendiagramm)
  - Kosten pro Monat (Balkendiagramm)
  - Filamentverbrauch über Zeit nach Typ (Liniendiagramm)
  - Top 5 Drucker (Ranking)
  - Durchschnittlicher Verbrauch pro Filamenttyp

### Admin-Bereich (Login erforderlich)
- 🔐 Sicherer Login-Bereich
- 💰 **Automatische Preisberechnung**: `(Gramm ÷ 1000) × Preis/kg`
- 📈 Zahlungsübersicht pro Person
- 🎨 Filamentverwaltung (Name + Preis/kg)
- ✅ Zahlungsstatus setzen (offen/bezahlt)
- ✏️ Drucke bearbeiten und löschen
- 🔍 Filter nach Person und Status
- 📊 Zusammenfassung aller offenen Beträge

## 🚀 Quick Start

### Voraussetzungen
- Docker & Docker Compose installiert
- Port 5000 frei

### Installation

1. **Repository klonen**
```bash
git clone https://github.com/747elias/3d-print-manager.git
cd 3d-print-manager
```

2. **Admin-Passwort in `.env` setzen**

Die `.env` Datei ist bereits im Repo. Öffne sie und setze dein Passwort:
```env
ADMIN_PASSWORD=dein_sicheres_passwort
SECRET_KEY=ein_zufälliger_geheimer_schlüssel
```

3. **Starten**
```bash
docker compose up --build
```

4. **App öffnen**
- Hauptseite: http://localhost:5000
- Admin-Login: http://localhost:5000/login.html

**Standard Admin-Login:**
- Username: `admin`
- Passwort: Was du in der `.env` gesetzt hast

## 📊 Statistiken-Feature

Die Statistiken sind öffentlich zugänglich (kein Login erforderlich) und bieten umfassende Einblicke in deine 3D-Druck-Aktivitäten:

### Verfügbare Statistiken:
- **Dashboard-Cards**: Schnellübersicht über Gesamtzahlen
  - Total Drucke im Zeitraum
  - Total Filamentverbrauch (Gramm)
  - Total Kosten (CHF)
  - Durchschnittspreis pro Druck

- **Zeitbasierte Analysen**:
  - Drucke pro Monat (zeigt Aktivitätstrends)
  - Kosten pro Monat (finanzielle Übersicht)
  - Filamentverbrauch über Zeit (nach Filamenttyp gruppiert)

- **Vergleichsanalysen**:
  - Top 5 aktivste Drucker
  - Durchschnittlicher Verbrauch pro Filamenttyp

### Zeitraumfilter:
- Flexibles Datum-Filter (Von/Bis)
- Zurücksetzen-Button für Gesamtansicht
- Automatische Aktualisierung aller Charts

## 🏗️ Projektstruktur

```
3d-print-manager/
├── backend/              # Python FastAPI Backend
│   ├── app.py           # Haupt-API mit Statistics-Endpoint
│   ├── models.py        # Datenbank-Modelle + Statistics-Queries
│   ├── config.py        # Konfiguration
│   ├── init_db.py       # DB-Initialisierung
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/            # HTML/CSS/JS Frontend
│   ├── index.html       # Hauptseite mit Statistics-Tab
│   ├── admin.html       # Admin-Dashboard
│   ├── login.html       # Login-Seite
│   ├── css/
│   │   └── style.css    # Styles inkl. Statistics-Layouts
│   └── js/
│       ├── app.js       # Main App + Statistics mit Chart.js
│       ├── admin.js
│       └── login.js
├── data/                # SQLite Datenbank (wird erstellt)
├── uploads/             # Hochgeladene Bilder (wird erstellt)
├── docker-compose.yml
├── .env                 # Umgebungsvariablen (Passwort hier setzen!)
└── README.md
```

## 🛠️ Verwendung

### Druckauftrag erstellen
1. Hauptseite öffnen
2. Tab "Neuer Druck" auswählen
3. Formular ausfüllen:
   - Name des Drucks
   - Wer hat gedruckt
   - Filamentverbrauch in Gramm
   - Filamenttyp auswählen
   - Optional: Bild und Link hinzufügen
4. Speichern - Preis wird automatisch berechnet!

### Statistiken ansehen
1. Tab "📊 Statistiken" auswählen
2. Optional: Zeitraum mit Von/Bis-Filter eingrenzen
3. Statistiken werden automatisch geladen und visualisiert
4. Charts sind interaktiv (Hover für Details)

### Admin-Funktionen
1. Zu `/login.html` navigieren
2. Mit `admin` und deinem Passwort einloggen
3. Dashboard öffnet sich mit 3 Tabs:
   - **Übersicht**: Wer schuldet wie viel
   - **Drucke verwalten**: Alle Einträge bearbeiten
   - **Filamente verwalten**: Filamenttypen und Preise pflegen

## 💾 Daten & Backup

Alle Daten werden lokal in deinem Projektordner gespeichert:

- **Datenbank**: `./data/prints.db`
- **Bilder**: `./uploads/`

### Backup erstellen
```bash
# Einfach die Ordner kopieren
cp -r data data_backup
cp -r uploads uploads_backup
```

### Datenbank zurücksetzen
```bash
docker compose down
rm -rf data uploads
docker compose up
```

## 🎨 Design

- **Modernes Dark Theme** mit sauberer UI
- **Responsive Design** - funktioniert auf Desktop & Mobile
- **Intuitive Navigation** mit Tab-System
- **Lightbox** für Bildansicht
- **Status-Badges** für visuelle Kennzeichnung (🔴 Offen / ✅ Bezahlt)
- **Interaktive Charts** mit Chart.js für Statistiken

## 🔧 Entwicklung

### Container neu bauen
```bash
docker compose down
docker compose up --build
```

### Logs anschauen
```bash
docker compose logs -f
```

### In Container einloggen
```bash
docker exec -it print_manager_backend bash
```

### Port ändern
In `docker-compose.yml` die Zeile ändern:
```yaml
ports:
  - "8080:5000"  # Ändere 8080 zu deinem gewünschten Port
```

## 🔒 Sicherheit

- **JWT-basierte Authentifizierung** für Admin-Bereich
- **Input-Validierung** auf Backend-Seite
- **Sichere File-Uploads** mit Type-Checking
- ⚠️ **Wichtig**: Ändere das Admin-Passwort in der `.env` Datei!

## 📈 Technologie-Stack

- **Backend**: FastAPI (Python)
- **Frontend**: Vanilla JavaScript + Chart.js
- **Datenbank**: SQLite
- **Container**: Docker + Docker Compose
- **Charts**: Chart.js 4.4.0

## 📝 Beispiel-Filamente

Bei der ersten Initialisierung werden automatisch Beispiel-Filamente angelegt:
- PLA Schwarz (CHF 20.00/kg)
- PLA Weiss (CHF 20.00/kg)
- PETG Transparent (CHF 25.00/kg)
- ABS Rot (CHF 22.00/kg)
- TPU Flexibel (CHF 35.00/kg)

Diese können im Admin-Bereich angepasst oder gelöscht werden.

## 🛠 Troubleshooting

### Port bereits belegt?
```bash
# Ändere Port in docker-compose.yml oder stoppe den anderen Service
sudo lsof -i :5000
```

### Login funktioniert nicht?
```bash
# Prüfe ob .env richtig geladen wird
docker compose down
docker compose up --build
# Logs checken für "DEBUG - Admin Password"
```

### CSS/JS wird nicht aktualisiert?
```bash
# Hard Refresh im Browser: CTRL + SHIFT + R
# Oder Cache leeren: CTRL + SHIFT + DELETE
```

### Datenbank-Fehler?
```bash
# Datenbank neu initialisieren
docker compose down
rm -rf data
docker compose up
```

### Statistiken laden nicht?
```bash
# Browser-Konsole öffnen (F12) und Fehler checken
# API-Endpoint testen: http://localhost:5000/api/statistics
```


## 👨‍💻 Autor

Erstellt von Elias

Repository: https://github.com/747elias/3d-print-manager

## 🙏 Acknowledgments

- FastAPI für das awesome Backend-Framework
- Docker für die einfache Deployment-Lösung
- Chart.js für die schönen, interaktiven Charts

---