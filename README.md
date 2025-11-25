# Suspicious Login Detector 🔐  
A complete Flask + React based security analysis tool that detects **brute-force attempts**, **off-hours logins**, and **abnormal IP activity** from uploaded CSV login data.

This project helps organizations identify suspicious authentication patterns quickly by analyzing simple CSV logs — no complex SIEM or infrastructure required.

---

# 📌 Overview

The Suspicious Login Detector processes uploaded login records and highlights unusual or risky activities.  
It generates categorized reports, triggers automatic alert emails, and provides a clean UI for testing and analysis.

This tool is ideal for:
- Organizations wanting visibility into authentication behavior  
- Security teams analyzing login anomalies  
- Students learning cybersecurity and log analysis  
- Lightweight SOC-style monitoring for small businesses  

---

# 🚀 Features

### 🔥 1. Brute-Force Attack Detection
Flags multiple failed login attempts from the same IP + username within 5 minutes.

### 🕒 2. Off-Hours Login Detection
Identifies successful logins outside standard working hours (before 9 AM or after 6 PM).

### 🌍 3. Abnormal IP / Geo-Location Detection  
Uses **baseline learning**:
- First login → user’s baseline country  
- Country changes in later logins → marked as abnormal  
- No false positives for new users  

### 📄 4. CSV Upload & Automated Analysis  
Upload standard authentication logs in CSV format:


### 📬 5. Automatic Email Alerts  
If any suspicious activity exists, an alert email is sent to the configured address.

### 📦 6. Downloadable ZIP Report  
Includes:
- brute_force.csv  
- off_hours.csv  
- abnormal_ips.csv  
- logins.csv  

### 🖥️ 7. Modern React Frontend  
A polished UI allowing users to:
- Upload logs  
- View categorized results  
- Send email report  
- Download ZIP  

---

# 📁 Project Structure

Suspicious-Login-Detector/
│
├── backend/
│ ├── app.py # Flask backend API
│ ├── detector.py # Detection logic
│ ├── GeoLite2-City.mmdb # GeoIP database
│ ├── uploads/ # Uploaded & generated CSV files
│
├── frontend/
│ ├── src/
│ └── public/
│
├── requirements.txt
└── README.md


# 🧰 Installation & Setup

## 1️⃣ Ensure GeoIP Database Exists

Place this file inside the `backend/` directory:

GeoLite2-City.mmdb


Download (free):  
https://dev.maxmind.com/geoip/geolite2-free-geolocation-data

---

## 2️⃣ Run Backend (Flask)

```bash
cd backend
python app.py


Backend runs on:
http://127.0.0.1:5000

---
## 3️⃣ Frontend Setup (React)
Install dependencies:
cd frontend
npm install

Start frontend:
npm start


Frontend runs on:
http://localhost:3000


🛡 Detection Logic (How It Works)
1️⃣ Brute Force

More than 5 FAILED attempts

Same username + IP

Within 5 minutes

2️⃣ Off Hours

Successful logins before 9 AM

Or after 6 PM

3️⃣ Abnormal IP

First login = baseline country

Country change → abnormal

Example:

First login: India

Second login: Germany → suspicious

📬 Email Alert Behavior

Automatic email is sent if:

Brute-force attacks detected

Off-hour logins detected

Abnormal IP activity detected

Email includes:

Username

IP address

Timestamp

Detection category

📥 Downloadable Report

After analysis, user can download:

brute_force.csv
off_hours.csv
abnormal_ips.csv
logins.csv


Packaged into a ZIP file for:

Security audits

Documentation

Internal investigations

🧪 Example Output (UI)

✔ Brute Force: 3 records

✔ Off Hours: 1 record

✔ Abnormal IPs: 0 records

The UI displays results in clean, categorized cards.

🛠 Technologies Used
Backend:

Python

Flask

pandas

geoip2

smtplib

Frontend:

React.js

Tailwind CSS

lucide-react icons

🔧 Future Enhancements (Optional)

Graphs & analytics dashboard

Multi-user login support

JWT authentication

SIEM integrations

Cloud deployment (Render / Railway / AWS / Vercel)

Real-time monitoring with WebSockets

🤝 Contributing

Contributions are welcome!
Submit issues or pull requests through GitHub.

📜 License

This project is licensed under the MIT License.

👩‍💻 Author

Sadvikha
GitHub: https://github.com/Sadvikha
