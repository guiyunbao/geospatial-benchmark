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
  abstract: [Geospatial has become more and more critical in business, and the performance of the query could be a key factor for user experience. In this paper, we will benchmark the geospatial query performance on popular NoSQL(-like) databases, including MongoDB, Redis. We will also discuss the pros and cons of each database.],
)

= Introduction

According to recent Database ranking @DB_Rank, we choose the top-most popular NoSQL databases as our benchmark target. They are MongoDB, Redis. We will benchmark the geospatial query performance on them.

== MongoDB

_MongoDB_ is a source-available cross-platform document-oriented database program. Classified as a NoSQL database program, MongoDB uses JSON-like documents with optional schemas. @MongoDBWiki

== Redis

_Redis_ (Remote Dictionary Server) is an open-source in-memory storage, used as a distributed, in-memory key-value database, cache and message broker, with optional durability. Because it holds all data in memory and because of its design, Redis offers low-latency reads and writes, making it particularly suitable for use cases that require a cache. @RedisWiki

_Redis Stack_ extends the core features of _Redis OSS_ and provides a complete developer experience for debugging and more. @RedisStackIntro As it is providing json, time-series and probabilistic based storage. These features are very useful for building modern applications.

= Benchmark

== Test Data

== Test Environment

== Test Result

= Analyze

== MongoDB

= Conclusion

#bibliography("cites.yml")
