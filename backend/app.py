# backend/app.py
import os
import io
import zipfile
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import geoip2.database

# import your detector functions (make sure detector.py is in same folder)
from detector import load_logs, detect_brute_force, detect_off_hours, detect_abnormal_ips

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Path to GeoLite2 DB - ensure you downloaded and placed this file here
GEOIP_DB = os.path.join(os.path.dirname(__file__), "GeoLite2-City.mmdb")

@app.route("/api/test", methods=["GET"])
def test():
    return jsonify({"message": "Backend is working!"})

@app.route("/detect", methods=["POST"])
def detect():
    """
    Accepts a multipart form upload (file field named 'logfile').
    Saves file as 'logins.csv' to uploads/, runs detectors,
    saves outputs as CSVs, and returns JSONified results.
    """
    if "logfile" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["logfile"]
    saved_path = os.path.join(UPLOAD_FOLDER, "logins.csv")
    file.save(saved_path)

    # Load logs using your existing function
    try:
        df = load_logs(saved_path)
    except Exception as e:
        return jsonify({"error": f"Failed to load CSV: {e}"}), 400

    # Prepare geoip reader
    if not os.path.exists(GEOIP_DB):
        return jsonify({"error": "GeoLite2-City.mmdb not found on server. Place it in backend/"}), 500

    reader = geoip2.database.Reader(GEOIP_DB)

    try:
        brute_force_df = detect_brute_force(df)  # DataFrame
        off_hours_df = detect_off_hours(df)      # DataFrame
        # Example normal countries mapping - you can change this or accept from client
        normal_countries = {}  # empty -> detector will still mark abnormal based on country
        abnormal_ips_df = detect_abnormal_ips(df, normal_countries, reader)
    except Exception as e:
        return jsonify({"error": f"Detection failed: {e}"}), 500

    # Save outputs as CSV into uploads/
    bf_path = os.path.join(UPLOAD_FOLDER, "brute_force.csv")
    oh_path = os.path.join(UPLOAD_FOLDER, "off_hours.csv")
    ai_path = os.path.join(UPLOAD_FOLDER, "abnormal_ips.csv")

    brute_force_df.to_csv(bf_path, index=False)
    off_hours_df.to_csv(oh_path, index=False)
    abnormal_ips_df.to_csv(ai_path, index=False)

    # Convert to JSON to return
    result = {
        "brute_force": brute_force_df.to_dict(orient="records"),
        "off_hours": off_hours_df.to_dict(orient="records"),
        "abnormal_ips": abnormal_ips_df.to_dict(orient="records"),
    }

    return jsonify(result)


@app.route("/download/report", methods=["GET"])
def download_report():
    """
    Zips the CSV reports in uploads/ and sends as attachment.
    """
    files = ["brute_force.csv", "off_hours.csv", "abnormal_ips.csv", "logins.csv"]
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zipf:
        for f in files:
            path = os.path.join(UPLOAD_FOLDER, f)
            if os.path.exists(path):
                zipf.write(path, arcname=f)
    zip_buffer.seek(0)
    return send_file(zip_buffer, as_attachment=True, download_name="sld_report.zip", mimetype="application/zip")


if __name__ == "__main__":
    # debug True fine for local dev
    app.run(debug=True, host="127.0.0.1", port=5000)
