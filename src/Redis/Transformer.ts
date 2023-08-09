import { TestData } from "../TestData";
import { isValidEPSG3857Lat, randomEPSG3857Lat } from "../utils";
import { LocationJson } from "./Locations";

/**
 * Redis use EPSG:3857 (Web Mercator) projection, so transform the data out
 * of bound to random position for a fair test.
 */
export function transformTestDataJson(data: TestData): LocationJson {
  let lat = +data.lat;

  if (!isValidEPSG3857Lat(lat)) {
    lat = randomEPSG3857Lat();
  }

  return {
    id: data.id,
    location: {
      longitude: +data.lng,
      latitude: lat,
    },
  };
}

export function transformLocationJson(location: LocationJson): TestData {
  return {
    id: location.id,
    lng: location.location.longitude,
    lat: location.location.latitude,
  };
}
