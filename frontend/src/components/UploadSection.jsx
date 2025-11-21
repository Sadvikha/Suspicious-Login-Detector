import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";

export default function UploadSection({ setResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function uploadFile() {
    if (!file) return alert("Please upload a CSV file!");

    setLoading(true);
    const formData = new FormData();
    formData.append("logfile", file);

    try {
      const res = await axios.post("http://127.0.0.1:5000/detect", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);   // <-- CORRECT
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check backend.");
    }

    setLoading(false);
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
        Upload Log File
      </Typography>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ marginBottom: "14px" }}
      />

      <Button
        variant="contained"
        color="success"
        startIcon={<CloudUploadIcon />}
        onClick={uploadFile}
      >
        {loading ? "Processing..." : "Upload & Analyze"}
      </Button>
    </Box>
  );
}
