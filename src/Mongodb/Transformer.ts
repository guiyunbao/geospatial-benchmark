import { TestData } from "../TestData";
import { Location } from "./Locations";

export function transformTestData(data: TestData): Location {
  return {
    id: data.id,
    location: {
      type: "Point",
      coordinates: [data.lng, data.lat],
    },
  };
}

export function transformLocation(location: Location): TestData {
  return {
    id: location.id,
    lng: location.location.coordinates[0],
    lat: location.location.coordinates[1],
  };
}
