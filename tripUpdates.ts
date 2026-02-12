import { load } from "protobufjs";

const TRIP_UPDATES_URL =
  "https://lbtgtfs.lbtransit.com/TMGTFSRealTimeWebService/TripUpdate/TripUpdates.pb";

export interface Arrival {
  routeId: string;
  stopId: string;
  arrivalTime: number; // Time formatted in yyyy-mm-ddThh:mm:ss.000Z" (time is in UTC)
  delay: number; // time in seconds
  vehicleID: string;
}

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

export async function getNextSingleArrivalForStop(targetStopId: string) {
  try {
    const url =
      "https://lbtgtfs.lbtransit.com/TMGTFSRealTimeWebService/TripUpdate/TripUpdates.pb";
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const bytes = new Uint8Array(await resp.arrayBuffer());
    const root = await load("./gtfs-realtime.proto");
    const FeedMessage = root.lookupType("transit_realtime.FeedMessage");
    const message = FeedMessage.decode(bytes) as any; // Decode the message bytes we recieved using protobuf

    // instantiate an arrival object and create vars for the time and delay, which we will return inside the arrival object
    let arrivalObj: Arrival = {};
    let arrivalTime = 0;
    let delaySec = 0;

    // Searches through each trip update in the message, finds the one with matching stopID
    message.entity.forEach((ent: any) => {
      if (ent.tripUpdate.stopTimeUpdate.stopID === targetStopId) {
        arrivalTime = stu.arrival?.time // store arrival time and delay time
          ? new Date(stu.arrival.time * 1000)
          : null;
        delaySec = stu.arrival?.delay ?? stu.departure?.delay ?? 0;
      }
    });

    // put all the data into the arrival object that we will then return
    arrivalObj = {
      stopId: targetStopId,
      routeId: routeId,
      arrivalTime: arrivalTime,
      delay: delaySec,
    };
    console.log(arrivalObj);
    return arrivalObj;
  } catch (err) {
    console.error("Error fetching arrivals:", err);
    return null;
  }
}
