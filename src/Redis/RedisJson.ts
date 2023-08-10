import { createClient } from "redis";
import { TestData } from "../TestData";
import { TestDatabase } from "../TestDatabase";
import { Latitude, Longitude } from "../utils";
import { Repository } from "redis-om";
import { LocationJson, locationSchema } from "./Locations";
import { transformLocationJson, transformTestDataJson } from "./Transformer";
import distance from "@turf/distance";

export class RedisJson extends TestDatabase {
  uri: string;
  redis: ReturnType<typeof createClient>;
  repository?: Repository;

  constructor(uri?: string) {
    super();
    this.uri = uri ?? "redis://localhost:6379/";
    this.redis = createClient({
      url: this.uri,
    });
  }

  name(): string {
    return "RedisJson";
  }

  async connect(uri?: string | undefined): Promise<void> {
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
    const docs = data.map(transformTestDataJson);
    let index = 0;
    while (index < docs.length) {
      await this.repository!.save(docs[index++]!);
    }
  }

  async prepare(): Promise<void> {
    await this.repository!.createIndex();
    await this.redis.bgSave();
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
    return transformLocationJson(
      (location as unknown as LocationJson) ?? {
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
    return (locations as unknown as Array<LocationJson>).map(
      transformLocationJson
    );
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
    return (locations as unknown as Array<LocationJson>)
      .map(transformLocationJson)
      .map((e) =>
        Object.assign(e, {
          distance: distance([lng, lat], [e.lng, e.lat]), // Sort at client side.
        })
      )
      .sort((a, b) => a.distance - b.distance);
  }
}
