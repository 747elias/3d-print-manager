# 🖨️ 3D Print Manager

A modern, fully dockerized web app for managing 3D print jobs with automatic cost calculation, payment tracking, and comprehensive statistics.

🌐 **Live Preview:** [https://747elias.github.io/3d-print-manager-preview/](https://747elias.github.io/3d-print-manager-preview/)

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)

## ✨ Features

### Public Area (No Login Required)
- 🔍 Submit print jobs with all details
- 📸 Upload images
- 🔗 Add links to Printables/Thingiverse
- ⚖️ Track filament consumption in grams
- 📊 View all prints in clear card layout
- 📈 **Detailed statistics with time range filter**
  - Total prints, filament consumption, costs and average prices
  - Prints per month (bar chart)
  - Costs per month (bar chart)
  - Filament consumption over time by type (line chart)
  - Top 5 printers (ranking)
  - Average consumption per filament type

### Admin Area (Login Required)
- 🔐 Secure login area
- 💰 **Automatic price calculation**: `(grams ÷ 1000) × price/kg`
- 📈 Payment overview per person
- 🎨 Filament management (name + price/kg)
- ✅ Set payment status (open/paid)
- ✏️ Edit and delete prints
- 🔍 Filter by person and status
- 📊 Summary of all outstanding amounts

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Port 5000 available

### Installation

1. **Clone repository**
```bash
git clone https://github.com/747elias/3d-print-manager.git
cd 3d-print-manager
```

2. **Set admin password in `.env`**

The `.env` file is already in the repo. Open it and set your password:
```env
ADMIN_PASSWORD=your_secure_password
SECRET_KEY=a_random_secret_key
```

3. **Start**
```bash
docker compose up --build
```

4. **Open app**
- Main page: http://localhost:5000
- Admin login: http://localhost:5000/login.html

**Default admin login:**
- Username: `admin`
- Password: What you set in the `.env` file

## 📊 Statistics Feature

The statistics are publicly accessible (no login required) and provide comprehensive insights into your 3D printing activities:

### Available Statistics:
- **Dashboard Cards**: Quick overview of totals
  - Total prints in time range
  - Total filament consumption (grams)
  - Total costs (CHF)
  - Average price per print

- **Time-based Analysis**:
  - Prints per month (shows activity trends)
  - Costs per month (financial overview)
  - Filament consumption over time (grouped by filament type)

- **Comparative Analysis**:
  - Top 5 most active printers
  - Average consumption per filament type

### Time Range Filter:
- Flexible date filter (From/To)
- Reset button for overall view
- Automatic update of all charts

## 🏗️ Project Structure

```
3d-print-manager/
├── backend/              # Python FastAPI Backend
│   ├── app.py           # Main API with Statistics endpoint
│   ├── models.py        # Database models + Statistics queries
│   ├── config.py        # Configuration
│   ├── init_db.py       # DB initialization
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/            # HTML/CSS/JS Frontend
│   ├── index.html       # Main page with Statistics tab
│   ├── admin.html       # Admin dashboard
│   ├── login.html       # Login page
│   ├── css/
│   │   └── style.css    # Styles incl. Statistics layouts
│   └── js/
│       ├── app.js       # Main app + Statistics with Chart.js
│       ├── admin.js
│       └── login.js
├── data/                # SQLite database (created automatically)
├── uploads/             # Uploaded images (created automatically)
├── docker-compose.yml
├── .env                 # Environment variables (set password here!)
└── README.md
```

## 🛠️ Usage

### Create Print Job
1. Open main page
2. Select "New Print" tab
3. Fill out form:
   - Name of the print
   - Who printed it
   - Filament consumption in grams
   - Select filament type
   - Optional: Add image and link
4. Save - price will be calculated automatically!

### View Statistics
1. Select "📊 Statistics" tab
2. Optional: Narrow down time range with From/To filter
3. Statistics will load and visualize automatically
4. Charts are interactive (hover for details)

### Admin Functions
1. Navigate to `/login.html`
2. Login with `admin` and your password
3. Dashboard opens with 3 tabs:
   - **Overview**: Who owes how much
   - **Manage Prints**: Edit all entries
   - **Manage Filaments**: Maintain filament types and prices

## 💾 Data & Backup

All data is stored locally in your project folder:

- **Database**: `./data/prints.db`
- **Images**: `./uploads/`

### Create Backup
```bash
# Simply copy the folders
cp -r data data_backup
cp -r uploads uploads_backup
```

### Reset Database
```bash
docker compose down
rm -rf data uploads
docker compose up
```

## 🎨 Design

- **Modern Dark Theme** with clean UI
- **Responsive Design** - works on desktop & mobile
- **Intuitive Navigation** with tab system
- **Lightbox** for image viewing
- **Status Badges** for visual identification (🔴 Open / ✅ Paid)
- **Interactive Charts** with Chart.js for statistics

## 🔧 Development

### Rebuild Container
```bash
docker compose down
docker compose up --build
```

### View Logs
```bash
docker compose logs -f
```

### Login to Container
```bash
docker exec -it print_manager_backend bash
```

### Change Port
Change the line in `docker-compose.yml`:
```yaml
ports:
  - "8080:5000"  # Change 8080 to your desired port
```

## 🔒 Security

- **JWT-based authentication** for admin area
- **Input validation** on backend side
- **Secure file uploads** with type checking
- ⚠️ **Important**: Change the admin password in the `.env` file!

## 📈 Technology Stack

- **Backend**: FastAPI (Python)
- **Frontend**: Vanilla JavaScript + Chart.js
- **Database**: SQLite
- **Container**: Docker + Docker Compose
- **Charts**: Chart.js 4.4.0

## 📝 Example Filaments

On first initialization, example filaments are automatically created:
- PLA Black (CHF 20.00/kg)
- PLA White (CHF 20.00/kg)
- PETG Transparent (CHF 25.00/kg)
- ABS Red (CHF 22.00/kg)
- TPU Flexible (CHF 35.00/kg)

These can be adjusted or deleted in the admin area.

## 🛠 Troubleshooting

### Port already in use?
```bash
# Change port in docker-compose.yml or stop the other service
sudo lsof -i :5000
```

### Login not working?
```bash
# Check if .env is loaded correctly
docker compose down
docker compose up --build
# Check logs for "DEBUG - Admin Password"
```

### CSS/JS not updating?
```bash
# Hard refresh in browser: CTRL + SHIFT + R
# Or clear cache: CTRL + SHIFT + DELETE
```

### Database errors?
```bash
# Reinitialize database
docker compose down
rm -rf data
docker compose up
```

### Statistics not loading?
```bash
# Open browser console (F12) and check for errors
# Test API endpoint: http://localhost:5000/api/statistics
```

## 📄 License

This project is licensed under the MIT License with Attribution - see the [LICENSE](LICENSE) file for details.

**Attribution Required**: When using or modifying this code, you must:
- Credit the original author (Elias)
- Include a link to the original repository: https://github.com/747elias/3d-print-manager

## 👨‍💻 Author

Created by Elias

Repository: https://github.com/747elias/3d-print-manager

## 🙏 Acknowledgments

- FastAPI for the awesome backend framework
- Docker for the easy deployment solution
- Chart.js for the beautiful, interactive charts

---
