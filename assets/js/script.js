var dateTimeEl = document.getElementById("dateTime");
var localWeatherEl = document.getElementById("localWeather");
var teamSelect = document.getElementById("teams");
var savedTeamsEl = document.getElementById("savedTeams");
var forecastEl = document.getElementById("forecast");
var matchupEl = document.getElementById("matchup");

var espnURL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/";
var weatherApiKey = "4024dd0ace3444c4f05da7654e63fece";

// dateTimeEl.innerHTML = moment().format('MMMM Do YYYY, h:mm:ss a');

function showTime() {
    dateTimeEl.innerHTML = moment().format('MMMM Do YYYY, h:mm:ss a');
}

function init() {
    var team = JSON.parse(localStorage.getItem("saved-team"));
    if (team) {
        getMatchups(team.abbreviation);
    }
    setInterval(showTime, 1000);
    showTime()
    displaySavedTeam();
}

function searchTeam(event){
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


// console.log(data.events[0].competitions[0].venue.address["zipCode"]);
// moment(data.events[0].competitions[0].date).format("MMMM Do h:mm:ss a")
function getMatchups(abbreviation){
    fetch(espnURL + abbreviation + "/schedule")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            var events = data.events;
            var eventCount;
            if (events.length > 3) {
                eventCount = 3;
            } else {
                eventCount = events.length;
            }
            for (let i = 0; i < eventCount; i++){
                var zipCode = events[i].competitions[0].venue.address["zipCode"];
                var header = events[i].name + " " + moment(data.events[i].competitions[0].date).format("MMMM Do h:mm a");

                var daysUntil = moment(data.events[i].competitions[0].date).format("DDD") - moment().format("DDD");

                console.log(header);
                if (zipCode){
                    getLatLon(zipCode, header, i, daysUntil);
                } else if (events[i].competitions[0].venue.fullName === "Paycor Stadium") {
                    getLatLon(45202, header, i, daysUntil);
                } else if (events[i].competitions[0].venue.fullName === "Acrisure Stadium"){
                    getLatLon(15212, header, i, daysUntil);
                } else {
                    console.log("No Zipcode Found");
                }
            }
        });
}


function displayMatchup(index, header, weather){
    document.getElementById("matchupCard" + index).innerHTML = header;
    document.getElementById("weatherCard" + index).innerHTML = weather;
}

function getLatLon(zipCode, header, index, daysUntil){
    fetch("http://api.openweathermap.org/geo/1.0/zip?zip=" + zipCode + ",us&appid=" + weatherApiKey)
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
            console.log(data);
            displayMatchup(index, header, data.daily[daysUntil].weather[0].description + " " + data.daily[daysUntil].temp.day);
        });
}




teamSelect.addEventListener("change", searchTeam);

init(); 