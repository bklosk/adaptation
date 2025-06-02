"use client";

import { useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import { PointCloudLayer } from "@deck.gl/layers";
import { LASLoader } from "@loaders.gl/las";
import { load } from "@loaders.gl/core";

interface PointData {
  position: number[];
  color: number[];
}

export default function Home() {
  const [pointCloudData, setPointCloudData] = useState<PointData[]>([]);
  const [status, setStatus] = useState<string>("Loading...");

  useEffect(() => {
    const address = "1250 wildwood rd, boulder, CO";

    fetch("http://localhost:8000/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ address }),
    })
      .then(async (res) => {
        console.log("Response status:", res.status);
        console.log("Response headers:", [...res.headers.entries()]);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error response body:", errorText);
          throw new Error(
            `HTTP ${res.status}: ${res.statusText} - ${errorText}`
          );
        }
        return res.json();
      })
      .then((data) => {
        console.log("Success response:", data);
        pollJobStatus(data.job_id);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setStatus(`Error starting job: ${error.message}`);
      });
  }, []);

  const pollJobStatus = async (id: string) => {
    const poll = async () => {
      try {
        const res = await fetch(`http://localhost:8000/job/${id}`);
        const job = await res.json();
        setStatus(job.status);

        if (job.status === "completed" && job.output_file) {
          const fileRes = await fetch(`http://localhost:8000/download/${id}`);
          const blob = await fileRes.blob();
          const data = await load(blob, LASLoader);

          const positions = data.attributes.POSITION.value;
          const colors = data.attributes.COLOR_0?.value;
          const numPoints = positions.length / 3; // Assuming x,y,z for each point
          const pointData: PointData[] = [];

          for (let i = 0; i < numPoints; i++) {
            const posIdx = i * 3;
            pointData.push({
              position: [
                positions[posIdx],
                positions[posIdx + 1],
                positions[posIdx + 2],
              ],
              color: colors
                ? [colors[posIdx], colors[posIdx + 1], colors[posIdx + 2]]
                : [255, 255, 255],
            });
          }

          setPointCloudData(pointData);
        } else if (job.status === "failed") {
          setStatus("Failed: " + job.error_message);
        } else if (job.status !== "completed") {
          setTimeout(poll, 2000);
        }
      } catch {
        setStatus("Polling error");
      }
    };
    poll();
  };

  const layers = [
    new PointCloudLayer({
      id: "point-cloud",
      data: pointCloudData,
      getPosition: (d: PointData) => d.position as [number, number, number],
      getColor: (d: PointData) => d.color as [number, number, number],
      pointSize: 2,
    }),
  ];

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
      <DeckGL
        initialViewState={{
          longitude: -105.2705,
          latitude: 40.015,
          zoom: 15,
          pitch: 60,
          bearing: 0,
        }}
        controller={true}
        layers={layers}
      />
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          background: "white",
          padding: 10,
        }}
      >
        Status: {status} | Points: {pointCloudData.length}
      </div>
    </div>
  );
}
