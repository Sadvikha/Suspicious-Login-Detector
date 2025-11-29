# backend/app.py
import os
import io
import zipfile
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import geoip2.database

from detector import load_logs, detect_brute_force, detect_off_hours, detect_abnormal_ips

app = Flask(__name__)
# Enable CORS fully for everything
CORS(app, resources={r"/*": {"origins": "*"}})


@app.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

GEOIP_DB = os.path.join(os.path.dirname(__file__), "GeoLite2-City.mmdb")

# ---------------- EMAIL CONFIG ---------------- #
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
APP_PASSWORD = os.getenv("APP_PASSWORD")
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL")


# ======================================================================
# 1️⃣ AUTO ALERT EMAIL
# ======================================================================
"""
# REAL IMPLEMENTATION (for local / non-restricted environments)

def send_email_alert(results):
    subject = "⚠ Suspicious Login Activity Detected"
    body = "<h2>Suspicious Login Activity Detected</h2>"

    if len(results["brute_force"]) > 0:
        body += f"<p><b>Brute Force Attempts:</b> {len(results['brute_force'])}</p>"
    if len(results["off_hours"]) > 0:
        body += f"<p><b>Off Hours Logins:</b> {len(results['off_hours'])}</p>"
    if len(results["abnormal_ips"]) > 0:
        body += f"<p><b>Abnormal IP Logins:</b> {len(results['abnormal_ips'])}</p>"

    body += "<hr><p>Open the Suspicious Login Detector dashboard for full details.</p>"

    msg = MIMEMultipart()
    msg["From"] = SENDER_EMAIL
    msg["To"] = RECEIVER_EMAIL
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SENDER_EMAIL, APP_PASSWORD)
        server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
        server.quit()
        print("📧 Auto-alert email sent!")
    except Exception as e:
        print("❌ Auto-alert email error:", e)
"""
# ACTIVE VERSION FOR HOSTING (does nothing, but shows intent)
def send_email_alert(results):
    print("📧 Auto-email alert is DISABLED in hosted demo (SMTP blocked).")


# ======================================================================
# 2️⃣ FRONTEND "SEND EMAIL" BUTTON
# ======================================================================
"""
# REAL IMPLEMENTATION (for local / non-restricted environments)

@app.route("/send-email", methods=["POST"])
def send_email_to_user():
    data = request.get_json()
    receiver_email = data.get("email")

    if not receiver_email:
        return jsonify({"error": "No email provided"}), 400

    zip_path = os.path.join(UPLOAD_FOLDER, "sld_report.zip")

    # Create ZIP
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for f in ["brute_force.csv", "off_hours.csv", "abnormal_ips.csv", "logins.csv"]:
            fp = os.path.join(UPLOAD_FOLDER, f)
            if os.path.exists(fp):
                zipf.write(fp, arcname=f)

    subject = "Your Suspicious Login Detector Report"
    body = "Attached is your requested security analysis report."

    msg = MIMEMultipart()
    msg["From"] = SENDER_EMAIL
    msg["To"] = receiver_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    # Attach ZIP
    with open(zip_path, "rb") as f:
        part = MIMEBase("application", "zip")
        part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", "attachment; filename=sld_report.zip")
        msg.attach(part)

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SENDER_EMAIL, APP_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, msg.as_string())
        server.quit()
        return jsonify({"message": "Email sent successfully!"})
    except Exception as e:
        print("❌ Manual email error:", e)
        return jsonify({"error": "Server error. Try again."}), 500
"""

# ACTIVE VERSION FOR HOSTING
@app.route("/send-email", methods=["POST"])
def send_email_to_user():
    # We intentionally do NOT send email on Render
    return jsonify({
        "message": "📧 Email sending is disabled in the hosted demo (SMTP not allowed)."
    }), 200


# ======================================================================
# 3️⃣ TEST ROUTE
# ======================================================================
@app.route("/api/test")
def test():
    return jsonify({"message": "Backend is working!"})


# ======================================================================
# 4️⃣ DETECT ROUTE
# ======================================================================
@app.route("/detect", methods=["POST", "OPTIONS"])
def detect():
    # Handle preflight CORS
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200

    if "logfile" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    uploaded_file = request.files["logfile"]
    saved_path = os.path.join(UPLOAD_FOLDER, "logins.csv")
    uploaded_file.save(saved_path)

    try:
        df = load_logs(saved_path)
    except Exception as e:
        return jsonify({"error": f"CSV load error: {e}"}), 400

    if not os.path.exists(GEOIP_DB):
        return jsonify({"error": "GeoLite2-City.mmdb missing"}), 500

    reader = geoip2.database.Reader(GEOIP_DB)

    try:
        brute = detect_brute_force(df)
        off = detect_off_hours(df)
        abnormal = detect_abnormal_ips(df, {}, reader)
    except Exception as e:
        return jsonify({"error": f"Detection failed: {e}"}), 500

    # Save CSVs for download
    brute.to_csv(os.path.join(UPLOAD_FOLDER, "brute_force.csv"), index=False)
    off.to_csv(os.path.join(UPLOAD_FOLDER, "off_hours.csv"), index=False)
    abnormal.to_csv(os.path.join(UPLOAD_FOLDER, "abnormal_ips.csv"), index=False)

    result = {
        "brute_force": brute.to_dict(orient="records"),
        "off_hours": off.to_dict(orient="records"),
        "abnormal_ips": abnormal.to_dict(orient="records"),
    }

    # REAL BEHAVIOUR (LOCAL ONLY) – COMMENTED FOR HOSTING:
    # if len(brute) > 0 or len(off) > 0 or len(abnormal) > 0:
    #     send_email_alert(result)

    # Hosted demo: only return JSON to frontend
    return jsonify(result)


# ======================================================================
# 5️⃣ DOWNLOAD ZIP
# ======================================================================
@app.route("/download/report", methods=["GET"])
def download_report():
    files = ["brute_force.csv", "off_hours.csv", "abnormal_ips.csv", "logins.csv"]

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for f in files:
            fp = os.path.join(UPLOAD_FOLDER, f)
            if os.path.exists(fp):
                zipf.write(fp, arcname=f)

    zip_buffer.seek(0)

    return send_file(
        zip_buffer,
        as_attachment=True,
        download_name="sld_report.zip",
        mimetype="application/zip"
    )


# ======================================================================
# 6️⃣ HEALTH CHECK / ROOT ROUTE
# ======================================================================
@app.route("/")
def home():
    return jsonify({"message": "Suspicious Login Detector API Running!"})


# ======================================================================
# 7️⃣ RUN APP
# ======================================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
