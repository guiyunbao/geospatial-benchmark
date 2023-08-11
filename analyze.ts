import fs from "fs";
import { TestData } from "./src/TestData";

const pwd = process.cwd();
const resultDir = pwd + "/results/";

function parseInput(filename: string) {
  const pattern = /Query (?<query>A|B|C) - (?<repeat>\d+)\.input/;
  const match = filename.match(pattern);
  const query = match?.groups?.query;
  const repeat = match?.groups?.repeat;
  return {
    query,
    repeat: parseInt(repeat!),
    input: JSON.parse(fs.readFileSync(resultDir + filename).toString()),
  };
}

function parseBenchmark(filename: string) {
  const pattern = /Query (?<query>A|B|C) - (?<repeat>\d+)\.json/;
  const match = filename.match(pattern);
  const query = match?.groups?.query;
  const repeat = match?.groups?.repeat;
  const benchmark = JSON.parse(
    fs.readFileSync(resultDir + filename).toString()
  );
  const map = new Map<string, Array<number>>();
  benchmark.results.forEach((result: any) => {
    map.set(result.name, result.details.sampleResults);
  });
  return {
    query,
    repeat: parseInt(repeat!),
    samples: map,
  };
}

function parseOutput(filename: string) {
  const output = fs.readFileSync(resultDir + filename);
  const pattern = /Query (?<query>A|B|C) - (?<repeat>\d+)\.output/;
  const match = filename.match(pattern);
  const query = match?.groups?.query;
  const repeat = match?.groups?.repeat;
  switch (query) {
    case "A": {
      const patternA = /(?<database>\w+) => (?<output>.*)\n/g;
      const results = output.toString().matchAll(patternA);
      const map = new Map<string, TestData>();
      Array.from(results).forEach((result) => {
        map.set(result.groups?.database!, JSON.parse(result.groups?.output!));
      });
      return {
        query,
        repeat: parseInt(repeat!),
        resultsA: map,
      };
    }
    case "B": {
      const patternB = /(?<database>\w+) => (?<count>\d*)\n/g;
      const results = output.toString().matchAll(patternB);
      const map = new Map<string, number>();
      Array.from(results).forEach((result) => {
        map.set(result.groups?.database!, parseInt(result.groups?.count!));
      });
      return {
        query,
        repeat: parseInt(repeat!),
        resultsB: map,
      };
    }
    case "C": {
      const patternC = /(?<database>\w+) => (?<count>\d*) => (?<output>.*)\n/g;
      const results = output.toString().matchAll(patternC);
      const map = new Map<string, { furthest: TestData; count: number }>();
      Array.from(results).forEach((result) => {
        map.set(result.groups?.database!, {
          furthest: JSON.parse(result.groups?.output!),
          count: parseInt(result.groups?.count!),
        });
      });
      return {
        query,
        repeat: parseInt(repeat!),
        resultsC: map,
      };
    }
  }
}

const fileList = fs.readdirSync(resultDir);

const benchmarkInputs = fileList.filter((file) => file.endsWith(".input"));
const benchmarkResults = fileList.filter((file) => file.endsWith(".json"));
const benchmarkOutput = fileList.filter((file) => file.endsWith(".output"));

const inputs = benchmarkInputs.map(parseInput);
const benchmarks = benchmarkResults.map(parseBenchmark);
const outputs = benchmarkOutput.map(parseOutput);

const queries = ["A", "B", "C"];
const databases = ["MongoDB", "RedisJson", "RedisGeohash", "Stub"];
