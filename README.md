# Suspicious Login Detector 🔐

A complete Flask + React based security analysis tool that detects **brute-force attempts**, **off-hours logins**, and **abnormal IP activity** from uploaded CSV login data.

This project helps organizations identify suspicious authentication patterns quickly by analyzing simple CSV logs — no complex SIEM or infrastructure required.

---

## 📌 Overview

The Suspicious Login Detector processes uploaded login records and highlights unusual or risky activities.  
It generates categorized reports, triggers automatic alert emails, and provides a clean UI for testing and analysis.

This tool is ideal for:
- Organizations wanting visibility into authentication behavior  
- Security teams analyzing login anomalies  
- Students learning cybersecurity and log analysis  
- Lightweight SOC-style monitoring for small businesses  

---

- 🔗 **Live Website:** https://suspiciouslogindetectorpro.vercel.app/
- 🔗 **Backend API:** https://suspicious-login-detector.onrender.com


## 🚀 Features

### 🔥 1. Brute-Force Attack Detection
Flags multiple failed login attempts from the same IP + username within 5 minutes.

### 🕒 2. Off-Hours Login Detection
Identifies successful logins outside standard working hours (before 9 AM or after 6 PM).

### 🌍 3. Abnormal IP / Geo-Location Detection  
Uses **baseline learning**:
- First login → user's baseline country  
- Country changes in later logins → marked as abnormal  
- No false positives for new users  

### 📄 4. CSV Upload & Automated Analysis  
Upload standard authentication logs in CSV format with the following columns:

```csv
timestamp,username,ip_address,status
2024-01-15 08:30:00,john_doe,192.168.1.100,success
2024-01-15 14:25:10,jane_smith,203.0.113.45,failure
```

**Required CSV Columns:**
- `timestamp` - Date and time of login attempt (format: YYYY-MM-DD HH:MM:SS)
- `username` - Username attempting to log in
- `ip_address` - IP address of the login attempt
- `status` - Login status (success/failure)

### 📬 5. Automatic Email Alerts  
If any suspicious activity exists, an alert email is sent to the configured address.

### 📦 6. Downloadable ZIP Report  
Includes:
- `brute_force.csv`  
- `off_hours.csv`  
- `abnormal_ips.csv`  
- `logins.csv`  

### 🖥️ 7. Modern React Frontend  
A polished UI allowing users to:
- Upload logs  
- View categorized results  
- Send email report  
- Download ZIP  

---

## 📁 Project Structure

```
Suspicious-Login-Detector/
│
├── backend/
│   ├── app.py                 # Flask backend API
│   ├── detector.py            # Detection logic
│   ├── GeoLite2-City.mmdb     # GeoIP database
│   └── uploads/               # Uploaded & generated CSV files
│
├── frontend/
│   ├── src/
│   └── public/
│
├── requirements.txt
└── README.md
```

---

## 🧰 Installation & Setup

### Prerequisites
- Python 3.7 or higher
- Node.js and npm
- GeoLite2 City Database

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Sadvikha/Suspicious-Login-Detector.git
cd Suspicious-Login-Detector
```

### 2️⃣ Setup GeoIP Database

Download the **GeoLite2-City.mmdb** file and place it inside the `backend/` directory.

**Download link (free):**  
[https://dev.maxmind.com/geoip/geolite2-free-geolocation-data](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data)

### 3️⃣ Backend Setup (Flask)

Install Python dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Configure email settings in `app.py` (for alert functionality):

```python
# Update these variables in app.py
SENDER_EMAIL = "your-email@gmail.com"
SENDER_PASSWORD = "your-app-password"
RECIPIENT_EMAIL = "recipient@example.com"
```

Run the Flask backend:

```bash
python app.py
```

Backend runs on:  
**http://127.0.0.1:5000**

### 4️⃣ Frontend Setup (React)

Install dependencies:

```bash
cd frontend
npm install
```

Start the React development server:

```bash
npm start
```

Frontend runs on:  
**http://localhost:3000**

---

## 🛡️ Detection Logic (How It Works)

### 1️⃣ Brute Force Detection

**Criteria:**
- More than **5 FAILED attempts**
- Same **username + IP combination**
- Within **5 minutes**

**Example:**
```
User: admin, IP: 192.168.1.100
6 failed login attempts between 14:25:00 - 14:29:00
Result: ⚠️ Brute-force attack detected
```

### 2️⃣ Off-Hours Detection

**Criteria:**
- **Successful logins** before **9 AM** or after **6 PM**

**Example:**
```
User: john_doe, Login time: 03:45:22
Result: ⚠️ Off-hours login detected
```

### 3️⃣ Abnormal IP Detection

**Baseline Learning:**
- First login from a user establishes their **baseline country**
- Subsequent logins from **different countries** are flagged as abnormal

**Example:**
```
User: jane_smith
First login: India (baseline set)
Second login: Germany
Result: ⚠️ Abnormal IP activity detected
```

---

## 📬 Email Alert Behavior

An automatic email alert is sent when any of the following are detected:
- ✅ Brute-force attacks
- ✅ Off-hour logins
- ✅ Abnormal IP activity

**Email includes:**
- Username
- IP address
- Timestamp
- Detection category (brute-force/off-hours/abnormal IP)

---

## 📥 Downloadable Report

After analysis, users can download a **ZIP file** containing:

- `brute_force.csv` - All detected brute-force attempts
- `off_hours.csv` - All off-hours login records
- `abnormal_ips.csv` - All abnormal IP activities
- `logins.csv` - Complete uploaded login data

**Use cases:**
- Security audits
- Compliance documentation
- Internal investigations
- Forensic analysis

---

## 🧪 Example Output (UI)

After uploading a CSV file, the UI displays results in categorized cards:

```
✔ Brute Force: 3 records
✔ Off Hours: 1 record
✔ Abnormal IPs: 0 records

Total Logins Analyzed: 150
```

Each category is clickable to view detailed records.

---

## 🛠️ Technologies Used

### Backend
- **Python** - Core programming language
- **Flask** - Web framework and REST API
- **pandas** - Data processing and analysis
- **geoip2** - IP geolocation lookup
- **smtplib** - Email alert functionality

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **lucide-react** - Icon library
- **Axios** - HTTP requests

---

## 🔧 Configuration

### Email Configuration

Edit `backend/app.py` to configure SMTP settings:

```python
SENDER_EMAIL = "your-email@gmail.com"
SENDER_PASSWORD = "your-app-password"  # Use App Password for Gmail
RECIPIENT_EMAIL = "security-team@example.com"
```

### Detection Thresholds

Modify thresholds in `backend/detector.py`:

```python
BRUTE_FORCE_THRESHOLD = 5  # Failed attempts
TIME_WINDOW = 300  # 5 minutes in seconds
OFF_HOURS_START = 18  # 6 PM
OFF_HOURS_END = 9  # 9 AM
```

---

## 🧪 Testing

### Sample CSV for Testing

Create a test file `test_logins.csv`:

```csv
timestamp,username,ip_address,status
2024-01-15 08:30:00,alice,192.168.1.10,success
2024-01-15 14:25:10,bob,203.0.113.45,failure
2024-01-15 14:26:15,bob,203.0.113.45,failure
2024-01-15 14:27:20,bob,203.0.113.45,failure
2024-01-15 14:28:25,bob,203.0.113.45,failure
2024-01-15 14:29:30,bob,203.0.113.45,failure
2024-01-15 14:30:35,bob,203.0.113.45,failure
2024-01-15 03:45:00,charlie,10.0.0.25,success
2024-01-15 22:30:00,david,172.16.0.50,success
```

This sample includes:
- Brute-force attempts (bob)
- Off-hours logins (charlie, david)

---

## 🚨 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change port in app.py
app.run(debug=True, port=5001)
```

**GeoIP database not found:**
- Ensure `GeoLite2-City.mmdb` is in the `backend/` directory
- Download from MaxMind if missing

**Email not sending:**
- Enable "Less secure app access" or use App Passwords (Gmail)
- Check SMTP credentials in `app.py`
- Verify firewall/network settings

### Frontend Issues

**CORS errors:**
- Ensure Flask-CORS is installed: `pip install flask-cors`
- Check backend URL in frontend API calls

**Module not found:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🔮 Future Enhancements

- [ ] **Interactive Dashboard** - Real-time graphs and analytics
- [ ] **Multi-user Support** - User authentication and role-based access
- [ ] **JWT Authentication** - Secure API endpoints
- [ ] **SIEM Integration** - Connect with Splunk, ELK, or QRadar
- [ ] **Cloud Deployment** - Deploy on AWS, Azure, or Vercel
- [ ] **Real-time Monitoring** - WebSocket-based live updates
- [ ] **Machine Learning** - AI-based anomaly detection
- [ ] **Mobile App** - iOS/Android companion app

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Contribution Ideas
- Add new detection algorithms
- Improve UI/UX design
- Write unit tests
- Add support for more log formats
- Optimize performance

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👩‍💻 Author

**Sadvikha**

- GitHub: [@Sadvikha](https://github.com/Sadvikha)
- Project Link: [https://github.com/Sadvikha/Suspicious-Login-Detector](https://github.com/Sadvikha/Suspicious-Login-Detector)

---

## 🙏 Acknowledgments

- **MaxMind** for providing the GeoLite2 database
- The **Flask** and **React** communities for excellent documentation
- **Tailwind CSS** for the modern styling framework
- Open-source security community for detection methodologies

---

## ⚖️ Disclaimer

This tool is provided for **educational and security monitoring purposes**. Users are responsible for ensuring compliance with applicable laws and regulations regarding log monitoring and data privacy in their jurisdiction.

**Note:** Always test in a non-production environment before deploying to production systems.

---

## 📞 Support

For issues, questions, or feature requests:
- **Open an issue** on [GitHub Issues](https://github.com/Sadvikha/Suspicious-Login-Detector/issues)
- **Star** the repository if you find it helpful! ⭐

---

---

## ⚠️ Email Alerts 

They are implemented in code but intentionally disabled in the hosted environment for security & server restrictions.
They can be enabled locally with real SMTP credentials.

**by Sadvikha**
