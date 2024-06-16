var EVENTS_URL = "https://app.ticketmaster.com/discovery/v2/events.json";
var EVENT_DETAILS_URL =
  "https://app.ticketmaster.com/discovery/v2/events/{event_id}.json";
var SUGGEST_URL = "https://app.ticketmaster.com/discovery/v2/suggest.json";
var VENUE_URL = "https://app.ticketmaster.com/discovery/v2/venues.json";
var APIKEY = "s6Aa43PZAPxAFEEVEUGFK6NZ6IjnfXFK";

var express = require("express");
var path = require("path");
const axios = require("axios");
var geohash = require("ngeohash");
var SpotifyWebApi = require("spotify-web-api-node");
var spotifyApi = new SpotifyWebApi({
  clientId: "fadc69e2f39f48deae085f46602f0e34",
  clientSecret: "83b7b27d9be1402ab3d7240c34b1e577",
});
var app = express();
// app.use(express.static(path.join(__dirname, "/../frontend/dist/frontend")));

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "/../frontend/dist/frontend/index.html"));
// });

app.use(express.static(path.join(__dirname, "/frontend")));

app.get("/", (req, res) => {
  res.sendFile("/frontend/index.html");
});

app.get("/favorites", function (req, res) {
  res.end("return page");
});

app.get("/events", function (req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  var dict_category = {
    1: "KZFzniwnSyZfZ7v7nJ",
    2: "KZFzniwnSyZfZ7v7nE",
    3: "KZFzniwnSyZfZ7v7na",
    4: "KZFzniwnSyZfZ7v7nn",
    5: "KZFzniwnSyZfZ7v7n1",
  };

  var keyword = req.query.keyword;
  distance = req.query.distance ? parseInt(req.query.distance) : 10;
  category = req.query.category ? parseInt(req.query.category) : 0;
  lat = req.query.lat;
  lng = req.query.lng;
  geopoint = geohash.encode(lat, lng, 7);

  if (!keyword) res.end(JSON.stringify({ StatusCode: 400, events: [] }));

  axios
    .get(EVENTS_URL, {
      params: {
        size: 20,
        radius: distance,
        unit: "miles",
        geoPoint: geopoint,
        keyword: keyword,
        apikey: APIKEY,
        segmentId: dict_category[category],
      },
    })
    .then(function (response) {
  
      var events = formatEvents(response.data);
      res.end(JSON.stringify(events));
    })
    .catch(function (error) {
      console.log(error);
    });
});

class event {
  constructor(event_id, date, time, icon, name, genre, event_venue) {
    this.id = event_id;
    this.date = date;
    this.time = time;
    this.icon = icon;
    this.event_name = name;
    this.genre = genre ? genre : "";
    this.venue = event_venue ? event_venue : "";
  }
}

function formatEvents(response) {
  var events_lst = new Array();
  try {
    if (response._embedded.events.length > 0) {
      response._embedded.events.forEach(function (e, index) {
        if (e.dates.start.hasOwnProperty("localTime")) {
          time = e.dates.start.localTime;
        } else {
          time = "";
        }
        events_lst.push(
          new event(
            e.id,
            e.dates.start.localDate,
            time,
            e.images[0].url,
            e.name,
            e.classifications[0].segment.name,
            e._embedded.venues[0].name
          )
        );
      });
      return { events: events_lst };
    }
  } catch (ex) {
    if (response.hasOwnProperty("_links")) {
      console.log(ex);
      return { StatusCode: 200, events: [] };
    } else return { StatusCode: 500 };
  }
}

app.get("/event/:id", function (req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  var eventId = req.params["id"];
  axios
    .get(EVENT_DETAILS_URL.replace("{event_id}", eventId), {
      params: {
        apikey: APIKEY,
      },
    })
    .then(function (response) {
      var events = formatEventDetails(response.data);
      res.end(JSON.stringify(events));
    })
    .catch(function (error) {
      console.log(error);
    });
});

function formatEventDetails(response) {
  if (response.hasOwnProperty("_embedded")) {
    var event_id = response["id"];
    event_name = response["name"];
    date = response["dates"]["start"]["localDate"];

    if (response["dates"]["start"].hasOwnProperty("localTime"))
      time = response["dates"]["start"]["localTime"];
    else time = "";

    if (response["_embedded"].hasOwnProperty("attractions")) {
      artists = [];
      artist_names = [];
      response["_embedded"]["attractions"].forEach(function (att, i) {
        let musicRelated = att.classifications[0].segment.name === "Music";
        if (att.hasOwnProperty("url")) {
          artists.push({
            name: att.name,
            upcoming_events: att.url,
            musicRelated: musicRelated,
          });
          artist_names.push(att.name);
        } else {
          artists.push({
            name: att.name,
            upcoming_events: "",
            musicRelated: musicRelated,
          });
          artist_names.push(att.name);
        }
      });
      artist_concat = artist_names.join(" | ");
    } else {
      artists = [];
      artist_concat = "";
    }

    event_venue = response["_embedded"]["venues"][0]["name"];
    genre = getGenre(response["classifications"][0]);
    if (response.hasOwnProperty("priceRanges")) {
      max = response["priceRanges"][0]["max"];
      min = response["priceRanges"][0]["min"];
      price_ranges = `${min} - ${max}`;
    } else price_ranges = "";

    if (
      response["dates"].hasOwnProperty("status") &&
      response["dates"]["status"].hasOwnProperty("code")
    )
      ticket_status = response["dates"]["status"]["code"];
    else ticket_status = "";

    if (response.hasOwnProperty("url")) buy_at = response["url"];
    else buy_at = "";

    if (response.hasOwnProperty("seatmap"))
      seat_map = response["seatmap"]["staticUrl"];
    else seat_map = "";
    event_details = new event_detail(
      event_id,
      event_name,
      date,
      time,
      artists,
      artist_concat,
      event_venue,
      genre,
      price_ranges,
      ticket_status,
      buy_at,
      seat_map
    );
    return event_details;
  } else {
    return "error";
  }
}

function getGenre(classifications) {
  genre_lst = [];
  if (
    classifications.hasOwnProperty("subGenre") &&
    classifications["subGenre"].hasOwnProperty("name") &&
    classifications["subGenre"]["name"] != "Undefined"
  )
    genre_lst.push(classifications["subGenre"]["name"]);
  if (
    classifications.hasOwnProperty("genre") &&
    classifications["genre"].hasOwnProperty("name") &&
    classifications["genre"]["name"] != "Undefined"
  )
    genre_lst.push(classifications["genre"]["name"]);
  if (
    classifications.hasOwnProperty("segment") &&
    classifications["segment"].hasOwnProperty("name") &&
    classifications["segment"]["name"] != "Undefined"
  )
    genre_lst.push(classifications["segment"]["name"]);
  if (
    classifications.hasOwnProperty("subType") &&
    classifications["subType"].hasOwnProperty("name") &&
    classifications["subType"]["name"] != "Undefined"
  )
    genre_lst.push(classifications["subType"]["name"]);
  if (
    classifications.hasOwnProperty("type") &&
    classifications["type"].hasOwnProperty("name") &&
    classifications["type"]["name"] != "Undefined"
  )
    genre_lst.push(classifications["type"]["name"]);
  return genre_lst.join(" | ");
}

class event_detail {
  constructor(
    event_id,
    name,
    date,
    time,
    artists,
    artist_concat,
    event_venue,
    genre,
    price_range,
    ticket_status,
    buy_at,
    seat_map
  ) {
    this.id = event_id;
    this.name = name;
    this.date = date;
    this.time = time;
    this.artists = artists;
    this.artist_concat = artist_concat;
    this.venue = event_venue;
    this.genre = genre;
    this.price_range = price_range;
    this.ticket_status = ticket_status;
    this.buy_at = buy_at;
    this.seat_map = seat_map;
  }
}

app.get("/suggestions", function (req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  var keyword = req.query.keyword;
  axios
    .get(SUGGEST_URL, {
      params: {
        apikey: APIKEY,
        keyword: keyword,
      },
    })
    .then(function (response) {
      var suggestions = formatSuggestions(response.data);
      res.end(JSON.stringify(suggestions));
    })
    .catch(function (error) {
      console.log(error);
    });
});

function formatSuggestions(response) {
  var suggestions = [];
  if (
    response &&
    response.hasOwnProperty("_embedded") &&
    response["_embedded"].hasOwnProperty("attractions")
  ) {
    response["_embedded"]["attractions"].forEach(function (att, index) {
      suggestions.push(att["name"]);
    });
    return suggestions;
  }
  return "";
}

app.get("/venue", function (req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  var keyword = req.query.keyword;
  axios
    .get(VENUE_URL, {
      params: {
        apikey: APIKEY,
        keyword: keyword,
      },
    })
    .then(function (response) {
      var venueDetails = formatVenueDetails(response.data);
      res.end(JSON.stringify(venueDetails));
    })
    .catch(function (error) {
      console.log(error);
    });
});

function formatVenueDetails(response) {
  if (
    response.hasOwnProperty("_embedded") &&
    response["_embedded"]["venues"].length > 0
  ) {
    var response_venue = response["_embedded"]["venues"][0];
    var venue_name = response_venue["name"];
    try {
      var address = response_venue["address"]["line1"];
    } catch (ex) {
      var address = "";
    }

    try {
      var city = `${response_venue["city"]["name"]}, ${response_venue["state"]["name"]}`;
    } catch (ex) {
      var city = "";
    }

    try {
      var phone = response_venue["boxOfficeInfo"]["phoneNumberDetail"];
    } catch (ex) {
      var phone = "";
    }

    try {
      var openHours = response_venue["boxOfficeInfo"]["openHoursDetail"];
    } catch (ex) {
      var openHours = "";
    }

    try {
      var generalRule = response_venue["generalInfo"]["generalRule"];
    } catch (ex) {
      var generalRule = "";
    }

    try {
      var childRule = response_venue["generalInfo"]["childRule"];
    } catch (ex) {
      var childRule = "";
    }

    return {
      name: venue_name,
      address: address,
      city: city,
      phone: phone,
      openHours: openHours,
      generalRule: generalRule,
      childRule: childRule,
    };
  }
  return "";
}

function refreshAccessToken() {
  return new Promise(function (resolve, reject) {
    spotifyApi.clientCredentialsGrant().then(function (response) {
      spotifyApi.setAccessToken(response.body?.access_token);
      resolve("done");
    });
  });
}

function formatArtistDetails(successArtistData, successAlbumData, keyword) {
  let returnArtist = undefined;
  successArtistData.body.artists.items.forEach((element) => {
    if (element.name.toLowerCase() === keyword.toLowerCase()) {
      returnArtist = {
        name: element.name,
        followers: element.followers?.total?.toLocaleString("en-us"),
        popularity: element.popularity,
        spotifyLink: element.external_urls?.spotify,
        profile_image: {url:element?.images[1]?.url},
        album_images: [],
      };
    }
  });

  successAlbumData.body.items.forEach((element) => {
    returnArtist.album_images.push({ url: element?.images[1]?.url });
  });

  return returnArtist;
}

function getArtistDetails(keyword) {
  return new Promise(function (resolve, reject) {
    spotifyApi
      .searchArtists(keyword)
      .then(
        function (successResponse) {
          return resolve(successResponse, keyword);
        },
        function (errorResponse) {
          if (errorResponse["statusCode"] == 401) {
            refreshAccessToken().then(function () {
              getArtistDetails(keyword).then(
                function (success) {
                  return resolve(success);
                },
                function (failure) {
                  return reject(failure);
                }
              );
            });
          } else {
            return reject(errorResponse);
          }
        }
      )
      .catch(function (error) {
        console.log(error);
      });
  });
}

app.get("/artist", async function (req, res) {
  res.set('Access-Control-Allow-Origin', '*');
  var keyword = req.query.keyword;
  getArtistDetails(keyword).then(
    function (successArtistData) {
      let artistData = successArtistData;
      let spotifyArtistID = artistData.body.artists.items[0].id;
      spotifyApi
        .getArtistAlbums(spotifyArtistID, { limit: 3 })
        .then(function (successAlbumData) {
          res.end(
            JSON.stringify(
              formatArtistDetails(successArtistData, successAlbumData, keyword)
            )
          );
        });
    },
    function (failure) {
      res.end(JSON.stringify(failure));
    }
  );
});

var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;
});
