import sys
import pandas as pd
import geoip2.database
from dateutil import parser
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# -----------------------
#  EMAIL CONFIG
# -----------------------
SENDER_EMAIL = "suspiciouslogindetector@gmail.com"
APP_PASSWORD = "udpuwvugaibscjmi"  # <-- your app password WITHOUT spaces
RECEIVER_EMAIL = "suspiciouslogindetector@gmail.com"

def send_alert_email(subject, message):
    """Send suspicious activity email alert."""
    try:
        msg = MIMEMultipart()
        msg["From"] = SENDER_EMAIL
        msg["To"] = RECEIVER_EMAIL
        msg["Subject"] = subject

        msg.attach(MIMEText(message, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SENDER_EMAIL, APP_PASSWORD)
        server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
        server.quit()

        print("📨 Email alert sent successfully!")

    except Exception as e:
        print("❌ Failed to send email alert:", e)


# -----------------------
#   MAIN DETECTION LOGIC
# -----------------------

def load_logs(filepath):
    df = pd.read_csv(filepath)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df

def detect_brute_force(df):
    failed = df[df["status"] == "FAILED"].set_index("timestamp")
    grouped = (
        failed.groupby(["username", "ip"])
        .rolling("5min")
        .count()
        .reset_index()
    )
    grouped = grouped.rename(columns={"status": "attempts"})
    brute_force = grouped[grouped["attempts"] > 5]
    return brute_force

def detect_off_hours(df):
    df["hour"] = df["timestamp"].dt.hour
    success = df[df["status"] == "SUCCESS"]
    off_hours = success[(success["hour"] < 9) | (success["hour"] > 18)]
    return off_hours

def detect_abnormal_ips(df, normal_countries, reader):
    def get_country(ip):
        try:
            response = reader.city(ip)
            return response.country.name
        except:
            return "Unknown"

    df["country"] = df["ip"].apply(get_country)
    df["abnormal_country"] = df.apply(
        lambda x: x["country"] != normal_countries.get(x["username"], ""),
        axis=1
    )
    return df[df["abnormal_country"]]

def main():
    if len(sys.argv) != 2:
        print("Usage: python detector.py logins.csv")
        sys.exit(1)

    filepath = sys.argv[1]
    df = load_logs(filepath)

    normal_countries = {
        "user1": "India",
        "user2": "United States"
    }

    reader = geoip2.database.Reader("GeoLite2-City.mmdb")

    brute_force = detect_brute_force(df)
    off_hours = detect_off_hours(df)
    abnormal_ips = detect_abnormal_ips(df, normal_countries, reader)

    brute_force.to_csv("brute_force.csv", index=False)
    off_hours.to_csv("off_hours.csv", index=False)
    abnormal_ips.to_csv("abnormal_ips.csv", index=False)

    print("✅ Detection complete! Results saved:")
    print("- brute_force.csv")
    print("- off_hours.csv")
    print("- abnormal_ips.csv")

    # --------------------------
    #  EMAIL ALERT GENERATION
    # --------------------------
    email_body = ""

    if not brute_force.empty:
        email_body += f"\n🔥 Brute Force Attempts ({len(brute_force)}):\n"
        for _, row in brute_force.iterrows():
            email_body += (
                f"- User: {row['username']} | IP: {row['ip']} "
                f"| Attempts: {row['attempts']}\n"
            )

    if not off_hours.empty:
        email_body += f"\n⏰ Off-Hours Logins ({len(off_hours)}):\n"
        for _, row in off_hours.iterrows():
            email_body += (
                f"- User: {row['username']} | IP: {row['ip']} "
                f"| Hour: {row['hour']}\n"
            )

    if not abnormal_ips.empty:
        email_body += f"\n🌍 Abnormal IP Logins ({len(abnormal_ips)}):\n"
        for _, row in abnormal_ips.iterrows():
            email_body += (
                f"- User: {row['username']} | IP: {row['ip']} "
                f"| Country: {row['country']}\n"
            )

    # Send email only if suspicious activity exists
    if email_body.strip():
        send_alert_email("Suspicious Login Activity Detected", email_body)
    else:
        print("ℹ️ No suspicious activity detected — email not sent.")

if __name__ == "__main__":
    main()
