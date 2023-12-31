import { parse } from "csv-parse/sync";
import { MongoDB } from "./src/Mongodb/Mongodb";
import { TestDatabase } from "./src/TestDatabase";
import b, { add } from "benny";
import fs from "fs";
import { TestData } from "./src/TestData";
import {
  randomLng,
  Longitude,
  Latitude,
  shuffle,
  SampleType,
  generateSample,
  isValidEPSG3857Lat,
  randomEPSG3857Lat,
  importData,
} from "./src/utils";
import { Command } from "commander";
import { RedisJson } from "./src/Redis/RedisJson";
import { RedisGeohash } from "./src/Redis/RedisGeohash";
import { StubDatabase } from "./src/StubDatabase";

const program = new Command("geospatial-benchmark");

program
  .option(
    "-t, --type <type>",
    'type of dataset ["inat2017", "random", "grid", "cluster"]',
    "inat2017"
  )
  .option("-c, --count <count>", "number of data points", "100000")
  .option("-r, --repeat <count>", "number of repeat", "1")
  .parse();

const opts = program.opts();
const sampleType = opts.type;
const sampleCount = parseInt(opts.count);
const benchRepeat = parseInt(opts.repeat);

const databases: {
  [key: string]: TestDatabase;
} = {
  mongo: new MongoDB(),
  redisJson: new RedisJson(),
  redisGeohash: new RedisGeohash(),
  stub: new StubDatabase(),
};

let data: Array<TestData>;

switch (sampleType) {
  case "inat2017": {
    const pwd = process.cwd();
    const testFilePath =
      pwd + "/datasets/inat2017/inat2017_file_name_to_geo.csv";
    const file = fs.readFileSync(testFilePath, "utf8");
    const rawData: Array<TestData> = parse(file, {
      columns: (header: any) => ["id", "lat", "lng"],
    });

    data = shuffle(rawData).slice(0, sampleCount);
    break;
  }
  default: {
    data = shuffle(generateSample(sampleType as SampleType, sampleCount));
  }
}

console.log("Dataset: %s (%d)", sampleType, data.length);

new Promise<void>(async (resolve, reject) => {
  // Setup the databases
  await Promise.all(
    Object.values(databases).map((database) =>
      importData(database, data).then((report) => {
        console.log(
          "Database %s is ready.\nUsage report:\n%s",
          database.name(),
          report
        );
        fs.writeFileSync(
          `./results/${database.name()}.report`,
          JSON.stringify(report)
        );
      })
    )
  );

  const testQueryA = (lng: Longitude, lat: Latitude) =>
    Object.values(databases).map((database) => {
      return add(database.name(), () => database.queryA(lng, lat));
    });

  const testQueryB = (lng: Longitude, lat: Latitude, distance: number) =>
    Object.values(databases).map((database) => {
      return add(database.name(), () => database.queryB(lng, lat, distance));
    });

  const testQueryC = (lng: Longitude, lat: Latitude, distance: number) =>
    Object.values(databases).map((database) => {
      return add(database.name(), () => database.queryC(lng, lat, distance));
    });

  // Run the benchmarks
  let lng: Longitude;
  let lat: Latitude;
  let distance: number;
  let testPoint: TestData;
  let title: string;
  let repeat = 0;
  console.log("Start benchmarking...  (repeat: %d)", benchRepeat);

  while (++repeat <= benchRepeat) {
    await queryA();

    await queryB();

    await queryC();
  }

  // Write testdata
  const csvTitle = "id,lng,lat";
  const csvData = data.map((d) => `${d.id},${d.lng},${d.lat}`).join("\n");
  fs.writeFileSync(`./results/testdata.csv`, `${csvTitle}\n${csvData}`);

  resolve();

  async function queryA() {
    lng = randomLng();
    lat = randomEPSG3857Lat();
    title = `Query A - ${repeat}`;
    let output = "";
    console.log("%s\nlng: %f, lat: %f", title, lng, lat);
    fs.writeFileSync(`./results/${title}.input`, JSON.stringify({ lng, lat }));
    for (const database of Object.values(databases)) {
      let data = await database.queryA(lng, lat);
      let message = `${database.name()} => ${JSON.stringify(data)}`;
      console.log(message);
      output += message + "\n";
    }
    fs.writeFileSync(`./results/${title}.output`, output);
    await b.suite(
      title,
      b.configure({
        cases: {
          minTime: 5,
          maxTime: 20,
        },
      }),
      ...shuffle(testQueryA(lng, lat)),
      b.cycle(),
      b.complete(),
      b.save({ file: `${title}`, folder: "results", details: true })
    );
  }

  async function queryB() {
    testPoint = data[Math.floor(Math.random() * data.length)];
    while (!isValidEPSG3857Lat(testPoint.lat)) {
      testPoint = data[Math.floor(Math.random() * data.length)];
    }
    lng = testPoint.lng;
    lat = testPoint.lat;
    distance = Math.random() * 100;
    title = `Query B - ${repeat}`;
    let output = "";
    console.log(
      "%s\nlng: %f, lat: %f, distance: %f km",
      title,
      lng,
      lat,
      distance
    );
    fs.writeFileSync(
      `./results/${title}.input`,
      JSON.stringify({ lng, lat, distance })
    );
    for (const database of Object.values(databases)) {
      let data = await database.queryB(lng, lat, distance);
      let message = `${database.name()} => ${data.length}`;
      console.log(message);
      output += message + "\n";
    }
    fs.writeFileSync(`./results/${title}.output`, output);
    await b.suite(
      title,
      b.configure({
        cases: {
          minTime: 5,
          maxTime: 20,
        },
      }),
      ...shuffle(testQueryB(lng, lat, distance)),
      b.cycle(),
      b.complete(),
      b.save({ file: `${title}`, folder: "results", details: true })
    );
  }

  async function queryC() {
    testPoint = data[Math.floor(Math.random() * data.length)];
    while (!isValidEPSG3857Lat(testPoint.lat)) {
      testPoint = data[Math.floor(Math.random() * data.length)];
    }
    lng = testPoint.lng;
    lat = testPoint.lat;
    distance = Math.random() * 100;
    title = `Query C - ${repeat}`;
    let output = "";
    console.log(
      "%s\nlng: %f, lat: %f, distance: %f km",
      title,
      lng,
      lat,
      distance
    );
    fs.writeFileSync(
      `./results/${title}.input`,
      JSON.stringify({ lng, lat, distance })
    );
    for (const database of Object.values(databases)) {
      let data = await database.queryC(lng, lat, distance);
      let message = `${database.name()} => ${data.length} => ${JSON.stringify(
        data[data.length - 1]
      )}`;
      console.log(message);
      output += message + "\n";
    }
    fs.writeFileSync(`./results/${title}.output`, output);
    await b.suite(
      title,
      b.configure({
        cases: {
          minTime: 5,
          maxTime: 20,
        },
      }),
      ...shuffle(testQueryC(lng, lat, distance)),
      b.cycle(),
      b.complete(),
      b.save({ file: `${title}`, folder: "results", details: true })
    );
  }
}).then(() => process.exit());
