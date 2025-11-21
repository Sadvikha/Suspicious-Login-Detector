import sys
import pandas as pd
import geoip2.database
from dateutil import parser

def load_logs(filepath):
    df = pd.read_csv(filepath)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    return df

def detect_brute_force(df):
    failed = df[df['status'] == 'FAILED'].set_index('timestamp')
    grouped = (
        failed.groupby(['username', 'ip'])
        .rolling('5min')
        .count()
        .reset_index()
    )
    grouped = grouped.rename(columns={'status': 'attempts'})
    brute_force = grouped[grouped['attempts'] > 5]
    return brute_force

def detect_off_hours(df):
    df['hour'] = df['timestamp'].dt.hour
    success = df[df['status'] == 'SUCCESS']
    off_hours = success[(success['hour'] < 9) | (success['hour'] > 18)]
    return off_hours

def detect_abnormal_ips(df, normal_countries, reader):
    def get_country(ip):
        try:
            response = reader.city(ip)
            return response.country.name
        except:
            return 'Unknown'

    df['country'] = df['ip'].apply(get_country)
    df['abnormal_country'] = df.apply(
        lambda x: x['country'] != normal_countries.get(x['username'], ''), axis=1
    )
    return df[df['abnormal_country']]

def main():
    if len(sys.argv) != 2:
        print("Usage: python detector.py logins.csv")
        sys.exit(1)

    filepath = sys.argv[1]
    df = load_logs(filepath)

    normal_countries = {
        'user1': 'India',
        'user2': 'United States'
    }

    reader = geoip2.database.Reader('GeoLite2-City.mmdb')

    brute_force = detect_brute_force(df)
    off_hours = detect_off_hours(df)
    abnormal_ips = detect_abnormal_ips(df, normal_countries, reader)

    brute_force.to_csv('brute_force.csv', index=False)
    off_hours.to_csv('off_hours.csv', index=False)
    abnormal_ips.to_csv('abnormal_ips.csv', index=False)

    print("✅ Detection complete! Results saved:")
    print("- brute_force.csv")
    print("- off_hours.csv")
    print("- abnormal_ips.csv")

if __name__ == '__main__':
    main()
