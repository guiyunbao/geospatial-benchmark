// The project function defines how your document looks.
// It takes your content and some metadata and formats it.
// Go ahead and customize it to your liking!
#let project(title: "", abstract: [], authors: (), body) = {
  // Set the document's basic properties.
  set document(author: authors.map(a => a.name), title: title)
  set page(numbering: "1", number-align: center)
  set text(font: "New Computer Modern", lang: "en")
  show math.equation: set text(weight: 400)
  set heading(numbering: "1.1")

  // Set run-in subheadings, starting at level 4.
  show heading: it => {
    if it.level > 3 {
      parbreak()
      text(11pt, style: "italic", weight: "regular", it.body + ".")
    } else {
      it
    }
  }


  // Title row.
  align(center)[
    #block(text(weight: 700, 1.75em, title))
  ]

  // Author information.
  pad(
    top: 0.5em,
    x: 2em,
    grid(
      columns: (1fr,) * calc.min(3, authors.len()),
      gutter: 1em,
      ..authors.map(author => align(center)[
        *#author.name* \
        #author.email \
        #author.affiliation
      ]),
    ),
  )

  // Abstract.
  pad(
    x: 2em,
    top: 1em,
    bottom: 1.1em,
    align(center)[
      #heading(
        outlined: false,
        numbering: none,
        text(0.85em, smallcaps[Abstract]),
      )
      #abstract
    ],
  )

  // Main body.
  set par(justify: true)

  body
}

#show: project.with(
  title: "Benchmark geospatial query performance on NoSQL(-like) databases",
  authors: (
    (name: "LiangXiang Shen", email: "kj415j45@gmail.com", affiliation: "Guangxi GuiYunBao Tech Inc."),
    (name: "Feng Zhou", email: "", affiliation: "Guangxi GuiYunBao Tech Inc."),
  ),
  abstract: [Geospatial has become more and more critical not only for enterprises but also for customers. In the long run, it is important to collect and use them well in growing IoT. The performance of the query could be a key factor to improve UX and background analysis. In this paper, we will benchmark the geospatial query performance on popular NoSQL(-like) databases, including MongoDB, Redis. We will also discuss the pros and cons of each database.],
)

= Introduction

According to recent Database ranking @DB_Rank, we choose the top-most popular NoSQL databases as our benchmark target. They are MongoDB, Redis. We will benchmark the geospatial query performance on them.

== MongoDB

_MongoDB_ is a source-available cross-platform document-oriented database program. Classified as a NoSQL database program, MongoDB uses JSON-like documents with optional schemas. @MongoDBWiki

== Redis

_Redis_ (Remote Dictionary Server) is an open-source in-memory storage, used as a distributed, in-memory key-value database, cache and message broker, with optional durability. Because it holds all data in memory and because of its design, Redis offers low-latency reads and writes, making it particularly suitable for use cases that require a cache. @RedisWiki

_Redis Stack_ extends the core features of _Redis OSS_ and provides a complete developer experience for debugging and more. @RedisStackIntro As it is providing JSON, time-series and probabilistic-based data structure over raw Redis. These features are very useful for building modern applications.

= Benchmark

Generally, the benchmark should be as close to the actual use case as possible. And many targets may reflect the actual database performance, we would cover them as many we can as possible.

There are some challenges while benchmarking. These challenges expose the real development issues that we may encounter in the future. We will talk about them later.

== Limitation

Due to complexity, serveral limitaions are found during the benchmark.

=== Coordinate System

Redis uses EPSG:3857 #footnote[https://epsg.io/3857], as known as _Pseudo-Mercator_ or _Web Mercator_, as the coordinate system @RedisGeoadd.
This coordinate system is not including the area near the poles. So trying to insert a point near the poles will fail.
In this benchmark, *while inserting points into Redis, if a point is near the poles, we will move it to a valid EPSG:3857 latitude*.

It is worth mentioning that this system may not reflect actual ground distance as its projection is not perfect for Earth. *Though some reports say it has a 0.7% error rate @ErrorInProjection, we will ignore the error as it is far beyond our purpose.*

MongoDB uses EPSG:4326 #footnote[https://epsg.io/4326], as known as _WGS84_ which is used in _GPS_. It's not affected by those previously mentioned issues.

=== Query

In Redis, querying around a geo point requires radius as one of the parameters. If the radius is too large, the query will be slow. *For simulating actual use cases, we will use 100 kilometers as the maximum radius while querying in Redis.*

*All queries will use a valid EPSG:3857 coordinate.*

== Test Data

=== iNaturalist 2017

_iNaturalist_ provides a place to record and organize nature findings, meet other nature enthusiasts, and learn about the natural world. It encourages the participation of a wide variety of nature enthusiasts, including, but not exclusive to, hikers, hunters, birders, beach combers, mushroom foragers, park rangers, ecologists, and fishermen. Through connecting these different perceptions and expertise of the natural world, iNaturalist hopes to create extensive community awareness of local biodiversity and promote further exploration of local environments. @iNaturalist

Google held a competition called _iNaturalist Challenge at FGVC 2017_ #footnote[https://www.kaggle.com/c/inaturalist-challenge-at-fgvc-2017] . They created a dataset of 5,089 species of plants and animals, consisting of 675,000 training images and 25,000 test images from iNaturalist.
We found a dataset with the geolocation that we needed for the benchmark called Fine Grained Geolocation Datasets @fg_geo created by Grace Chu, Brian Potetz, et al.

=== Generated Data

To simulate some edge cases, we generated 3 different type of datasets.

==== Random

Randomly generated points in the range of EPSG:4326.

==== Grid

Generated points with Fibonacci Sphere Algorithm @FibonacciSphereAlgo. It is a method of generating points that are evenly distributed on the surface of a sphere.

==== Cluster

Every 50 points will be consider as a cluster and will be placed around a random center on earch with short radius. All points will be generated in the range of EPSG:4326.

== Test Environment

=== Hardware

GitHub Actions #footnote[https://github.com/features/actions] is used for benchmarking. It provides a virtual machine with 2 cores and 7 GB of memory.

=== Software

- MongoDB
  - Enterprise Server \@ latest #footnote[https://hub.docker.com/r/mongodb/mongodb-enterprise-server]
- Redis \@ latest #footnote[https://hub.docker.com/_/redis]
  - Stack Server \@ latest #footnote[https://hub.docker.com/r/redis/redis-stack-server]

== Test Result

= Analyze

= Conclusion

#pagebreak(weak: true)
#bibliography("cites.yml")
