import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import UploadSection from "./components/UploadSection";
import BruteForceCard from "./components/BruteForceCard";
import OffHoursCard from "./components/OffHoursCard";
import AbnormalIPCard from "./components/AbnormalIPCard";
import ResultCharts from "./components/ResultCharts";

const App = () => {
  const [result, setResult] = useState(null);

  return (
    <div style={{ background: "#111", minHeight: "100vh", color: "white" }}>
      <Navbar />

      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Upload Section */}
        <UploadSection setResult={setResult} />

        {/* Dashboard Grid */}
        {result && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: "25px",
              marginTop: "30px",
            }}
          >
            {/* LEFT SIDE – All detection results */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <BruteForceCard data={result.brute_force || []} />
              <OffHoursCard data={result.off_hours || []} />
              <AbnormalIPCard data={result.abnormal_ips || []} />
            </div>

            {/* RIGHT SIDE – Charts */}
            <div>
              <ResultCharts results={result} />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default App;
