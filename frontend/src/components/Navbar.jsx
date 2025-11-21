import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Navbar() {
  return (
    <AppBar position="static" sx={{ bgcolor: "#222" }}>
      <Toolbar>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Suspicious Login Detector
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
