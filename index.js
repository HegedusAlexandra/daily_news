"use strict";

const date = new Date();
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
let dayName = days[date.getDay()];
let day = date.getDate();
let month = months[date.getMonth()];
let year = date.getFullYear();

// This arrangement can be altered based on how we want the date's format to appear.
let currentDate = `${dayName}, ${month} ${day} ${year}`;

//prompt("Please enter your location", "NEW YORK")
// geolocation app js
/* const successCallback = (position) => {
  console.log(position);
};

const errorCallback = (error) => {
  console.log(error);
};

navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
 */
const city = "London";

if (city != null) {
  document.querySelector("header").textContent = `black sun times`;
}

document.querySelector(".subhead").textContent = city + " - " + currentDate;

const options = {
  method: "GET",
  headers: {
    "X-BingApis-SDK": "true",
    "X-RapidAPI-Key": "19381f72b2msh1b462bb52a5f1e0p1461c1jsn02738b23564a",
    "X-RapidAPI-Host": "bing-news-search1.p.rapidapi.com",
  },
};
// mkt -market code change for different source
// https://learn.microsoft.com/en-us/rest/api/cognitiveservices-bingsearch/bing-news-api-v7-reference#cc
fetch(
  "https://bing-news-search1.p.rapidapi.com/news?mkt=en-GB&safeSearch=Off&textFormat=Raw",
  options
)
  .then((response) => response.json())
  .then((response) => {
    const news = response;
    console.log(news);
    console.log(news.value[0].description);
    document.querySelector(".column").textContent = news.value[0].description;
  })
  .catch((err) => console.error(err));
