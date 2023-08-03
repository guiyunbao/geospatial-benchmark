import { parse } from "csv-parse/sync";
import { MongoDB } from "./src/Mongodb/Mongodb";
import { TestDatabase } from "./src/TestDatabase";
import b, { add } from "benny";
import fs from "fs";
import { TestData } from "./src/TestData";
import { randomLng, randomLat, delay } from "./src/utils";

const databases: {
  [key: string]: TestDatabase;
} = {
  mongo: new MongoDB(),
};

const pwd = process.cwd();
const testFilePath = pwd + "/datasets/inat2017/inat2017_file_name_to_geo.csv";
const file = fs.readFileSync(testFilePath, "utf8");
const rawData: Array<TestData> = parse(file, {
  columns: (header: any) => ["id", "lat", "lng"],
});

let data = rawData.slice(0, 10000);

new Promise<void>(async (resolve, reject) => {
  // Setup the databases
  await Promise.all(
    Object.values(databases).map((database) =>
      database
        .connect()
        .then(() => database.cleanup())
        .then(() => database.create(data))
        .then(() => database.prepare())
        .then(() => console.log(`Database ${database.name()} is ready.`))
    )
  );

  const testQueryA = (lng: number, lat: number) =>
    Object.values(databases).map((database) => {
      return add(database.name(), () => database.queryA(lng, lat));
    });

  const testQueryB = (lng: number, lat: number) =>
    Object.values(databases).map((database) => {
      return add(database.name(), () => database.queryB(lng, lat, 100));
    });

  const testQueryC = (lng: number, lat: number) =>
    Object.values(databases).map((database) => {
      return add(database.name(), () => database.queryC(lng, lat, 100));
    });

  // Run the benchmarks
  await b.suite(
    "Query A",
    ...testQueryA(randomLng(), randomLat()),
    b.cycle(),
    b.complete()
  );
  await b.suite(
    "Query B",
    ...testQueryB(randomLng(), randomLat()),
    b.cycle(),
    b.complete()
  );
  await b.suite(
    "Query C",
    ...testQueryC(randomLng(), randomLat()),
    b.cycle(),
    b.complete()
  );

  resolve();
}).then(() => process.exit());
