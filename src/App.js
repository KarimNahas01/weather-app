import './App.css';
import Axios from 'axios';
import { useEffect, useState } from 'react';


function App() {
  
  const API_KEY = "1c72787291039168ac2855f0deb815d7";
  const TIME_OF_DAY = "12:00";

  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [city, setCity] = useState("Gothenburg");
  const [errorVisible, setErrorVisible] = useState("hidden");
  
  useEffect(() => fetchData(), []);
  
  const fetchWeatherData = (latitude, longitude) => {
    Axios.get(`https://api.openweathermap.org/data/2.5/weather?&units=metric&lat=${latitude}&lon=${longitude}&appid=${API_KEY}&lang=en`)
      .then((res) => {
        if (res.data != null) {
          setWeatherData(res.data);
          setCity(res.data.name);
          return res.data
        }
      });
  }

  const fetchForecastData = (latitude, longitude) => {
    Axios.get(`https://api.openweathermap.org/data/2.5/forecast?&units=metric&lat=${latitude}&lon=${longitude}&appid=${API_KEY}&lang=en`)
      .then((res) => setForecastData(res.data.list));
  }

  const fetchData = (latitude, longitude) => {
    Axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&units=metric&appid=${API_KEY}`).then((geoRes) => {
      if (geoRes.data.length === 0) setErrorVisible("visible")
      else setErrorVisible("hidden")
      if (!latitude || !longitude) {
        latitude = geoRes.data[0].lat;
        longitude = geoRes.data[0].lon;
      }
      fetchWeatherData(latitude, longitude);
      fetchForecastData(latitude, longitude);
    });
  }
  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      fetchData();
    }
  };

  const getTemperature = (temp) => {
    return Math.round(temp) +  " °C"
  } 

  const getWeatherIcon = (icon=weatherData?.weather[0].icon) => {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`
  }

  const getWeatherDescription = (desc=weatherData?.weather[0].description) => {
    return desc == null ? "" : desc.charAt(0).toUpperCase() + desc.slice(1);
  }

  const getDateData = (dt) => {
    if (!dt) return;
    var date = new Date(dt * 1000);
    var weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return {
      day: date.getDate(),
      month: month[date.getMonth()],
      weekDay: weekDays[date.getDay()]
    }
  }

  const renderFiveDaysForecast = () => {
    var forecastItems = [];
    if (!forecastData) return;
    var newForecastData = forecastData.filter(data => data.dt_txt.slice(11, 16) == TIME_OF_DAY);
    newForecastData.forEach((currentDayData) => {
      var currentDayDate = getDateData(currentDayData?.dt);
      var currentDayItem = { 
          weekday: currentDayDate?.weekDay,
          date: currentDayDate?.day + " " + currentDayDate?.month, 
          temp: getTemperature(currentDayData?.main.temp),
          icon: getWeatherIcon(currentDayData?.weather[0].icon),
          description: getWeatherDescription(currentDayData?.weather[0].description)
      }
      forecastItems.push(currentDayItem)
    });
    return forecastItems.map(item => 
          <div className='forecast-items'>
            <p className='week-day'>{item.weekday}</p>
            <p className='date'>{item.date}</p>
            <img src={item.icon}/>
            <p className='temp'>{item.temp}</p>
            <p className='desc'>{item.description}</p>
          </div>);
  }

  return (
    <div id='app'>
      <p id='weather-logo'>WeatherApp</p>
      <div id='search-container'>
        <input id='search-field' onKeyDown={handleKeyDown} onInput={(event) => setCity(event.target.value)} placeholder="Enter city..."/>
        <button onClick={fetchData} id='search-button'>Search</button>
        <p id='error-message' style={{visibility: errorVisible}}>City not found!</p>
      </div>
      <div id='weather-info-container'>
        <div id='left-weather-container'>
            <p className='response-text' id='city-text'>{weatherData?.name}, {weatherData?.sys.country}</p>
            <div id='weather-image'>
              <img src={getWeatherIcon()}></img>
              <p>{getWeatherDescription()}</p>
            </div>
        </div>
        <div id='right-weather-container'>
            <p className='response-text' id='temperature-text'>{getTemperature(weatherData?.main.temp)}</p>
            <p id='feels-like' className='response-text'>Feels like {getTemperature(weatherData?.main.feels_like)}</p>
        </div>
      </div>
      <div id='forecast-container'>
        {renderFiveDaysForecast()}
      </div>
    </div>
  );
}

export default App;