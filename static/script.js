let currentCity = null;
let chart = null;


/* ================= LOCATION ================= */

function getLocation() {

    if (!navigator.geolocation) {
        alert("Location not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => alert("Allow location access")
    );
}


/* ================= SEARCH ================= */

function searchCity() {

    const city = document.getElementById("city").value.trim();

    if (!city) {
        alert("Enter city name");
        return;
    }

    fetch(`/get_city?city=${city}`)
        .then(r => r.json())
        .then(data => {

            if (data.error) {
                alert(data.error);
                return;
            }

            currentCity = data.name;

            document.getElementById("cityName").innerText =
                `📍 ${data.name}, ${data.country}`;

            fetchWeather(data.lat, data.lon);
        })
        .catch(() => alert("City search failed"));
}


/* ================= WEATHER ================= */

function fetchWeather(lat, lon) {

    fetch(`/get_weather?lat=${lat}&lon=${lon}`)
        .then(r => r.json())
        .then(data => {

            if (!data.current_weather) {
                alert("Weather display failed");
                return;
            }

            showWeather(data);
            drawChart(data.hourly);

        })
        .catch(() => alert("Failed to load weather"));
}


function showWeather(data) {

    const c = data.current_weather;

    const info = getWeatherInfo(c.weathercode);

    document.getElementById("temperature").innerText =
        `${c.temperature} °C`;

    document.getElementById("description").innerText =
        info.text + " | " + getAdvice(c.temperature);

    document.getElementById("wind").innerText =
        `${c.windspeed} km/h`;


    /* ===== HUMIDITY & PRESSURE ===== */

    if (data.hourly) {

        const humidity =
            data.hourly.relativehumidity_2m[0];

        const pressure =
            data.hourly.pressure_msl[0];

        document.getElementById("humidity").innerText =
            humidity + " %";

        document.getElementById("pressure").innerText =
            pressure + " hPa";
    }


    /* AI Prediction */

    document.getElementById("ai").innerText =
        `🤖 AI Prediction: ${Math.round(c.temperature + 1)} °C`;
}


/* ================= WEATHER MAP ================= */

function getWeatherInfo(code) {

    if (code === 0) return { text: "Sunny ☀️" };
    if (code <= 2) return { text: "Partly Cloudy ⛅" };
    if (code <= 48) return { text: "Cloudy ☁️" };
    if (code <= 67) return { text: "Rain 🌧️" };
    if (code <= 77) return { text: "Snow ❄️" };
    if (code <= 99) return { text: "Storm ⛈️" };

    return { text: "Weather" };
}


/* ================= ADVICE ================= */

function getAdvice(temp) {

    if (temp < 10) return "Cold day. Wear jacket 🧥";
    if (temp < 20) return "Pleasant weather 🙂";
    if (temp < 30) return "Warm day. Stay hydrated 💧";

    return "Very hot. Avoid sun 🔥";
}


/* ================= VOICE AI ================= */

let recognition = null;


function initVoice() {

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice not supported");
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = function (e) {

        const text =
            e.results[0][0].transcript.toLowerCase();

        handleVoice(text);
    };
}


function startVoice() {

    if (!recognition) initVoice();

    recognition.start();
}


function handleVoice(text) {

    if (text.includes("weather") ||
        text.includes("temperature")) {

        speakCurrentWeather();
    }

    else if (text.includes("location")) {

        getLocation();
        speak("Getting your location");
    }

    else if (text.includes("search")) {

        let city =
            text.replace("search", "").trim();

        if (city) {

            document.getElementById("city").value = city;
            searchCity();

            speak("Searching " + city);
        }
    }

    else {
        speak("Command not recognized");
    }
}


function speak(msg) {

    let speech =
        new SpeechSynthesisUtterance(msg);

    window.speechSynthesis.speak(speech);
}


function speakCurrentWeather() {

    let temp =
        document.getElementById("temperature")?.innerText;

    let desc =
        document.getElementById("description")?.innerText;

    if (!temp || !desc) {

        speak("Please load weather first");
        return;
    }

    speak(`Temperature is ${temp}. ${desc}`);
}


/* ================= CHART ================= */

function drawChart(hourly) {

    if (!hourly ||
        !hourly.time ||
        !hourly.temperature_2m) return;

    const labels =
        hourly.time.slice(0, 12)
            .map(t => t.slice(11, 16));

    const temps =
        hourly.temperature_2m.slice(0, 12);

    const ctx =
        document.getElementById("weatherChart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{
                label: "Temperature (°C)",
                data: temps,
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },

        options: {

            responsive: true,

            plugins: {
                legend: { display: true }
            }
        }
    });
}


/* ================= PWA ================= */

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("/static/sw.js")
            .then(() => {
                console.log("Service Worker Registered");
            })
            .catch(err => {
                console.log("SW Error:", err);
            });

    });

}