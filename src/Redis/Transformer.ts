import { TestData } from "../TestData";
import { Location } from "./Locations";

export function transformTestData(data: TestData): Location | null {
    return data ? {
        id: data.id,
        location: {
            longitude: +data.lng,
            latitude: +data.lat
        },
    } : null;
}

export function transformLocation(location: Location): TestData {
    return {
        id: location.id,
        lng: location.location['longitude'],
        lat: location.location['latitude'],
    };
}