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
                var header = events[i].name + " " + moment(data.events[i].competitions[0].date).format("MMMM Do h:mm a")
                console.log(header);
                if (zipCode){
                    getLatLon(zipCode, header);
                } else if (events[i].competitions[0].venue.fullName === "Paycor Stadium") {
                    getLatLon(45202, header);
                } else {
                    console.log("No Zipcode Found");
                }
            }
        });
}


function displayMatchup(matchup){

}

function getLatLon(zipCode, header){
    fetch("http://api.openweathermap.org/geo/1.0/zip?zip=" + zipCode + ",us&appid=" + weatherApiKey)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            getWeather(data.lat, data.lon, header);
        })

}

function getWeather(lat, lon, header) {
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly,alerts&appid=" + weatherApiKey)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
        });
}




teamSelect.addEventListener("change", searchTeam);

init(); 