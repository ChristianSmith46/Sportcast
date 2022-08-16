var dateTimeEl = document.getElementById("dateTime");
var localWeatherEl = document.getElementById("localWeather");
var teamSelect = document.getElementById("teams");
var savedTeamsEl = document.getElementById("savedTeams");
var forecastEl = document.getElementById("forecast");
var matchupEl = document.getElementById("matchup");

var espnURL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/";
var weatherApiKey = "4024dd0ace3444c4f05da7654e63fece";
var weatherURL = "http://api.openweathermap.org/data/2.5/weather?zip=";


function init() {
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
            getWeather(data.events[0].competitions[0].venue.address["zipCode"]);
        });
}


function displayMatchup(matchup){

}

function getWeather(zipCode){
    fetch(weatherURL + zipCode + ",us&appid=" + weatherApiKey)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
        });

}




teamSelect.addEventListener("change", searchTeam);

init(); 