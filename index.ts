import { fetchVehiclePositions } from "./vehiclePosition";
import {
  fetchTripUpdates,
  getNextArrivalsForStop,
  getNextSingleArrivalForStop,
  Arrival,
} from "./tripUpdates";

async function main() {
  console.log("=== Fetching Long Beach Transit Realtime Data ===\n");

  console.log("Trip Udpdates:");
  let message = await fetchTripUpdates();
  // see ./info/stops.txt for stop IDs
  let arrivals = await getNextArrivalsForStop("1316");
  if (arrivals.length === 0) {
    console.log(`No upcoming arrivals found for Broadway & Atlantic}`);
  } else {
    console.log(`Next arrivals at Broadway & Atlantic`);
    arrivals.forEach((a) => console.log(a));
  }
  arrivals = await getNextArrivalsForStop("4002");
  if (arrivals.length === 0) {
    console.log(`No upcoming arrivals found for 7th & Atlantic}`);
  } else {
    console.log(`Next arrivals at 7th & Atlantic`);
    arrivals.forEach((a) => console.log(a));
  }

  let arrival = await getNextSingleArrivalForStop("0808");
  console.log(`Next arrival at 7th & Atlantic: ${arrival.routeId}`);
}

main().catch((err) => {
  console.error("Main execution failed:", err);
});
