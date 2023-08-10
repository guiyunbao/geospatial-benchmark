import { TestData } from "./TestData";
import { TestDatabase } from "./TestDatabase";
import { delay } from "./utils";

export class StubDatabase extends TestDatabase {
  #size = 0;

  name(): string {
    return "Stub";
  }

  async connect(uri?: string | undefined): Promise<void> {}
  async disconnect(): Promise<void> {}
  async cleanup(): Promise<void> {
    this.#size = 0;
  }
  async create(data: Array<TestData>): Promise<void> {
    this.#size += data.length;
  }
  async prepare(): Promise<void> {}
  async usageReport(): Promise<object> {
    return {
      msg: "This is a stub database. Query ops should be static 100 ops/sec.",
      size: this.#size,
    };
  }

  #simulateQuery() {
    return delay(0.01);
  }

  async queryA(lng: number, lat: number): Promise<TestData> {
    await this.#simulateQuery();
    return {
      id: "stub",
      lng,
      lat,
    };
  }

  async queryB(
    lng: number,
    lat: number,
    maxDistance: number
  ): Promise<Array<TestData>> {
    await this.#simulateQuery();
    return [
      {
        id: "stub",
        lng,
        lat,
      },
    ];
  }

  async queryC(
    lng: number,
    lat: number,
    maxDistance: number
  ): Promise<Array<TestData>> {
    await this.#simulateQuery();
    return [
      {
        id: "stub",
        lng,
        lat,
      },
    ];
  }
}
