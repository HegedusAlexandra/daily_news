"use strict";

import { languageToCapitalCity } from "./constants.js";
import { months,SYMBOLS,days,countryToLeagueMapping} from "./constants.js";
import { API_KEY_STOCK,API_KEY_WEATHER } from "./env.js";

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
  localStorage.setItem("chosenCity", name);
};

const determineLocation = () => {
  const browserLanguage = navigator.language;
  fillSubHeader(languageToCapitalCity[browserLanguage]);
};

const getCityName = async (longitude, latitude) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

  try {
    const response = await fetch(url,{
      headers: {
        'Accept-Language': 'en-US'
      }
    });
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

  const locationName = await getCityName(longitude, latitude);

  if (locationName != null) {
    fillSubHeader(locationName);
  }
};

const errorCallback = (error) => {
  console.log(error);
  determineLocation();
};

navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

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
          <h5 id="name">${name}</h5><p id="country">${country}</p>
          <div id='weather_condition'><h6 id="temperature">${temp}</h6><img src="${icon}"></div><p id="condition">${condition}</p>
      </div>
  `;
};

//----------My Weather API key----------
const myKey = API_KEY_WEATHER;

//----------LOAD EVENT----------
const loadEvent = function () {

  const search = document.getElementById("search");

  const searchButton = document.getElementById("submit");

  const suggestionsElement = document.getElementById("suggestions");

  search.addEventListener("keypress", pressEnter);

  search.addEventListener("input", autoComplete);

  searchButton.addEventListener("click", searchButtonClick);

  suggestionsElement.addEventListener("click", listItemClick);

  document.addEventListener("click", showFav);

  //----------EVENT LISTENER FUNCTIONS----------

  const savedCity = localStorage.getItem("chosenCity");

  savedCity && getData(savedCity) && getImage(savedCity);

  function pressEnter(event) {
    if (event.key == "Enter") {      
      getData(search.value);
      getImage(search.value);
      suggestionsElement.innerHTML = "";
    }
  }

  function autoComplete() {    
      getCity(search.value);    
  }

  function showFav() {    
      suggestionsElement.innerHTML = "";    
  }

  function searchButtonClick() {
    getData(search.value);
    getImage(search.value);
    search.value = "";
    suggestionsElement.innerHTML = "";
  }

  function listItemClick(event) {
    if (event.target && event.target.nodeName === "OPTION") {
      search.value = event.target.value;
      suggestionsElement.innerHTML = "";
    }
  }

  async function getData(value) {
    const response = await fetch(`
      http://api.weatherapi.com/v1/current.json?key=${myKey}&q=${value}&aqi=no
      `);

    if (response.status != 200) {
      alert("City not found!");
    } else {
      const cityWeather = await response.json();

      const cardContainerElement = document.getElementById("container");

      const getLocalDate = function (localTime) {
        const year = parseInt(localTime.substring(0, 4));
        const month = parseInt(localTime.substring(5, 7));
        const day = parseInt(localTime.substring(8, 10));
        const date = new Date(`${year}, ${month}, ${day}`);

        const dayOfTheWeek = days[date.getDay()];

        return `${dayOfTheWeek}, ${day} ${months[month - 1]} ${year}`;
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

  async function getCity(value) {
    const response = await fetch(`
      http://api.weatherapi.com/v1/search.json?key=${myKey}&q=${value}
      `);

    const cities = await response.json();

    let results = [];

    for (let i = 0; i < cities.length; i++) {
      results.push(cities[i].name);
    }

    if (`${value}`.length === 0) {
      results = [];
      suggestionsElement.innerHTML = "";
    }

    listItemHtml(results);
  }

  function listItemHtml(results) {
    const item = results.map(listItemComponent).join(" ");
    suggestionsElement.innerHTML = item;
  }

};

window.addEventListener("load", loadEvent);

//--------------STOCK-----------------


/*  async function fetchStockData(symbol) {
  const apiKey =  API_KEY_STOCK; 
  const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`; // Replace YOUR_API_KEY with your actual API key

  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data[0]; // The API returns an array, we're interested in the first item
  } catch (error) {
      console.error(`Fetching stock data for ${symbol} failed:`, error);
      return null;
  }
}

async function displayStocks() {
  const stocksContainer = document.getElementById('stocks_container');
  stocksContainer.innerHTML = ''; // Clear existing content

  for (let symbol of SYMBOLS) {
      const stockData = await fetchStockData(symbol);
      if (stockData) {
         const priceChange = stockData.change
         const arrowIconClass = priceChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
         const color = priceChange >= 0 ? 'green' : 'red';

          stocksContainer.innerHTML += `<div class="stocks_container_row">
              <p><b>${stockData.symbol}</b></p>
              <p>${parseFloat(stockData.price).toFixed(2)}$</p>
              <p>${stockData.change}%</p>
              <span style="color: ${color};"><i class="fas ${arrowIconClass}"></i></span>
            </div>`;
      }
  }
  stocksContainer.innerHTML += '<a href="https://financialmodelingprep.com/developer/docs/" >Data provided by Financial Modeling Prep</a>'
}

displayStocks(); // Call the function to fetch and display stock data  */

//------------------SPORT-------------------

/* async function fetchLast5SoccerEvents() {
  const navigatorLanguage = navigator.language.split('-')[0]; // Extract language code
  
  const leagueId = countryToLeagueMapping[navigatorLanguage] || countryToLeagueMapping['en']; // Default to 'de' if no match
  const apiUrl = `https://www.thesportsdb.com/api/v1/json/1/eventspastleague.php?id=${leagueId}`;

  try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      displayEvents(data.events.slice(0, 5)); // Display the last 5 events
  } catch (error) {
      console.error("Error fetching events:", error);
  }
}

function displayEvents(events) {
  const eventsContainer = document.getElementById('events');
  eventsContainer.innerHTML = ''; // Clear previous content

  events.forEach(event => {
      const eventElement = document.createElement('div');
      eventElement.innerHTML = `
          <h2>${event.strEvent}</h2>
          <p>Date: ${event.dateEvent}</p>
          <p>Result: ${event.intHomeScore} - ${event.intAwayScore}</p>
      `;
      eventsContainer.appendChild(eventElement);
  });
}

fetchLast5SoccerEvents(); */