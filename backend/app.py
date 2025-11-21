# backend/app.py
import os
import io
import zipfile
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import geoip2.database

# Import detection logic
from detector import load_logs, detect_brute_force, detect_off_hours, detect_abnormal_ips

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

GEOIP_DB = os.path.join(os.path.dirname(__file__), "GeoLite2-City.mmdb")

# ---------------- EMAIL CONFIG ---------------- #
SENDER_EMAIL = "suspiciouslogindetector@gmail.com"
APP_PASSWORD = "udpu wvug aibs cjmi"
RECEIVER_EMAIL = "suspiciouslogindetector@gmail.com"


# ---------------- SEND EMAIL FUNCTION ---------------- #
def send_email_alert(results):
    """
    Sends email alert when suspicious activity exists.
    """

    subject = "⚠ Suspicious Login Activity Detected"

    body = "<h2>Suspicious Login Activity Detected</h2>"

    if len(results["brute_force"]) > 0:
        body += f"<p><b>Brute Force Attempts:</b> {len(results['brute_force'])}</p>"

    if len(results["off_hours"]) > 0:
        body += f"<p><b>Off Hours Logins:</b> {len(results['off_hours'])}</p>"

    if len(results["abnormal_ips"]) > 0:
        body += f"<p><b>Abnormal IP Logins:</b> {len(results['abnormal_ips'])}</p>"

    body += "<hr><p>Check the Suspicious Login Detector dashboard for full details.</p>"

    msg = MIMEMultipart()
    msg["From"] = SENDER_EMAIL
    msg["To"] = RECEIVER_EMAIL
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SENDER_EMAIL, APP_PASSWORD)
        server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
        server.quit()
        print("📧 Email alert sent successfully!")

    except Exception as e:
        print("❌ Failed to send email:", e)


# ---------------- TEST ROUTE ---------------- #
@app.route("/api/test")
def test():
    return jsonify({"message": "Backend is working!"})


# ---------------- DETECT ROUTE ---------------- #
@app.route("/detect", methods=["POST"])
def detect():
    if "logfile" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    uploaded = request.files["logfile"]
    saved_path = os.path.join(UPLOAD_FOLDER, "logins.csv")
    uploaded.save(saved_path)

    # Load logs
    try:
        df = load_logs(saved_path)
    except Exception as e:
        return jsonify({"error": f"Failed to load CSV: {e}"}), 400

    # GeoIP database
    if not os.path.exists(GEOIP_DB):
        return jsonify({"error": "GeoLite2-City.mmdb missing in backend/"}), 500

    reader = geoip2.database.Reader(GEOIP_DB)

    # Run detection logic
    try:
        brute_force_df = detect_brute_force(df)
        off_hours_df = detect_off_hours(df)

        # No pre-mapped countries → abnormal = any difference
        normal_countries = {}

        abnormal_ips_df = detect_abnormal_ips(df, normal_countries, reader)

    except Exception as e:
        return jsonify({"error": f"Detection failed: {e}"}), 500

    # Save CSVs
    brute_force_df.to_csv(os.path.join(UPLOAD_FOLDER, "brute_force.csv"), index=False)
    off_hours_df.to_csv(os.path.join(UPLOAD_FOLDER, "off_hours.csv"), index=False)
    abnormal_ips_df.to_csv(os.path.join(UPLOAD_FOLDER, "abnormal_ips.csv"), index=False)

    # Prepare JSON Response
    result = {
        "brute_force": brute_force_df.to_dict(orient="records"),
        "off_hours": off_hours_df.to_dict(orient="records"),
        "abnormal_ips": abnormal_ips_df.to_dict(orient="records"),
    }

    # ---------------- SEND EMAIL IF SUSPICIOUS ---------------- #
    if (
        len(result["brute_force"]) > 0 or
        len(result["off_hours"]) > 0 or
        len(result["abnormal_ips"]) > 0
    ):
        send_email_alert(result)

    return jsonify(result)


# ---------------- DOWNLOAD ZIP ROUTE ---------------- #
@app.route("/download/report", methods=["GET"])
def download_report():
    files = [
        "brute_force.csv",
        "off_hours.csv",
        "abnormal_ips.csv",
        "logins.csv",
    ]

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for f in files:
            path = os.path.join(UPLOAD_FOLDER, f)
            if os.path.exists(path):
                zipf.write(path, arcname=f)

    zip_buffer.seek(0)

    return send_file(
        zip_buffer,
        as_attachment=True,
        download_name="sld_report.zip",
        mimetype="application/zip",
    )


# ---------------- RUN APP ---------------- #
if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
