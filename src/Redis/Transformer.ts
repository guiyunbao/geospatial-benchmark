import { TestData } from "../TestData";
import { Location } from "./Locations";

/**
 * Redis use EPSG:3857 (Web Mercator) projection, so transform the data out
 * of bound to random position for a fair test.
 */
export function transformTestData(data: TestData): Location {
    let lat = +data.lat;
    const latLimit = 85.05112878;

    if( Math.abs(lat) >= latLimit ) {
        lat = (latLimit * Math.random()) * (Math.random() > 0.5 ? 1 : -1);
    }

    return {
        id: data.id,
        location: {
            longitude: +data.lng,
            latitude: lat
        },
    };
}

export function transformLocation(location: Location): TestData {
    return {
        id: location.id,
        lng: location.location['longitude'],
        lat: location.location['latitude'],
    };
}
