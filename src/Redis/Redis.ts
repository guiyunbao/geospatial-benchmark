import { createClient } from "redis";
import { TestData } from "../TestData";
import { TestDatabase } from "../TestDatabase";
import { transformLocation, transformTestData } from "./Transformer";
import { Latitude, Longitude } from "../utils";
import { Repository } from "redis-om";
import { locationSchema, Location } from "./Locations";

export class Redis extends TestDatabase {
  redis: any;
  repository?: Repository;
  uri?: string;
  constructor(uri?: string) {
    super();
    this.uri = uri;
  }

  name(): string {
    return "Redis";
  }

  async connect(uri?: string | undefined): Promise<void> {
    this.redis = createClient({
      url: uri ?? this.uri ?? "redis://localhost:6379/7957", // 7957 -> test
    });
    await this.redis.connect();
    this.repository = new Repository(locationSchema, this.redis);
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }

  async cleanup(): Promise<void> {
    await this.redis.flushAll();
  }

  async create(data: Array<TestData>): Promise<void> {
    const docs = data.map(transformTestData);
    let index = 0;
    while (index < docs.length) {
      await this.repository!.save(docs[index++]!);
    }
  }
  async prepare(): Promise<void> {
    await this.repository!.createIndex();
  }

  async usageReport(): Promise<Object> {
    let stats = await this.redis.info("memory");
    stats += await this.redis.info("persistence");
    return JSON.stringify(stats);
  }

  async queryA(lng: Longitude, lat: Latitude): Promise<TestData> {
    const closestLimit = 100;
    const location = await this.repository!.search()
      .where("location")
      .inRadius(
        (circle) =>
          circle.longitude(lng).latitude(lat).radius(closestLimit).kilometers
      )
      .return.first();
    return transformLocation(
      (location! as unknown as Location) ?? {
        id: `Out_Of_Range(${closestLimit}km)`,
        location: {
          longitude: 0,
          latitude: 0,
        },
      }
    );
  }

  async queryB(
    lng: Longitude,
    lat: Latitude,
    maxDistance: number
  ): Promise<Array<TestData>> {
    const locations = await this.repository!.search()
      .where("location")
      .inRadius(
        (circle) =>
          circle.longitude(lng).latitude(lat).radius(maxDistance).kilometers
      )
      .return.all();
    return (locations as unknown as Array<Location>).map(transformLocation);
  }

  async queryC(
    lng: Longitude,
    lat: Latitude,
    maxDistance: number
  ): Promise<Array<TestData>> {
    const locations = await this.repository!.search()
      .where("location")
      .inRadius(
        (circle) =>
          circle.longitude(lng).latitude(lat).radius(maxDistance).kilometers
      )
      .return.all();
    return (locations as unknown as Array<Location>).map(transformLocation);
  }
}
