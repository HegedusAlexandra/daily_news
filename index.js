"use strict";

import { languageToCapitalCity } from "./constants.js";
import { months } from "./constants.js";
import { days } from "./constants.js";

const date = new Date();

//------------HEADER COMPONENT----------

// date

let dayName = days[date.getDay()];
let day = date.getDate();
let month = months[date.getMonth()];
let year = date.getFullYear();
let currentDate = `${dayName}, ${month} ${day} ${year}`;

// location by geolocation and nav language

const fillSubHeader = (name) => {
  document.querySelector(".subhead").textContent = name + " - " + currentDate;
  localStorage.setItem('chosenCity', name);
} 

const determineLocation = () => {
  const browserLanguage = navigator.language;
  fillSubHeader(languageToCapitalCity[browserLanguage]); 
}

const getCityName = async (longitude, latitude) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.address.village || data.address.town || data.address.city;
  } catch (error) {
    console.error("Error fetching location name:", error);
    return null;
  }
};

const successCallback = async (position) => {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const locationName = await getCityName( longitude,latitude);

  if (locationName != null) {
      fillSubHeader(locationName)
  }
};

const errorCallback = (error) => {
  console.log(error);
  determineLocation()
};

navigator.geolocation.getCurrentPosition( successCallback,errorCallback);


//----------Favorite City Component----------

const favCityItemComponent = function (name) {
  return `
      <option value="${name}">${name}<option>
  `;
};

//----------List Item Component----------

const listItemComponent = function (name) {
  return `
      <option value="${name}">${name}</option>
  `;
};

//----------Card Container Component----------
const cardContainerComponent = function () {
  return `
      <section id="container"></section>
  `;
};

//----------Card Component----------
const cityCardComponent = function (
  date,
  name,
  country,
  icon,
  temp,
  condition
) {
  return `
      <div class="city-card">
          <p>${date}</p>
          <h5 id="name">${name}</h5>
          <p id="country">${country}</p>
          <img src="${icon}">
          <h6 id="temperature">${temp}</h6>
          <p id="condition">${condition}</p>
      </div>
  `;
};

//----------My Weather API key----------
const myKey = "dd27ce39ba9342f5a5a124154221605";

//----------LOAD EVENT----------
const loadEvent = function () {
  //----------VARIABLES FOR ELEMENTS----------

  //----------input element----------
  const search = document.getElementById("search");

  //----------search button element----------
  const searchButton = document.getElementById("submit");

  //----------fav button element----------
  const favButton = document.getElementById("favButton");

  //----------suggestions element----------
  const suggestionsElement = document.getElementById("suggestions");

  //----------EVENT LISTENERS----------

  //----------input element event listeners----------
  search.addEventListener("keypress", pressEnter);

  search.addEventListener("input", autoComplete);

  //----------search button event listener----------
  searchButton.addEventListener("click", searchButtonClick);

  //----------fav button event listener----------
  favButton.addEventListener("click", saveIt);

  //----------list item element event listener----------
  suggestionsElement.addEventListener("click", listItemClick);

  //----------document event listener - click outside the input----------
  document.addEventListener("click", showFav);

  //----------EVENT LISTENER FUNCTIONS----------

  //----------press enter----------
 const savedCity = localStorage.getItem('chosenCity');

  savedCity && getData(savedCity) && getImage(savedCity)

  function pressEnter(event) {
    if (event.key == "Enter") {
      if ((favButton.innerHTML = `<ion-icon name="heart"></ion-icon>`)) {
        favButton.innerHTML = `<ion-icon name="heart-outline"></ion-icon>`;
      }
      getData(search.value);
      getImage(search.value);
      search.value = "";
      suggestionsElement.innerHTML = "";
    }
  }

  //----------auto complete input----------
  function autoComplete() {
    if (search.value.length === 0) {
      Cities(favCities);
    } else {
      getCity(search.value);
    }
  }

  //----------click outside the input element----------
  function showFav(event) {
    if (!search.contains(event.target)) {
      suggestionsElement.innerHTML = "";
    } else {
      Cities(favCities);
    }
  }

  //----------search button click----------
  function searchButtonClick() {
    if ((favButton.innerHTML = `<ion-icon name="heart"></ion-icon>`)) {
      favButton.innerHTML = `<ion-icon name="heart-outline"></ion-icon>`;
    }
    getData(search.value);
    getImage(search.value);
    search.value = "";
    suggestionsElement.innerHTML = "";
  }

  //----------favorite button click----------
  let favCities = [];

  function saveIt() {
    if ((favButton.innerHTML = `<ion-icon name="heart-outline"></ion-icon>`)) {
      favCities.push(listOfName);
      Cities(favCities);
      favButton.innerHTML = `<ion-icon name="heart"></ion-icon>`;
      suggestionsElement.innerHTML = "";
    } else {
      favButton.innerHTML = `<ion-icon name="heart-outline"></ion-icon>`;
    }
  }

  //----------list item click----------
  function listItemClick(event) {
    if (event.target && event.target.nodeName === "OPTION") {
      search.value = event.target.value;
      suggestionsElement.innerHTML = "";
    }
  }

  //----------fetching weather data----------
  async function getData(value) {
    const response = await fetch(`
      http://api.weatherapi.com/v1/current.json?key=${myKey}&q=${value}&aqi=no
      `);

    //if the input is invalid
    if (response.status != 200) {
      alert("City not found!");
    } else {
      const cityWeather = await response.json();

      //weather card container element
      const cardContainerElement = document.getElementById("container");

      //current date
      const getLocalDate = function (localTime) {
        const year = parseInt(localTime.substring(0, 4));
        const month = parseInt(localTime.substring(5, 7));
        const day = parseInt(localTime.substring(8, 10));
        const date = new Date(`${year}, ${month}, ${day}`);

        //array of weekdays
        const weekDays = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ];

        const dayOfTheWeek = weekDays[date.getDay()];

        //array of months
        const monthOfYear = [
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
          "December"
        ];

        return `${dayOfTheWeek}, ${day} ${monthOfYear[month - 1]} ${year}`;
      };

      const currentDate = getLocalDate(cityWeather.location.localtime);

      //insert data to DOM
      cardContainerElement.innerHTML = cityCardComponent(
        `${currentDate}`,
        `${cityWeather.location.name}`,
        `${cityWeather.location.country}`,
        `${cityWeather.current.condition.icon}`,
        `${cityWeather.current.temp_c}°`,
        `${cityWeather.current.condition.text}`
      );

      //----------variable for the favorite button----------
      listOfName = cityWeather.location.name;
    }
  }

  //-----------Pexels API for background image---------------
  async function getImage(value) {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${value}`,
      {
        headers: {
          Authorization:
            "563492ad6f91700001000001ff24965070704f299ee63e106f4ed677"
        }
      }
    );

    const cityImage = await response.json();

    document.querySelector(
      "#city_img"
    ).style.backgroundImage = `url(${cityImage.photos[0].src.landscape})`;
  }

  //----------fetching autocomplete data----------
  async function getCity(value) {
    //make request to url
    const response = await fetch(`
      http://api.weatherapi.com/v1/search.json?key=${myKey}&q=${value}
      `);

    const cities = await response.json();

    //empty array for the city names
    let results = [];

    //iterate through the array of objects
    for (let i = 0; i < cities.length; i++) {
      //fill my empty array with the city names
      results.push(cities[i].name);
    }

    //if the input field is empty, we ain't no need no list no more!
    if (`${value}`.length === 0) {
      results = [];
      suggestionsElement.innerHTML = "";
    }

    //call the function which inserts the city names to DOM
    listItemHtml(results);
  }

  //----------insert city names to DOM----------
  function listItemHtml(results) {
    const item = results.map(listItemComponent).join(" ");
    suggestionsElement.innerHTML = item;
  }

  //----------insert city names to favorites----------
  function Cities(favCities) {
    const item = favCities.map(favCityItemComponent).join(" ");
    suggestionsElement.innerHTML = item;
  }
};

window.addEventListener("load", loadEvent);
