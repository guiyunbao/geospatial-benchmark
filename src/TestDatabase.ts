import { TestData } from "./TestData";
import { Latitude, Longitude } from "./utils";

export abstract class TestDatabase {
  /**
   * Name of the database
   */
  abstract name(): string;

  /**
   * Connect to DB
   * @param uri
   */
  abstract connect(uri?: string): Promise<void>;

  /**
   * Disconnect from DB
   */
  abstract disconnect(): Promise<void>;

  /**
   * Cleanup previous data
   */
  abstract cleanup(): Promise<void>;

  /**
   * Initialize DB with data
   * @param data
   */
  abstract create(data: TestData[]): Promise<void>;

  /**
   * Prepare DB for query
   */
  abstract prepare(): Promise<void>;

  /**
   * Return the report of the database usage, prefer db/driver's raw format
   */
  abstract usageReport(): Promise<object>;

  /**
   * Query A: Find nearest location
   *
   * Pick a random location, find the closest location in the dataset.
   * @param lng
   * @param lat
   */
  abstract queryA(lng: Longitude, lat: Latitude): Promise<TestData>;

  /**
   * Query B: Find locations within a radius
   *
   * Pick a random location from the dataset, find all locations within certain distance.
   * @param lng
   * @param lat
   * @param maxDistance in kilometer
   */
  abstract queryB(
    lng: Longitude,
    lat: Latitude,
    maxDistance: number
  ): Promise<Array<TestData>>;

  /**
   * Query C: Find locations within a radius and order them.
   *
   * Pick a random location from the dataset, find all locations within certain distance, order by distance.
   * @param lng
   * @param lat
   * @param maxDistance in kilometer
   */
  abstract queryC(
    lng: Longitude,
    lat: Latitude,
    maxDistance: number
  ): Promise<Array<TestData>>;
}
