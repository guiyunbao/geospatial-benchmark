import mongoose, { Schema } from "mongoose";
import { Point } from "geojson";

export type Location = {
  id: string;
  location: Point;
};

const pointSchema = new Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const schema = new Schema<Location>({
  id: String,
  location: {
    type: pointSchema,
    required: true,
    index: "2dsphere",
    _id: false,
  },
});

export const LocationModel = mongoose.model("Location", schema);
