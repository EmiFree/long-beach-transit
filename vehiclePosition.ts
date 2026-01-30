import { load } from "protobufjs";

const VEHICLE_POSITIONS_URL =
  "https://lbtgtfs.lbtransit.com/TMGTFSRealTimeWebService/Vehicle/VehiclePositions.pb";

export async function fetchVehiclePositions() {
  try {
    const response = await fetch(VEHICLE_POSITIONS_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching vehicle positions`);
    }

    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Load the proto definition from local file
    const root = await load("./gtfs-realtime.proto"); // adjust path if needed, e.g. "./proto/gtfs-realtime.proto"
    const FeedMessage = root.lookupType("transit_realtime.FeedMessage");

    const message = FeedMessage.decode(bytes) as any;

    console.log(
      `Vehicle Positions Feed timestamp: ${new Date(message.header.timestamp * 1000).toISOString()}`,
    );
    console.log(`Number of vehicle entities: ${message.entity.length}\n`);

    // Show first 5-8 vehicles as example
    message.entity.slice(0, 8).forEach((entity: any) => {
      if (entity.vehicle) {
        const v = entity.vehicle;
        console.log(`Vehicle ID: ${v.vehicle?.id ?? "unknown"}`);
        console.log(
          `  Route ID: ${v.trip?.routeId ?? "?"}   Trip ID: ${v.trip?.tripId ?? "?"}`,
        );
        console.log(
          `  Position: ${v.position?.latitude?.toFixed(6) ?? "??"} , ${v.position?.longitude?.toFixed(6) ?? "??"}`,
        );
        console.log(
          `  Speed: ${v.position?.speed?.toFixed(1) ?? "n/a"} m/s   Bearing: ${v.position?.bearing?.toFixed(0) ?? "n/a"}°`,
        );
        console.log(
          `  Stop ID (current/next): ${v.currentStopSequence ? (v.stopId ?? "n/a") : "en route"}`,
        );
        console.log("---");
      }
    });
  } catch (err) {
    console.error("Error in vehicle positions:", err);
  }
}
