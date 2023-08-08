import { Entity, Schema } from 'redis-om';


export type Location = {
    id: string,
    location: {
        "longitude": number,
        "latitude": number
    };
}


export const locationSchema = new Schema('location', {
    id: { type: 'string' },
    location: { type: 'point' },
});

