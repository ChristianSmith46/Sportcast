var dateTimeEl = document.getElementById("dateTime");
var localWeatherEl = document.getElementById("localWeather");
var teamSelect = document.getElementById("teams");
var savedTeamsEl = document.getElementById("savedTeams");
var forecastEl = document.getElementById("forecast");
var matchupEl = document.getElementById("matchup");

var espnURL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/";
var weatherApiKey = "4024dd0ace3444c4f05da7654e63fece";

function init() {
    var team = JSON.parse(localStorage.getItem("saved-team"));
    if (team) {
        getMatchups(team.abbreviation);
    }
    setInterval(showTime, 1000);
    showTime()
    displaySavedTeam();
}

function showTime() {
    dateTimeEl.innerHTML = moment().format('MMMM Do YYYY, h:mm:ss a');
}

function searchTeam(){
    console.log(this.value);
    var newTeamObject = {
        name: this.options[this.selectedIndex].text,
        abbreviation: this.value
    }
    localStorage.setItem("saved-team", JSON.stringify(newTeamObject));
    displaySavedTeam();
    getMatchups(this.value);

}

function displaySavedTeam(){
    var team = JSON.parse(localStorage.getItem("saved-team"));
    savedTeamsEl.innerHTML = team.name;
    
}

function getMatchups(abbreviation){
    fetch(espnURL + abbreviation + "/schedule")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // console.log(data);
            var events = data.events;
            var eventCount = 0;
            for (let i = 0; i < events.length; i++){
                if (eventCount >= 2){
                    break;
                }

                var zipCode = events[i].competitions[0].venue.address["zipCode"];
                var header = events[i].name + " " + moment(data.events[i].competitions[0].date).format("MMMM Do h:mm a");

                var daysUntil = moment(data.events[i].competitions[0].date).format("DDD") - moment().format("DDD");
                if (daysUntil < 0){
                    continue;
                }

                if (zipCode){
                    getLatLon(zipCode, header, eventCount, daysUntil);
                } else if (events[i].competitions[0].venue.fullName === "Paycor Stadium") {
                    getLatLon(45202, header, eventCount, daysUntil);
                } else if (events[i].competitions[0].venue.fullName === "Acrisure Stadium"){
                    getLatLon(15212, header, eventCount, daysUntil);
                } else {
                    console.log("No Zipcode Found");
                }
                eventCount++;
            }
        });
}


function displayMatchup(index, header, weather){
    document.getElementById("matchupCard" + index).innerHTML = header;
    document.getElementById("weatherCard" + index).innerHTML = weather;
}

function getLatLon(zipCode, header, index, daysUntil){
    fetch("https://api.openweathermap.org/geo/1.0/zip?zip=" + zipCode + ",us&appid=" + weatherApiKey)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (daysUntil >= 0 && daysUntil < 8) {
                getWeather(data.lat, data.lon, header, index, daysUntil);
            } else {
                displayMatchup(index, header, "Weather out of range");
            }
        })

}

function getWeather(lat, lon, header, index, daysUntil) {
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&exclude=minutely,hourly,alerts&appid=" + weatherApiKey)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // console.log(data);
            displayMatchup(index, header, data.daily[daysUntil].weather[0].description + " " + data.daily[daysUntil].temp.day + "°F");
        });
}


teamSelect.addEventListener("change", searchTeam);

init(); 