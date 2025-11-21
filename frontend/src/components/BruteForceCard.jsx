import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

export default function BruteForceCard({ data }) {
  return (
    <Card sx={{ mt: 3, bgcolor: "#1c1c1c", color: "white" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Brute Force Attempts
        </Typography>

        <pre>{JSON.stringify(data, null, 2)}</pre>
      </CardContent>
    </Card>
  );
}
