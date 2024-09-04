import { useEffect, useRef, useState } from 'react';
import './App.css'

function App() {
  const API_KEY = import.meta.env.VITE_API_KEY;

  const [weatherInfo, setWeatherInfo] = useState({
    cityName: "",
    countryIcon: "",
    desc: "",
    weatherIcon: "",
    temp: "",
    windspeed: "",
    humidity: "",
    cloudiness: ""
  });
  const [grantLocationContainer, setGrantLocationContainer] = useState(false);
  const [loadingContainer, setLoadingContainer] = useState(false);
  const [userInfoContainer, setUserInfoContainer] = useState(false);
  const [errorContainer, setErrorContainer] = useState(false);
  const [formContainer, setFormContainer] = useState(false);
  const [currentTab, setCurrentTab] = useState("userTab");

  const searchInput = useRef()

  useEffect(() => {
    getfromSessionStorage()
  }, [])

  function switchTab(newTab) {
    if (newTab != currentTab) {
      setCurrentTab(newTab)
      if (!formContainer) {
        setUserInfoContainer(false)
        setErrorContainer(false)
        setFormContainer(true)
        setGrantLocationContainer(false)
      } else {
        setUserInfoContainer(false)
        setErrorContainer(false)
        setFormContainer(false)
        getfromSessionStorage()
      }
    }
  }

  function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
      setGrantLocationContainer(true)
    }
    else {
      const coordinates = JSON.parse(localCoordinates);
      fetchUserWeatherInfo(coordinates);
    }
  }

  async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates
    setGrantLocationContainer(false)
    setErrorContainer(false)
    setLoadingContainer(true)

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      if (data.cod == '404')
        throw "error"
      setLoadingContainer(false)
      setUserInfoContainer(true)
      renderWeatherInfo(data)
    }
    catch (err) {
      setLoadingContainer(false)
      setErrorContainer(true)
    }
  }

  function renderWeatherInfo(weatherInfo) {
    console.log(weatherInfo);
    setWeatherInfo({
      cityName: weatherInfo?.name,
      countryIcon: `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`,
      desc: weatherInfo?.weather?.[0]?.description,
      weatherIcon: `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`,
      temp: `${weatherInfo?.main?.temp} °C`,
      windspeed: `${weatherInfo?.wind?.speed} m/s`,
      humidity: `${weatherInfo?.main?.humidity}%`,
      cloudiness: `${weatherInfo?.clouds?.all}%`
    })
  }

  function showPosition(position) {
    const userCoordinates = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
  }

  async function fetchSearchWeatherInfo(city) {
    setLoadingContainer(true)
    setUserInfoContainer(false)
    setErrorContainer(false)
    setGrantLocationContainer(false)

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      if (data.cod == '404')
        throw "error"
      setLoadingContainer(false)
      setUserInfoContainer(true)
      renderWeatherInfo(data)
    }
    catch (err) {
      setLoadingContainer(false)
      setErrorContainer(true)
    }
  }

  return (
    <>
      <div className="wrapper">
        <h1>Weather App</h1>
        <div className="tab-container">
          <p className={`tab ${currentTab == "userTab" ? "current-tab" : ""}`} onClick={() => switchTab("userTab")}>
            Your Weather
          </p>
          <p className={`tab ${currentTab == "searchTab" ? "current-tab" : ""}`} onClick={() => switchTab("searchTab")}>
            Search Weather
          </p>
        </div>
        <div className="weather-container">
          {/* grant location container*/}
          {grantLocationContainer && (
            <div className="sub-container grant-location-container">
              <img src="./assets/location.png" width={80} height={80} loading="lazy" />
              <p>Grant Location Access</p>
              <p>Allow Access to get weather Information</p>
              <button className="btn" onClick={() => { navigator.geolocation.getCurrentPosition(showPosition) }}>
                Grant Access
              </button>
            </div>
          )}
          {/* search form-container*/}
          {formContainer && (
            <form className="form-container"
              onSubmit={(e) => {
                e.preventDefault();
                let city = searchInput.current.value;
                fetchSearchWeatherInfo(city);
              }}>
              <input placeholder="Search for City..." ref={searchInput} />
              <button className="btn" type="submit">
                <img src="./assets/search.png" width={20} height={20} loading="lazy" />
              </button>
            </form>
          )}
          {/*- loading screen container */}
          {loadingContainer && (
            <div className="sub-container loading-container">
              <img src="./assets/loading.gif" width={150} height={150} />
              <p>Loading</p>
            </div>
          )}
          {/* show weather info */}
          {userInfoContainer && (
            <div className="sub-container user-info-container">
              <div className="name">
                <p>{weatherInfo.cityName}</p>
                <img src={weatherInfo.countryIcon} />
              </div>
              <p>{weatherInfo.desc}</p>
              <img src={weatherInfo.weatherIcon} />
              <p>{weatherInfo.temp}</p>
              <div className="parameter-container">
                <div className="parameter">
                  <img src="./assets/wind.png" />
                  <p>Windspeed</p>
                  <p>{weatherInfo.windspeed}</p>
                </div>
                <div className="parameter">
                  <img src="./assets/humidity.png" />
                  <p>Humidity</p>
                  <p>{weatherInfo.humidity}</p>
                </div>
                <div className="parameter">
                  <img src="./assets/cloud.png" />
                  <p>Clouds</p>
                  <p>{weatherInfo.cloudiness}</p>
                </div>
              </div>
            </div>
          )}
          {/* error screen */}
          {errorContainer && (
            <div className="sub-container error-container">
              <img src="./assets/not-found.png" width={150} height={150} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default App
