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
    getMatchup(this.value);

}

function displaySavedTeam(){
    var team = JSON.parse(localStorage.getItem("saved-team"));
    savedTeamsEl.innerHTML = team.name;
    
}


// console.log(data.events[0].competitions[0].venue.address["zipCode"]);
// moment(data.events[0].competitions[0].date).format("MMMM Do h:mm:ss a")
function getMatchup(abbreviation){
    fetch(espnURL + abbreviation + "/schedule")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            console.log(data.events[0].name + " " + moment(data.events[0].competitions[0].date).format("MMMM Do h:mm a"));
            console.log(data.events[0].competitions[0].venue.address["zipCode"]);
            var zipCode = data.events[0].competitions[0].venue.address["zipCode"];
            if (zipCode){
                getLatLon(zipCode);
            } else if (data.events[0].competitions[0].venue.fullName === "Paycor Stadium") {
                getLatLon(45202);
            } else {
                console.log("No Zipcode Found");
            }
        });
}


function displayMatchup(matchup){

}

function getLatLon(zipCode){
    fetch("http://api.openweathermap.org/geo/1.0/zip?zip=" + zipCode + ",us&appid=" + weatherApiKey)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            getWeather(data.lat, data.lon);
        })

}

function getWeather(lat, lon) {
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