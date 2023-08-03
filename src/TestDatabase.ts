import { TestData } from "./TestData";

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
     * Query A: Find nearest location
     * 
     * Pick a random location, find the closest location in the dataset.
     * @param lng
     * @param lat
     */
    abstract queryA(lng: number, lat: number): Promise<TestData>;

    /**
     * Query B: Find locations within a radius
     * 
     * Pick a random location from the dataset, find all locations within certain distance.
     * @param lng 
     * @param lat 
     * @param maxDistance in kilometer
     */
    abstract queryB(lng: number, lat: number, maxDistance: number): Promise<Array<TestData>>;

    /**
     * Query C: Find locations within a radius and order them.
     * 
     * Pick a random location from the dataset, find all locations within certain distance, order by distance.
     * @param lng 
     * @param lat 
     * @param maxDistance in kilometer
     */
    abstract queryC(lng: number, lat: number, maxDistance: number): Promise<Array<TestData>>;
}