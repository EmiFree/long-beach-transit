import { fetchVehiclePositions } from "./vehiclePosition";
import { fetchTripUpdates, getNextArrivalsForStop } from "./tripUpdates";

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
  arrivals = await getNextArrivalsForStop("0808");
  if (arrivals.length === 0) {
    console.log(`No upcoming arrivals found for 7th & Atlantic}`);
  } else {
    console.log(`Next arrivals at 7th & Atlantic`);
    arrivals.forEach((a) => console.log(a));
  }
}

main().catch((err) => {
  console.error("Main execution failed:", err);
});
