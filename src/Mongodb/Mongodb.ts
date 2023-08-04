import mongoose from "mongoose";
import { TestData } from "../TestData";
import { TestDatabase } from "../TestDatabase";
import { LocationModel } from "./Locations";
import { transformLocation, transformTestData } from "./Transformer";
import { Latitude, Longitude, delay } from "../utils";

export class MongoDB extends TestDatabase {
  uri?: string;
  constructor(uri?: string) {
    super();
    this.uri = uri;
  }

  name(): string {
    return "MongoDB";
  }

  async connect(uri?: string | undefined): Promise<void> {
    await mongoose.connect(
      uri ?? this.uri ?? "mongodb://localhost:27017/_benchmark_"
    );
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }

  async cleanup(): Promise<void> {
    await LocationModel.deleteMany({});
  }

  // Chunked insert to avoid OOM
  async create(data: TestData[]): Promise<void> {
    const chunkSize = 100000;
    const docs = data.map(transformTestData);
    let index = 0;
    while (index < docs.length) {
      const chunk = docs.slice(index, index + chunkSize);
      await LocationModel.insertMany(chunk);
      index += chunkSize;
    }
  }
  async prepare(): Promise<void> {
    await LocationModel.ensureIndexes();
  }

  async usageReport(): Promise<Object> {
    const stats = await mongoose.connection.db.stats();
    return JSON.stringify(stats);
  }

  async queryA(lng: Longitude, lat: Latitude): Promise<TestData> {
    const location = await LocationModel.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
        },
      },
    });
    return transformLocation(location!);
  }

  async queryB(
    lng: Longitude,
    lat: Latitude,
    maxDistance: number
  ): Promise<TestData[]> {
    const locations = await LocationModel.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistance * 1000, // convert to meter
        },
      },
    });
    return locations.map(transformLocation);
  }

  // MongoDB already sorts by distance by default, so we don't need to do anything here.
  async queryC(
    lng: Longitude,
    lat: Latitude,
    maxDistance: number
  ): Promise<TestData[]> {
    const locations = await LocationModel.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistance * 1000,
        },
      },
    });

    return locations.map(transformLocation);
  }
}
