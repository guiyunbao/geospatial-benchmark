import { TestData } from "./TestData";
import { TestDatabase } from "./TestDatabase";

export class StubDatabase extends TestDatabase {
  name(): string {
    return "Stub";
  }

  async connect(uri?: string | undefined): Promise<void> {}
  async disconnect(): Promise<void> {}
  async cleanup(): Promise<void> {}
  async create(data: Array<TestData>): Promise<void> {}
  async prepare(): Promise<void> {}
  async usageReport(): Promise<object> {
    return {};
  }

  async queryA(lng: number, lat: number): Promise<TestData> {
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
    return [
      {
        id: "stub",
        lng,
        lat,
      },
    ];
  }
}
