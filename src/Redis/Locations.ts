import { Schema } from "redis-om";

export type LocationJson = {
    id: string,
    location: {
        "longitude": number,
        "latitude": number
    };
}

export type LocationGeohash = {
    longitude: number,
    latitude: number,
    member: string
}


export const locationSchema = new Schema('location', {
    id: { type: 'string' },
    location: { type: 'point' },
});
