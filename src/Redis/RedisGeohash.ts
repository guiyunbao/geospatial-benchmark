import { createClient } from 'redis';
import { TestData } from "../TestData";
import { TestDatabase } from "../TestDatabase";
import { transformLocationJson, transformLocationGeohash, transformTestDataJson, transformTestDataGeohash } from "./Transformer";
import { Latitude, Longitude } from "../utils";
import { Repository } from 'redis-om';
import { locationSchema } from './Locations';

export class RedisGeohash extends TestDatabase {
  redis: any;
  repository?: Repository;
  uri?: string;
  constructor(uri?: string) {
    super();
    this.uri = uri;
  }

  name(): string {
    return "RedisGeohash";
  }

  async connect(uri?: string | undefined): Promise<void> {
    this.redis = createClient({ url: uri ?? this.uri ?? 'redis://127.0.0.1:6380' })
    await this.redis.connect();
    this.repository = new Repository(locationSchema, this.redis)
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }

  async cleanup(): Promise<void> {
    await this.redis.flushAll();
  }

  async create(data: TestData[]): Promise<void> {
    const docs = data.map(transformTestDataGeohash);
    await this.redis.GEOADD('location', docs);
  }
  async prepare(): Promise<void> {
  }

  async usageReport(): Promise<Object> {
    let stats = await this.redis.info('memory');
    stats += await this.redis.info('persistence');
    return JSON.stringify(stats);
  }

  async queryA(lng: Longitude, lat: Latitude): Promise<TestData> {
    const closestLimit = 100;
    const locations = await this.redis.GEOSEARCH_WITH('location',
      { latitude: lat, longitude: lng },
      { radius: closestLimit, unit: 'km' }, ['WITHCOORD', 'ASC', 'WITHDIST'])
    return transformLocationJson(locations[0]! as any ?? {
      id: `Out_Of_Range(${closestLimit}km)`,
      location: {
        longitude: 0,
        latitude: 0
      },
    });
  }

  async queryB(
    lng: Longitude,
    lat: Latitude,
    maxDistance: number
  ): Promise<TestData[]> {
    const locations = await this.redis.GEOSEARCH_WITH('location',
      { latitude: lat, longitude: lng },
      { radius: maxDistance, unit: 'km' }, ['WITHCOORD', 'WITHDIST'])
    return (locations as any).map(transformLocationGeohash);
  }

  async queryC(
    lng: Longitude,
    lat: Latitude,
    maxDistance: number
  ): Promise<TestData[]> {
    const locations = await this.redis.GEOSEARCH_WITH('location',
      { latitude: lat, longitude: lng },
      { radius: maxDistance, unit: 'km' }, ['WITHCOORD', 'ASC', 'WITHDIST'])
    return (locations as any).map(transformLocationGeohash);
  }
}