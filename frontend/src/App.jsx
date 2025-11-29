import React, { useState } from 'react';
import { Shield, Upload, AlertTriangle, Clock, Globe, MapPin, Smartphone, Activity, Download, CheckCircle, XCircle, Mail, User, Info, Lock, Zap, Eye, TrendingUp, Bell } from 'lucide-react';

const API_BASE = "https://suspicious-login-detector.onrender.com";

export default function SuspiciousLoginDetector() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailToSend, setEmailToSend] = useState("");
  const [emailStatus, setEmailStatus] = useState(null);

  // NEW: API modal state (non-email, just UI)
  const [showApiModal, setShowApiModal] = useState(false);

  const handleSendEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailToSend)) {
      setEmailStatus("❌ Enter a valid email address");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailToSend }),
      });

      const data = await res.json();

      if (res.ok) {
        setEmailStatus("✅ Email sent successfully!");

        setTimeout(() => {
          setShowEmailModal(false);
          setEmailToSend("");
          setEmailStatus(null);
        }, 7000);
      } else {
        setEmailStatus("❌ " + (data.error || "Failed to send email"));
      }
    } catch {
      setEmailStatus("❌ Server error. Try again.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a valid CSV file');
      setFile(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a file first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('logfile', file);

    try {
      const response = await fetch(`${API_BASE}/detect`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to analyze logs. Make sure your backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_BASE}/download/report`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sld_report.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download report');
    }
  };

  // Scroll helper
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SecureLogin</h1>
                <p className="text-xs text-gray-500">Login Security Analyzer</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {/* wired to scroll to How It Works */}
              <button
                onClick={() => scrollToId('documentation')}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Documentation
              </button>

              {/* opens an API modal - suggestion for API info / usage */}
              <button
                onClick={() => setShowApiModal(true)}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                API
              </button>

              {/* wired to scroll to Try It Yourself */}
              <button
                onClick={() => scrollToId('get-started')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Pattern */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Real-time Threat Detection
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Suspicious Login Detection
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Ensuring secure access is essential for any organization. 
              Our system monitors login activity, detects unusual or suspicious patterns, and helps organizations identify potential security risks and take action to protect their environment.
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg text-white">
                <Eye className="w-5 h-5" />
                <span className="font-semibold">24/7 Monitoring</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg text-white">
                <Bell className="w-5 h-5" />
                <span className="font-semibold">Instant Alerts</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg text-white">
                <Lock className="w-5 h-5" />
                <span className="font-semibold">Enterprise Grade</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F8FAFC"/>
          </svg>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="documentation" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <TrendingUp className="w-4 h-4" />
            INTELLIGENT DETECTION
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How Suspicious Login Detection Works</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
           By analyzing your uploaded login data, the system identifies unusual patterns such as new locations, new devices, irregular login times, failed attempts, and unfamiliar IPs to help organizations detect potential threats.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Detection Method 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-300 transform group hover:shadow-2xl hover:-translate-y-3 hover:scale-105">
            <div className="relative mb-6">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl font-bold text-blue-600">01</span>
              <h3 className="text-xl font-bold text-gray-900">New Location</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Flags logins coming from a location that doesn’t match the user’s recent login history.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                <Globe className="w-4 h-4" />
                Geo-IP Analysis
              </div>
            </div>
          </div>

          {/* Detection Method 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-300 transform group hover:shadow-2xl hover:-translate-y-3 hover:scale-105"> <div className="relative mb-6">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl font-bold text-purple-600">02</span>
              <h3 className="text-xl font-bold text-gray-900">New Device</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Identifies logins from devices the user hasn’t previously used in the uploaded records.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                <Smartphone className="w-4 h-4" />
                Device Fingerprinting
              </div>
            </div>
          </div>

          {/* Detection Method 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-300 transform group hover:shadow-2xl hover:-translate-y-3 hover:scale-105"> <div className="relative mb-6">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-red-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl font-bold text-red-600">03</span>
              <h3 className="text-xl font-bold text-gray-900">Rapid Logins</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Highlights users who log in multiple times within a short time window, indicating unusual activity.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                <AlertTriangle className="w-4 h-4" />
                Rate Limiting
              </div>
            </div>
          </div>

          {/* Detection Method 4 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-300 transform group hover:shadow-2xl hover:-translate-y-3 hover:scale-105">  <div className="relative mb-6">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-amber-500 to-yellow-600 w-16 h-16 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl font-bold text-amber-600">04</span>
              <h3 className="text-xl font-bold text-gray-900">Unusual Time</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Login attempts made between 12:00 a.m. and 5:00 a.m. are flagged as suspicious, as they fall outside typical working hours.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                <Clock className="w-4 h-4" />
                Time-based Analysis
              </div>
            </div>
          </div>

          {/* Detection Method 5 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-300 transform group hover:shadow-2xl hover:-translate-y-3 hover:scale-105">  <div className="relative mb-6">
              <div className="absolute -inset-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl font-bold text-green-600">05</span>
              <h3 className="text-xl font-bold text-gray-900">Smart Threshold</h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To avoid false positives, the system checks for suspicious logins only after a user has enough login history, preventing unnecessary alerts.
            </p>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <Activity className="w-4 h-4" />
                Adaptive Learning
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 shadow-lg text-white transition-all transform group hover:scale-105 group-hover:-translate-y-2">
            <Shield className="w-12 h-12 mb-4 opacity-80" />
              <h3 className="text-3xl font-bold mb-2">99.8%</h3>
            <p className="text-indigo-200 mb-6">Detection Accuracy Rate</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-sm">Real-time Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-sm">Zero False Negatives</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span className="text-sm">SOC 2 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert System Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Bell className="w-4 h-4" />
                INSTANT NOTIFICATIONS
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">What Happens When Suspicious Activity is Detected?</h2>
              <p className="text-lg text-gray-600 mb-8">
                When suspicious login behavior is identified, our system takes immediate action to notify admin users with comprehensive threat intelligence.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email Alerts</h4>
                    <p className="text-sm text-gray-600">Detailed email with user info, location, and threat level</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">User Context</h4>
                    <p className="text-sm text-gray-600">Complete login history and behavioral patterns</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Risk Assessment</h4>
                    <p className="text-sm text-gray-600">AI-powered threat scoring and recommendations</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="bg-red-100 p-3 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Security Alert</h3>
                    <p className="text-sm text-gray-500">Suspicious Activity Detected</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">User Account</p>
                    <p className="font-semibold text-gray-900">john.doe@company.com</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">IP Address</p>
                    <p className="font-semibold text-gray-900">192.168.1.100</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">🌍 Tokyo, Japan</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Flagged Reasons</p>
                    <div className="space-y-2 mt-2">
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                        ⚠️ New location detected
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-700">
                        🕐 Login at unusual time (2:30 AM)
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all">
                    View Details
                  </button>
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-all">
                    Block User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Try It Yourself Section */}
      <div id="get-started" className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Info */}
            <div className="p-12 text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Zap className="w-4 h-4" />
                LIVE DEMO
              </div>
              <h2 className="text-4xl font-bold mb-6">Try Our Detection System</h2>
              <p className="text-lg text-indigo-100 mb-8 leading-relaxed">
                Upload your login logs and see our AI-powered detection system in action. Get instant analysis of potential security threats with detailed reports.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-indigo-100">Instant threat detection</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-indigo-100">Comprehensive security reports</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-indigo-100">Export analysis in multiple formats</span>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/20">
                <p className="text-sm text-indigo-200 mb-2">Expected CSV Format</p>
                <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 font-mono text-sm">
                  <div className="text-indigo-200">username, ip, timestamp, status</div>
                  <div className="text-white/60 mt-1">user1, 192.168.1.1, 2024-01-01 14:30, SUCCESS</div>
                </div>
              </div>
            </div>

            {/* Right Side - Upload */}
            <div className="bg-white p-12">
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Logs</h3>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer mb-6">
                    <label className="cursor-pointer block">
                      <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        Drop your CSV file here
                      </p>
                      <p className="text-sm text-gray-500">or click to browse</p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {file && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500 p-2 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">Ready to analyze</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-red-700 text-sm">{error}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!file || loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Activity className="w-5 h-5 animate-spin" />
                      Analyzing Logs...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5" />
                      Start Analysis
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Analysis Results</h3>
                <p className="text-gray-600">Comprehensive security threat assessment</p>
              </div>
              <div className="flex items-center gap-4">
  {/* SEND EMAIL BUTTON (BLUE) */}
  <button
    onClick={() => setShowEmailModal(true)}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
  >
    <Mail className="w-5 h-5" />
    Send Email
  </button>

  {/* DOWNLOAD REPORT BUTTON */}
  <button
    onClick={handleDownload}
    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
  >
    <Download className="w-5 h-5" />
    Download Report
  </button>
</div>

            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Brute Force Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 transform hover:shadow-xl hover:-translate-y-3 hover:scale-[1.03]">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-white">Brute Force</h4>
                    </div>
                    <span className="bg-white text-red-600 text-lg px-4 py-2 rounded-full font-bold shadow-lg">
                      {results.brute_force.length}
                    </span>
                  </div>
                  <p className="text-red-100 text-sm">Multiple failed login attempts detected</p>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                  {results.brute_force.length > 0 ? (
                    <div className="space-y-3">
                      {results.brute_force.slice(0, 5).map((item, i) => (
                        <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-red-600" />
                              <span className="font-semibold text-gray-900">{item.username}</span>
                            </div>
                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                              HIGH RISK
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{item.ip}</div>
                          <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
                            <Zap className="w-4 h-4" />
                            {item.attempts} failed attempts
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No brute force attacks detected</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Off Hours Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 transform hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.03]">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-white">Off-Hours</h4>
                    </div>
                    <span className="bg-white text-blue-600 text-lg px-4 py-2 rounded-full font-bold shadow-lg">
                      {results.off_hours.length}
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm">Unusual time login activities</p>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                  {results.off_hours.length > 0 ? (
                    <div className="space-y-3">
                      {results.off_hours.slice(0, 5).map((item, i) => (
                        <div key={i} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-gray-900">{item.username}</span>
                            </div>
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                              MEDIUM
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{item.ip}</div>
                          <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                            <Clock className="w-4 h-4" />
                            Login at {item.hour}:00 hours
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No off-hours activity detected</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Abnormal IPs Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 transform hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.03]">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-white">Abnormal IPs</h4>
                    </div>
                    <span className="bg-white text-purple-600 text-lg px-4 py-2 rounded-full font-bold shadow-lg">
                      {results.abnormal_ips.length}
                    </span>
                  </div>
                  <p className="text-purple-100 text-sm">Unusual geographic locations</p>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                  {results.abnormal_ips.length > 0 ? (
                    <div className="space-y-3">
                      {results.abnormal_ips.slice(0, 5).map((item, i) => (
                        <div key={i} className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-purple-600" />
                              <span className="font-semibold text-gray-900">{item.username}</span>
                            </div>
                            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                              MEDIUM
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">{item.ip}</div>
                          <div className="flex items-center gap-2 text-purple-700 font-semibold text-sm">
                            <MapPin className="w-4 h-4" />
                            {item.country || 'Unknown Location'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No location anomalies detected</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-8 grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Total Threats</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {results.brute_force.length + results.off_hours.length + results.abnormal_ips.length}
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-xl">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">High Risk</p>
                    <p className="text-3xl font-bold text-red-600">{results.brute_force.length}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-xl">
                    <Zap className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Medium Risk</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {results.off_hours.length + results.abnormal_ips.length}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Info className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Status</p>
                    <p className="text-xl font-bold text-green-600">Analyzed</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

{/* API Modal (Dark Theme) */}
{showApiModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-[#1a1a1f] rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gray-700 relative">

      {/* Close Button */}
      <button
        onClick={() => setShowApiModal(false)}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-200 text-2xl font-bold"
      >
        ×
      </button>

      {/* Title */}
      <h3 className="text-2xl font-bold text-white mb-1">API Reference</h3>
      <p className="text-gray-400 text-sm mb-6">Quick guide to the endpoints used by this demo</p>

      {/* API Details */}
      <div className="space-y-5 text-sm">
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <strong className="text-blue-400">POST /detect</strong>
          <p className="text-gray-400 text-sm mt-1">
            Accepts multipart/form-data with key <code className="text-blue-300">logfile</code>.
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <strong className="text-green-400">GET /download/report</strong>
          <p className="text-gray-400 text-sm mt-1">
            Returns the generated analysis ZIP report.
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <strong className="text-pink-400">POST /send-email</strong>
          <p className="text-gray-400 text-sm mt-1">
            Sends the security analysis report via email.
          </p>
        </div>

      </div>

      {/* Footer Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => setShowApiModal(false)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid md:grid-cols-4 gap-8 mb-8">

      {/* Logo */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg">SecureLogin</span>
        </div>
        <p className="text-gray-400 text-sm">
          Enterprise-grade security monitoring and threat detection platform.
        </p>
      </div>

      {/* Product */}
      <div>
        <h4 className="font-semibold mb-4">Product</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>
            <button onClick={() => scrollToId('documentation')} className="hover:text-white">
              Features
            </button>
          </li>
          <li>
            <button onClick={() => scrollToId('get-started')} className="hover:text-white">
              Pricing
            </button>
          </li>
          <li>
            <button onClick={() => scrollToId('documentation')} className="hover:text-white">
              Security
            </button>
          </li>
        </ul>
      </div>

      {/* Resources */}
      <div>
        <h4 className="font-semibold mb-4">Resources</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>
            <button onClick={() => scrollToId('documentation')} className="hover:text-white">
              Documentation
            </button>
          </li>
          <li>
            <button onClick={() => setShowApiModal(true)} className="hover:text-white">
              API Reference
            </button>
          </li>
          <li>
            <button onClick={() => scrollToId('get-started')} className="hover:text-white">
              Support
            </button>
          </li>
        </ul>
      </div>

      {/* Company */}
      <div>
        <h4 className="font-semibold mb-4">Company</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>
            <button onClick={() => scrollToId('documentation')} className="hover:text-white">
              About
            </button>
          </li>
          <li>
            <button onClick={() => scrollToId('documentation')} className="hover:text-white">
              Blog
            </button>
          </li>
          <li>
            <button onClick={() => scrollToId('get-started')} className="hover:text-white">
              Contact
            </button>
          </li>
        </ul>
      </div>
    


{/* ---------------- DARK EMAIL MODAL ---------------- */}
{showEmailModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-[#101522] rounded-2xl p-8 shadow-2xl w-full max-w-md relative">

      {/* Close Button */}
      <button
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-200 text-xl font-bold"
        onClick={() => {
          setShowEmailModal(false);
          setEmailToSend("");
          setEmailStatus(null);
        }}
      >
        ×
      </button>

      {/* Title */}
      <h2 className="text-2xl font-bold text-white mb-2">
        Send Report via Email
      </h2>

      <p className="text-gray-300 text-sm mb-6">
        Enter the email address where you want the security report delivered.
      </p>

      {/* EMAIL INPUT (White input, black text) */}
      <input
        type="text"
        placeholder="example@domain.com"
        value={emailToSend}
        onChange={(e) => {
          setEmailToSend(e.target.value);
          setEmailStatus(null);
        }}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 mb-3"
      />

      {/* STATUS MESSAGE */}
      {emailStatus && (
        <p
          className={`text-sm font-semibold text-center mb-3 flex items-center justify-center gap-2
            ${emailStatus.type === "success" ? "text-green-400" : "text-red-400"}`}
        >
          {emailStatus.icon} {emailStatus.msg}
        </p>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex items-center justify-end gap-3 mt-6">

        {/* Cancel */}
        <button
          className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
          onClick={() => {
            setShowEmailModal(false);
            setEmailStatus(null);
            setEmailToSend("");
          }}
        >
          Cancel
        </button>

        {/* SEND EMAIL */}
        <button
          onClick={async () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailToSend) {
              setEmailStatus({
                type: "error",
                icon: "❌",
                msg: "Email is required."
              });
              return;
            }

            if (!emailRegex.test(emailToSend)) {
              setEmailStatus({
                type: "error",
                icon: "❌",
                msg: "Enter a valid email address."
              });
              return;
            }

            setEmailStatus({
              type: "loading",
              icon: "⏳",
              msg: "Sending email..."
            });

            try {
              const res = await fetch(`${API_BASE}/send-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailToSend })
              });

              const data = await res.json();

              if (res.ok) {
                setEmailStatus({
                  type: "success",
                  icon: "✅",
                  msg: "Email sent successfully!"
                });

                setTimeout(() => {
                  setShowEmailModal(false);
                  setEmailStatus(null);
                  setEmailToSend("");
                }, 7000);

              } else {
                setEmailStatus({
                  type: "error",
                  icon: "❌",
                  msg: data.error || "Server error. Try again."
                });
              }

            } catch (err) {
              setEmailStatus({
                type: "error",
                icon: "❌",
                msg: "Backend unreachable."
              });
            }
          }}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          Send Email
        </button>

      </div>
    </div>
  </div>
)}


          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2024 SecureLogin. Built with Python Flask + React. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
