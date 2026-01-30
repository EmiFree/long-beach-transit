import { load } from "protobufjs";

const TRIP_UPDATES_URL =
  "https://lbtgtfs.lbtransit.com/TMGTFSRealTimeWebService/TripUpdate/TripUpdates.pb";

export async function fetchTripUpdates() {
  try {
    const response = await fetch(TRIP_UPDATES_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching trip updates`);
    }

    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Load proto from local file
    const root = await load("./gtfs-realtime.proto");
    const FeedMessage = root.lookupType("transit_realtime.FeedMessage");

    const message = FeedMessage.decode(bytes) as any;

    console.log(`Number of trip update entities: ${message.entity.length}\n`);

    return message;
  } catch (err) {
    console.error("Error in trip updates:", err);
  }
}

// Get the next arrivals for the specified stop.
// See ./info/stops.txt for stop IDs
export async function getNextArrivalsForStop(targetStopId: string) {
  try {
    const url =
      "https://lbtgtfs.lbtransit.com/TMGTFSRealTimeWebService/TripUpdate/TripUpdates.pb";
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const bytes = new Uint8Array(await resp.arrayBuffer());

    const root = await load("./gtfs-realtime.proto");
    const FeedMessage = root.lookupType("transit_realtime.FeedMessage");
    const message = FeedMessage.decode(bytes) as any;

    const arrivals: any[] = [];

    message.entity.forEach((entity: any) => {
      if (entity.tripUpdate) {
        const tu = entity.tripUpdate;
        const routeId = tu.trip?.routeId ?? "?";
        const tripId = tu.trip?.tripId ?? "?";
        const vehicleId = tu.vehicle?.id ?? "unassigned";

        tu.stopTimeUpdate?.forEach((stu: any) => {
          if (stu.stopId === targetStopId) {
            const arrivalTime = stu.arrival?.time
              ? new Date(stu.arrival.time * 1000)
              : null;
            const delaySec = stu.arrival?.delay ?? stu.departure?.delay ?? 0;
            arrivals.push({
              route: routeId,
              trip: tripId,
              vehicle: vehicleId,
              stopSequence: stu.stopSequence,
              arrival: arrivalTime?.toISOString(),
              delaySeconds: delaySec,
            });
          }
        });
      }
    });

    return arrivals;
  } catch (err) {
    console.error("Error fetching arrivals:", err);
    return [];
  }
}
