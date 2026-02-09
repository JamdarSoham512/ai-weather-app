from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


# ================= CITY SEARCH =================
@app.route("/get_city")
def get_city():

    city = request.args.get("city")

    if not city:
        return jsonify({"error": "City not provided"}), 400

    url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1"

    res = requests.get(url)
    data = res.json()

    if "results" not in data:
        return jsonify({"error": "City not found"}), 404

    result = data["results"][0]

    return jsonify({
        "lat": result["latitude"],
        "lon": result["longitude"],
        "name": result["name"],
        "country": result["country"]
    })


# ================= WEATHER =================
@app.route("/get_weather")
def get_weather():

    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if not lat or not lon:
        return jsonify({"error": "Location not found"}), 400

    url = (
        "https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        "&current_weather=true"
        "&hourly=temperature_2m,relativehumidity_2m,pressure_msl"
        "&timezone=auto"
    )

    try:
        res = requests.get(url, timeout=10)
        data = res.json()

        if "current_weather" not in data:
            return jsonify({"error": "Weather not available"}), 500

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= RUN =================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))