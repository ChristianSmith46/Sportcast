// Set initial element variables
var dateTimeEl = document.getElementById("dateTime");
var localWeatherEl = document.getElementById("localWeather");
var teamSelect = document.getElementById("teams");
var savedTeamsEl = document.getElementById("savedTeams");
var forecastEl = document.getElementById("forecast");
var matchupEl = document.getElementById("matchup");

// Set variables for api keys and the espn api
var espnURL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/";
var weatherApiKey = "4024dd0ace3444c4f05da7654e63fece";

// Initial function called at the bottom
function init() {
    // Get the team object saved in local storage
    var team = JSON.parse(localStorage.getItem("saved-team"));
    // if there is an object then get the matchup of the saved team on load
    if (team) {
        getMatchups(team.abbreviation);
    }
    // Create interval that calls the showTime function
    setInterval(showTime, 1000);
    // Call showTime to set the time right away
    showTime();
    // Show the saved team in the html
    displaySavedTeam();
}

// Set innerHTML for the timer
function showTime() {
    dateTimeEl.innerHTML = moment().format('MMMM Do YYYY, h:mm:ss a');
}

// Get the team selected from the event listener and create localstorage
function searchTeam(){
    console.log(this.value);
    var newTeamObject = {
        name: this.options[this.selectedIndex].text,
        abbreviation: this.value
    }
    localStorage.setItem("saved-team", JSON.stringify(newTeamObject));
    displaySavedTeam();
    // Calls the function getMatchups with the value of the select chosen
    getMatchups(this.value);

}

// Set innerHTML to display the last team when reloading page
function displaySavedTeam(){
    var team = JSON.parse(localStorage.getItem("saved-team"));
    savedTeamsEl.innerHTML = team.name;
    
}

// Function that fetches the ESPN api
function getMatchups(abbreviation){
    fetch(espnURL + abbreviation + "/schedule")
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // console.log(data);
            // events is an array of the events from the api
            var events = data.events;
            // create a counter to determine how many games are usable
            var eventCount = 0;
            // Loop that iterates over each event in the events array
            for (let i = 0; i < events.length; i++){
                // If we already have our max events chosen to display then break
                if (eventCount >= 2){
                    break;
                }
                
                // Getting the zipcode of the venue the game is being played at
                var zipCode = events[i].competitions[0].venue.address["zipCode"];
                // Creating the text for the header of a card that shows the matchup and time of the game
                var header = events[i].name + " " + moment(data.events[i].competitions[0].date).format("MMMM Do h:mm a");

                // Determine how many days away the game is in order to see if it happened and if we can get weather data
                var daysUntil = moment(data.events[i].competitions[0].date).format("DDD") - moment().format("DDD");
                if (daysUntil < 0){
                    continue;
                }

                // Checking for a zipcode and manual set for stadiums that recently moved and are not set up in the api then get then call the getLatLon function
                if (zipCode){
                    getLatLon(zipCode, header, eventCount, daysUntil);
                } else if (events[i].competitions[0].venue.fullName === "Paycor Stadium") {
                    getLatLon(45202, header, eventCount, daysUntil);
                } else if (events[i].competitions[0].venue.fullName === "Acrisure Stadium"){
                    getLatLon(15212, header, eventCount, daysUntil);
                } else {
                    console.log("No Zipcode Found");
                }
                // Increment the eventCount variable because we used the current event if we got this far
                eventCount++;
            }
        });
}

// Setting the innerHTML for the cards
function displayMatchup(index, header, weather){
    document.getElementById("matchupCard" + index).innerHTML = header;
    document.getElementById("weatherCard" + index).innerHTML = weather;
}

// Fetch the lat and lon from a zipcode using open weather's geo api
function getLatLon(zipCode, header, index, daysUntil){
    fetch("https://api.openweathermap.org/geo/1.0/zip?zip=" + zipCode + ",us&appid=" + weatherApiKey)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Determine if the matchup is close enough to get weather data if not go right ahead and display
            if (daysUntil >= 0 && daysUntil < 8) {
                getWeather(data.lat, data.lon, header, index, daysUntil);
            } else {
                displayMatchup(index, header, "Weather out of range");
            }
        })

}

// Api call to get the weather data for a location
function getWeather(lat, lon, header, index, daysUntil) {
    fetch("https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&exclude=minutely,hourly,alerts&appid=" + weatherApiKey)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // console.log(data);
            // Call display matchup with the weather data for the day we want
            displayMatchup(index, header, data.daily[daysUntil].weather[0].description + " " + data.daily[daysUntil].temp.day + "°F");
        });
}

// Event listener for the change of the select for the nfl teams
teamSelect.addEventListener("change", searchTeam);

// Call init function at the top
init(); 