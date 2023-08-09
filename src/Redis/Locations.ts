import { Schema } from "redis-om";

export type LocationJson = {
    id: string,
    location: {
        "longitude": number,
        "latitude": number
    };
}

export const locationSchema = new Schema("location", {
  id: { type: "string" },
  location: { type: "point" },
});
