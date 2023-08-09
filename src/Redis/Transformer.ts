import { TestData } from "../TestData";
import { isValidEPSG3857Lat, randomEPSG3857Lat } from "../utils";
import { LocationJson, LocationGeohash } from "./Locations";

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


export function transformTestDataGeohash(data: TestData): LocationGeohash {
    let lat = +data.lat;

    if (!isValidEPSG3857Lat(lat)) {
        lat = randomEPSG3857Lat();
    }

    return {
        longitude: +data.lng,
        latitude: lat,
        member: data.id
    };
}

export function transformLocationJson(location: LocationJson): TestData {
  return {
    id: location.id,
    lng: location.location.longitude,
    lat: location.location.latitude,
  };
}

export function transformLocationGeohash(location: any): TestData {
    return {
        id: location.member,
        lng: location.coordinates['longitude'],
        lat: location.coordinates['latitude'],
    };
}
