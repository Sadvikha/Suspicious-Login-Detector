import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

export default function ResultCharts({ results }) {
  return (
    <Card sx={{ mt: 3, bgcolor: "#1c1c1c", color: "white" }}>
      <CardContent>
        <Typography variant="h6">
          Charts (Coming Next)
        </Typography>

        <p>We will add bar charts, pie charts, and geo-location here.</p>
      </CardContent>
    </Card>
  );
}
