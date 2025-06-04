import { LASLoader } from "@loaders.gl/las";
import { load } from "@loaders.gl/core";
import proj4 from "proj4";
import { PointData } from "./types";

export class PointCloudDataProcessor {
  static async processLASFile(blob: Blob): Promise<PointData[]> {
    const data = await load(blob, LASLoader);
    const positions = data.attributes.POSITION?.value;

    // Check for interleaved RGB data in COLOR_0 (most common format from @loaders.gl/las)
    const colorValues = data.attributes.COLOR_0?.value;

    // Try different possible color attribute names - LAS files use 'red', 'green', 'blue'
    const redValues = data.attributes.red?.value || data.attributes.Red?.value;
    const greenValues =
      data.attributes.green?.value || data.attributes.Green?.value;
    const blueValues =
      data.attributes.blue?.value || data.attributes.Blue?.value;

    if (!positions) {
      throw new Error("No position data found in LAS file");
    }

    const numPoints = positions.length / 3;

    // Determine color bit depth
    let is16BitColors = false;

    if (
      colorValues &&
      (colorValues.length === numPoints * 4 ||
        colorValues.length === numPoints * 3)
    ) {
      // Check color value ranges to determine bit depth
      let minColor = colorValues[0];
      let maxColor = colorValues[0];
      for (let i = 1; i < Math.min(colorValues.length, 1000); i++) {
        if (colorValues[i] < minColor) minColor = colorValues[i];
        if (colorValues[i] > maxColor) maxColor = colorValues[i];
      }

      is16BitColors = maxColor > 255;
    }

    const pointData: PointData[] = [];

    for (let i = 0; i < numPoints; i++) {
      const posIdx = i * 3;

      let pointColor: [number, number, number];

      if (colorValues && colorValues.length === numPoints * 4) {
        // Use interleaved RGBA data from COLOR_0 (4 values per point: R, G, B, A)
        const colorIdx = i * 4;
        const red = colorValues[colorIdx];
        const green = colorValues[colorIdx + 1];
        const blue = colorValues[colorIdx + 2];

        // Convert based on detected bit depth
        if (is16BitColors) {
          // Convert from 16-bit (0-65535) to 8-bit (0-255) for DeckGL
          pointColor = [
            Math.round((red / 65535) * 255),
            Math.round((green / 65535) * 255),
            Math.round((blue / 65535) * 255),
          ];
        } else {
          // Values are already 8-bit (0-255), use them directly
          pointColor = [red, green, blue];
        }
      } else if (colorValues && colorValues.length === numPoints * 3) {
        // Use interleaved RGB data from COLOR_0 (3 values per point: R, G, B)
        const colorIdx = i * 3;
        const red = colorValues[colorIdx];
        const green = colorValues[colorIdx + 1];
        const blue = colorValues[colorIdx + 2];

        // Convert based on detected bit depth
        if (is16BitColors) {
          // Convert from 16-bit (0-65535) to 8-bit (0-255) for DeckGL
          pointColor = [
            Math.round((red / 65535) * 255),
            Math.round((green / 65535) * 255),
            Math.round((blue / 65535) * 255),
          ];
        } else {
          // Values are already 8-bit (0-255), use them directly
          pointColor = [red, green, blue];
        }
      } else if (redValues && greenValues && blueValues) {
        const red = redValues[i];
        const green = greenValues[i];
        const blue = blueValues[i];

        // Check if these are 16-bit values (likely if max > 255)
        const maxSeparateColor = Math.max(red, green, blue);
        if (maxSeparateColor > 255) {
          // Convert from 16-bit (0-65535) to 8-bit (0-255) for DeckGL
          pointColor = [
            Math.round((red / 65535) * 255),
            Math.round((green / 65535) * 255),
            Math.round((blue / 65535) * 255),
          ];
        } else {
          // Values are already 8-bit (0-255), use them directly
          pointColor = [red, green, blue];
        }
      } else if (redValues && redValues.length === numPoints * 3) {
        // Fallback: treat redValues as interleaved RGB
        const colorIdx = i * 3;
        const red = redValues[colorIdx];
        const green = redValues[colorIdx + 1];
        const blue = redValues[colorIdx + 2];

        // Check if these are 16-bit values
        const maxInterleavedColor = Math.max(red, green, blue);
        if (maxInterleavedColor > 255) {
          pointColor = [
            Math.round((red / 65535) * 255),
            Math.round((green / 65535) * 255),
            Math.round((blue / 65535) * 255),
          ];
        } else {
          pointColor = [red, green, blue];
        }
      } else {
        // No color data, use white
        pointColor = [255, 255, 255];
      }

      pointData.push({
        position: [
          positions[posIdx],
          positions[posIdx + 1],
          positions[posIdx + 2],
        ],
        color: pointColor,
      });
    }

    return pointData;
  }

  static transformCoordinates(pointData: PointData[]): {
    data: PointData[];
    center: [number, number];
    bounds: {
      minLon: number;
      maxLon: number;
      minLat: number;
      maxLat: number;
      minZ: number;
      maxZ: number;
    };
  } {
    if (pointData.length === 0) {
      return {
        data: pointData,
        center: [-105.2705, 40.015],
        bounds: {
          minLon: -105.2705,
          maxLon: -105.2705,
          minLat: 40.015,
          maxLat: 40.015,
          minZ: 0,
          maxZ: 0,
        },
      };
    }

    const xCoords = pointData.map((p) => p.position[0]);
    const yCoords = pointData.map((p) => p.position[1]);
    const zCoords = pointData.map((p) => p.position[2]);
    const centerX = (Math.min(...xCoords) + Math.max(...xCoords)) / 2;
    const centerY = (Math.min(...yCoords) + Math.max(...yCoords)) / 2;

    // Check if these look like UTM coordinates (typically 6-7 digits)
    if (Math.abs(centerX) > 180 || Math.abs(centerY) > 90) {
      // Assume UTM Zone 13N for Boulder, Colorado
      const utmProjection = "+proj=utm +zone=13 +datum=WGS84 +units=m +no_defs";
      const wgs84Projection = "+proj=longlat +datum=WGS84 +no_defs";

      // Transform all points
      const transformedPointData: PointData[] = pointData.map((point) => {
        const [x, y, z] = point.position;
        const [lon, lat] = proj4(utmProjection, wgs84Projection, [x, y]);
        return {
          position: [lon, lat, z],
          color: point.color,
        };
      });

      // Calculate bounds and center of transformed data
      const lons = transformedPointData.map((p) => p.position[0]);
      const lats = transformedPointData.map((p) => p.position[1]);
      const zs = transformedPointData.map((p) => p.position[2]);

      const bounds = {
        minLon: Math.min(...lons),
        maxLon: Math.max(...lons),
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
        minZ: Math.min(...zs),
        maxZ: Math.max(...zs),
      };

      const centerLon = (bounds.minLon + bounds.maxLon) / 2;
      const centerLat = (bounds.minLat + bounds.maxLat) / 2;

      return {
        data: transformedPointData,
        center: [centerLon, centerLat],
        bounds,
      };
    }

    // For already transformed coordinates
    const bounds = {
      minLon: Math.min(...xCoords),
      maxLon: Math.max(...xCoords),
      minLat: Math.min(...yCoords),
      maxLat: Math.max(...yCoords),
      minZ: Math.min(...zCoords),
      maxZ: Math.max(...zCoords),
    };

    return { data: pointData, center: [centerX, centerY], bounds };
  }

  static calculateOptimalZoom(bounds: {
    minLon: number;
    maxLon: number;
    minLat: number;
    maxLat: number;
    minZ: number;
    maxZ: number;
  }): number {
    // Calculate the extent of the data in degrees
    const latExtent = bounds.maxLat - bounds.minLat;
    const lonExtent = bounds.maxLon - bounds.minLon;

    // Use the larger extent to determine zoom level
    const maxExtent = Math.max(latExtent, lonExtent);

    // Zoom level mapping based on extent
    // These values are empirically determined for good visibility
    if (maxExtent > 0.1) return 10; // Very large area
    if (maxExtent > 0.05) return 12; // Large area
    if (maxExtent > 0.01) return 14; // Medium area
    if (maxExtent > 0.005) return 16; // Small area
    if (maxExtent > 0.001) return 18; // Very small area
    return 20; // Extremely small area
  }

  static getTestData(): PointData[] {
    return [
      { position: [-105.2705, 40.015, 1000], color: [255, 0, 0] },
      { position: [-105.27, 40.016, 1100], color: [0, 255, 0] },
      { position: [-105.271, 40.014, 1200], color: [0, 0, 255] },
    ];
  }
}
