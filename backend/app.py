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

# ------------------- FIXED ------------------- #
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

GEOIP_DB = os.path.join(os.path.dirname(__file__), "GeoLite2-City.mmdb")

# ---------------- EMAIL CONFIG ---------------- #
SENDER_EMAIL = "suspiciouslogindetector@gmail.com"
APP_PASSWORD = "udpu wvug aibs cjmi"
RECEIVER_EMAIL = "suspiciouslogindetector@gmail.com"


# ================================================================= #
# 1️⃣ AUTO ALERT EMAIL
# ================================================================= #
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


# ================================================================= #
# 2️⃣ FRONTEND "SEND EMAIL" BUTTON
# ================================================================= #
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

    # Attach ZIP (correct method)
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


# ================================================================= #
# 3️⃣ TEST ROUTE
# ================================================================= #
@app.route("/api/test")
def test():
    return jsonify({"message": "Backend is working!"})


# ================================================================= #
# 4️⃣ DETECT ROUTE
# ================================================================= #
@app.route("/detect", methods=["POST"])
def detect():

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

    brute.to_csv(os.path.join(UPLOAD_FOLDER, "brute_force.csv"), index=False)
    off.to_csv(os.path.join(UPLOAD_FOLDER, "off_hours.csv"), index=False)
    abnormal.to_csv(os.path.join(UPLOAD_FOLDER, "abnormal_ips.csv"), index=False)

    result = {
        "brute_force": brute.to_dict(orient="records"),
        "off_hours": off.to_dict(orient="records"),
        "abnormal_ips": abnormal.to_dict(orient="records"),
    }

    # send alert if suspicious
    if len(brute) > 0 or len(off) > 0 or len(abnormal) > 0:
        send_email_alert(result)

    return jsonify(result)


# ================================================================= #
# 5️⃣ DOWNLOAD ZIP
# ================================================================= #
@app.route("/download/report", methods=["GET"])
def download_report():

    files = ["brute_force.csv", "off_hours.csv", "abnormal_ips.csv", "logins.csv"]

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file in files:
            fp = os.path.join(UPLOAD_FOLDER, file)
            if os.path.exists(fp):
                zipf.write(fp, arcname=file)

    zip_buffer.seek(0)

    return send_file(
        zip_buffer,
        as_attachment=True,
        download_name="sld_report.zip",
        mimetype="application/zip"
    )


# ================================================================= #
# 6️⃣ RUN APP — FIXED
# ================================================================= #
if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)