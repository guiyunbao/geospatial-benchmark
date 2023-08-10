import { createClient, GeoReplyWith } from "redis";
import { TestData } from "../TestData";
import { TestDatabase } from "../TestDatabase";
import {
  transformLocationGeohash,
  transformTestDataGeohash,
} from "./Transformer";
import { Latitude, Longitude } from "../utils";

export class RedisGeohash extends TestDatabase {
  uri: string;
  redis: ReturnType<typeof createClient>;

  constructor(uri?: string) {
    super();
    this.uri = uri ?? "redis://127.0.0.1:6380";
    this.redis = createClient({
      url: this.uri,
    });
  }

  name(): string {
    return "RedisGeohash";
  }

  async connect(uri?: string | undefined): Promise<void> {
    await this.redis.connect();
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }

  async cleanup(): Promise<void> {
    await this.redis.flushAll();
  }

  // Chunked insert to avoid OOM
  async create(data: Array<TestData>): Promise<void> {
    const chunkSize = 100000;
    const docs = data.map(transformTestDataGeohash);
    let index = 0;
    while (index < docs.length) {
      const chunk = docs.slice(index, index + chunkSize);
      await this.redis.GEOADD("location", chunk);
      index += chunkSize;
    }
  }

  async prepare(): Promise<void> {
    await this.redis.bgSave();
  }

  async usageReport(): Promise<Object> {
    let stats = await this.redis.info("memory");
    stats += await this.redis.info("persistence");
    return JSON.stringify(stats);
  }

  async queryA(lng: Longitude, lat: Latitude): Promise<TestData> {
    const closestLimit = 100;
    const locations = await this.redis.geoSearchWith(
      "location",
      { latitude: lat, longitude: lng },
      { radius: closestLimit, unit: "km" },
      [GeoReplyWith.COORDINATES, GeoReplyWith.DISTANCE],
      { SORT: "ASC", COUNT: 1 }
    );
    return (
      (locations as any).map(transformLocationGeohash)[0] ?? {
        id: `Out_Of_Range(${closestLimit}km)`,
        lng: 0,
        lat: 0,
      }
    );
  }

  async queryB(
    lng: Longitude,
    lat: Latitude,
    maxDistance: number
  ): Promise<Array<TestData>> {
    const locations = await this.redis.geoSearchWith(
      "location",
      { latitude: lat, longitude: lng },
      { radius: maxDistance, unit: "km" },
      [GeoReplyWith.COORDINATES, GeoReplyWith.DISTANCE]
    );
    return (locations as any).map(transformLocationGeohash);
  }

  async queryC(
    lng: Longitude,
    lat: Latitude,
    maxDistance: number
  ): Promise<Array<TestData>> {
    const locations = await this.redis.geoSearchWith(
      "location",
      { latitude: lat, longitude: lng },
      { radius: maxDistance, unit: "km" },
      [GeoReplyWith.COORDINATES, GeoReplyWith.DISTANCE],
      { SORT: "ASC" }
    );
    return (locations as any).map(transformLocationGeohash);
  }
}
