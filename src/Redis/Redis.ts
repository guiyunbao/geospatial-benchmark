import { createClient } from 'redis';
import { TestData } from "../TestData";
import { TestDatabase } from "../TestDatabase";
import { transformLocation, transformTestData } from "./Transformer";
import { Latitude, Longitude, delay } from "../utils";
import { Repository } from 'redis-om';
import { locationSchema } from './Locations';

export class redis extends TestDatabase {
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
    this.redis = createClient({ url: uri ?? this.uri ?? 'redis://127.0.0.1:6379' })
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
    const docs = data.map(transformTestData);
    let index = 0;
    while (index < docs.length) {
      await this.repository!.save(docs[index++]!)
    }
  }
  async prepare(): Promise<void> {
    await this.repository!.createIndex();
  }

  async usageReport(): Promise<Object> {
    const stats = await this.redis.info('stats');
    return JSON.stringify(stats);
  }

  async queryA(lng: Longitude, lat: Latitude): Promise<TestData> {
    let query = '@location:' + '[' + lng + ','
      + lat + ',' + 100000 + ',' + 'km' + ']'
    const location = await this.repository?.searchRaw(query).returnFirst();
    return location ? transformLocation(location as any) : {
      id: '',
      lng: 0,
      lat: 0
    };
  }

  async queryB(
    lng: Longitude,
    lat: Latitude,
    maxDistance: number
  ): Promise<TestData[]> {
    let query = '@location:' + '[' + lng + ','
      + lat + ',' + maxDistance + ',' + 'km' + ']'
    const locations = await this.repository?.searchRaw(query).returnAll();

    return locations && locations?.length > 0 ? (locations as any).map(transformLocation) : [];
  }

  // MongoDB already sorts by distance by default, so we don't need to do anything here.
  async queryC(
    lng: Longitude,
    lat: Latitude,
    maxDistance: number
  ): Promise<TestData[]> {
    let query = '@location:' + '[' + lng + ','
      + lat + ',' + maxDistance + ',' + 'km' + ']'
    const locations = await this.repository?.searchRaw(query).returnAll();
    return locations && locations?.length > 0 ? (locations as any).map(transformLocation) : [];
  }
}