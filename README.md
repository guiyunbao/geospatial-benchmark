# Benchmark geospatial query performance on NoSQL(-like) databases

## Test Environment

- Databases
  - [MongoDB](https://www.mongodb.com/) Community Edition@latest
  - [Redis](https://redis.io/) Stack@latest
- Programming Language and lib
  - [TypeScript](https://www.typescriptlang.org/)
    - [Mongoose](https://mongoosejs.com/)
    - [Redis OM](https://github.com/redis/redis-om-node)
- Host
  - [GitHub Codespaces](https://docs.github.com/en/codespaces)
  - [GitHub Actions](https://docs.github.com/en/actions)

## Run Benchmarks

```log
npm run start [-- [options]]

  -t, --type <type>     type of dataset ["inat2017", "random", "grid", "cluster"] (default: "inat2017")
  -c, --count <count>   number of data points (default: "100000")
  -r, --repeat <count>  number of repeat (default: "1")
```

## Test dataset

By default, this benchmark uses [iNaturalist 2017](https://www.kaggle.com/c/inaturalist-challenge-at-fgvc-2017)'s [Fine Grained Geolocation Datasets (visipedia/fg_geo)](https://github.com/visipedia/fg_geo). Which contains 654,818 records of geolocation point.

File was placed at `datasets/inat2017/inat2017_file_name_to_geo.csv` with header.

Format:

```csv
filename,latitude,longitude
```

We also provide 3 other runtime generated datasets:

- Random
  - Points are totally placed by RNG.
- Grid
  - Points separated evenly around the earth.
  - Using [Fibonacci sphere algorithm](https://arxiv.org/abs/0912.4540).
- Cluster
  - Every 50 points will be placed together with a bit offset as a cluster, and all clusters will be distributed randomly.

## Test queries

- Data should be loaded into the database before running the queries.
  - Warm up index is allowed.
  - Warm up query is not allowed.
- Storage cost will be calculated.
  - For memory-storage databases, both memory and persist storage cost will be calculated.
- In theory, all databases should return the same result.

Basic test requires all queries runs one by one in a single process/thread.  
Advanced test allows queries to run in parallel, and allows to optimized for test host.

### Query A: Find nearest location

Pick a random location, find the closest location in the dataset.

### Query B: Find locations within a radius

Pick a random location from the dataset, find all locations within certain distance.

### Query C: Find locations within a radius and order them.

Pick a random location from the dataset, find all locations within certain distance, order by distance.

## License and Citation

This project is licensed under the terms of the [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) license.

Citation info can be found at [CITATION.cff](./CITATION.cff)
