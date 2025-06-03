"use client";

import React from "react";
import Header from "../components/Header";
import { PointCloudVisualization } from "../components/visualization";

export default function Home() {
  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      <Header />
      <PointCloudVisualization
        address="1250 Wildwood Road, Boulder, CO"
        bufferKm={1.0}
        initialViewState={{
          longitude: -105.2705,
          latitude: 40.015,
          zoom: 15,
          pitch: 60,
          bearing: 0,
        }}
      />
    </div>
  );
}
