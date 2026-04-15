import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
// prevent browser from caching dynamic pagesth


app.get("/", (req, res) => {
  res.render("index.ejs", 
    { 
        title: "Home", 
        formData: null,  // no previous input yet
        error: null,
        forecast: null,
        willRain: null
});
});

app.get("/about", (req, res) => {
  res.render("about.ejs", { title: "About" });
});

app.post("/weather", async (req, res) => {
  const city = req.body.city;
  const formData = { city };
  const apiKey = process.env.WEATHER_API_KEY; // replace with your key

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);
    const weatherData = response.data;

    // if API says error
    if (weatherData.cod !== "200") {
      return res.render("index", { 
        title: "Home", 
        formData,
        error: weatherData.message,  // show error at top of index
        forecast: null,
        willRain: null
      });
    }

    // ✅ API successful → build forecast
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const forecasts = weatherData.list.filter(item => {
    const date = new Date(item.dt_txt);
    return date.getDate() === tomorrow.getDate() &&
         date.getMonth() === tomorrow.getMonth() &&
         date.getFullYear() === tomorrow.getFullYear();
});


    const willRain = forecasts.some(item =>
      item.weather.some(w => w.main.toLowerCase() === "rain")
    );

    return res.render("result", {
      title: "Result",
      city: weatherData.city.name,
      forecast: forecasts.map(f => ({
        time: f.dt_txt,
        description: f.weather[0].description
      })),
      willRain,
      error: null
    });

  } catch (error) {
    return res.render("index", { 
      title: "Home", 
      formData,
      error: "Failed to fetch weather",  // show error at top
      forecast: null,
      willRain: null
    });
  }
});

app.listen(port, () =>{
  console.log(`Server running at http://localhost:${port}`)
})