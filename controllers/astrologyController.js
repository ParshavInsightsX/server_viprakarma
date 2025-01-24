//server\controllers\astrologyController.js
const NodeGeocoder = require('node-geocoder');
const { MhahPanchang } = require('mhah-panchang');
const { ApiClient } = require('@prokerala/api-client');
const IndianAstrology = require('indian-astrology');
const { calculateSunriseSunset, calculateAbhijeetMuhurt, calculateChoghadiya } = require("astrology-insights");
const axios = require('axios');
const Bottleneck = require('bottleneck');

// Geocoder Initialization
const geocodeInitializer = () => {
  return NodeGeocoder({
    provider: 'opencage',
    apiKey: process.env.OPENCAGE_API_KEY,
  });
};
// Generate ISO 8601 String
const getEncodedISO8601String = (dateStr, timeStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const dateObj = new Date(year, month - 1, day, hour, minute, 0);
  const offsetInMinutes = -dateObj.getTimezoneOffset();
  const absOffset = Math.abs(offsetInMinutes);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const offsetMins = String(absOffset % 60).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  const ss = String(dateObj.getSeconds()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}+${offsetHours}:${offsetMins}`;
};
// API Rate Limiter
const limiter = new Bottleneck({
  minTime: 500, // Minimum delay of 200ms between requests
});
// API Request Function with Retry Logic
const apiRequest = async (url, data, retries = 3) => {
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.ASTROLOGY_API_KEY,
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await limiter.schedule(() =>
        axios.post(url, data, { headers })
      );
      return response.data.output;
    } catch (error) {
      if (error.response?.status === 429 && attempt < retries - 1) {
        console.log(`Rate limit hit. Retrying... (${retries - attempt - 1} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retry
      } else {
        console.error("API Request Failed:", error.response?.data || error.message);
        throw error;
      }
    }
  }
  throw new Error("Max retries reached for API request.");
};
// Generate Kundli Controller
const generateKundli = async (req, res) => {
  try {
    const { fullName, dateOfBirth, timeOfBirth, placeOfBirth, gender } = req.body;

    if (!fullName || !dateOfBirth || !timeOfBirth || !placeOfBirth || !gender) {
      return res.status(400).json({ error: 'Missing required fields: fullName, dateOfBirth, timeOfBirth, or placeOfBirth.' });
    }
    // Geocoding Place of Birth
    const geocoder = geocodeInitializer();
    const geoResults = await geocoder.geocode(placeOfBirth);

    if (!geoResults || geoResults.length === 0) {
      return res.status(404).json({ error: 'Place of birth not found.' });
    }
    const { latitude, longitude } = geoResults[0];
    const iso8601String = getEncodedISO8601String(dateOfBirth, timeOfBirth);
    // Mhah Panchang Calculations
    const mhahPanchang = new MhahPanchang();
    const mhahObj = mhahPanchang.calculate(new Date(iso8601String));
    const mhahCal = mhahPanchang.calendar(new Date(iso8601String), latitude, longitude);
    //Fetch Using Astrology-Insights
    const timezone = "Asia/Kolkata"; // Indian timezone (change this to your desired timezone)
    const date = new Date(dateOfBirth);
    const { sunrise, sunset } = calculateSunriseSunset(date, latitude, longitude, timezone);
    const abhihijeetMuhurt = calculateAbhijeetMuhurt(dateOfBirth, sunrise, sunset, latitude, longitude, timezone);
    const choghadiya = calculateChoghadiya(dateOfBirth, sunrise, sunset, timezone);
    //Important Inputs for Kundli
    const inputs = {
      year: parseInt(dateOfBirth.split('-')[0]),
      month: parseInt(dateOfBirth.split('-')[1]),
      date: parseInt(dateOfBirth.split('-')[2]),
      hours: parseInt(timeOfBirth.split(':')[0]),
      minutes: parseInt(timeOfBirth.split(':')[1]),
      seconds: 0,
      latitude,
      longitude,
      timezone: 5.5,
      config: { observation_point: 'topocentric', ayanamsha: 'lahiri', language: 'en' },
      chart_config: {
        font_family: "Roboto",
        chart_style: "north_india",
        planet_name_font_size: "15px",
        native_name_font_size: "20px",
        native_details_font_size: "15px",
        chart_border_width: 1,
        chart_background_color: "#FFFFFF",
        chart_border_color: "#000000",
        native_details_font_color: "#000",
        native_name_font_color: "#231F20",
        planet_name_font_color: "#BC412B",
        chart_heading_font_color: "#2D3319"
      },
    };
    // Fetch Data from astrology APIs
    const mahadashaResult = await apiRequest('https://json.apiastro.com/vimsottari/maha-dasas', inputs);
    const mahadasha = JSON.parse(mahadashaResult);
    const antardashaResult = await apiRequest('https://json.apiastro.com/vimsottari/maha-dasas-and-antar-dasas', inputs);
    const antardasha = JSON.parse(antardashaResult);
    //Fetch Data from IndianAstrology
    const dateAndZone = IndianAstrology.getByDateAndZone(inputs.date, inputs.month, inputs.year, inputs.hours, inputs.minutes, 5.5, false);
    //charts
    const d1 = await apiRequest('https://json.apiastro.com/horoscope-chart-url', inputs);
    const d2  = await apiRequest('https://json.apiastro.com/d2-chart-url', inputs);
    const d3  = await apiRequest('https://json.apiastro.com/d3-chart-url', inputs);
    const d4  = await apiRequest('https://json.apiastro.com/d4-chart-url', inputs);
    const d5 = await apiRequest('https://json.apiastro.com/d5-chart-url', inputs);
    const d6 = await apiRequest('https://json.apiastro.com/d6-chart-url', inputs);
    const d7  = await apiRequest('https://json.apiastro.com/d7-chart-url', inputs);
    const d8 = await apiRequest('https://json.apiastro.com/d8-chart-url', inputs);
    const d9  = await apiRequest('https://json.apiastro.com/navamsa-chart-url', inputs);
    const d10  = await apiRequest('https://json.apiastro.com/d10-chart-url', inputs);
    const d11 = await apiRequest('https://json.apiastro.com/d11-chart-url', inputs);
    const d12  = await apiRequest('https://json.apiastro.com/d12-chart-url', inputs);
    const d30  = await apiRequest('https://json.apiastro.com/d30-chart-url', inputs);

    // // Fetch Data from ProKerala APIs
    // const client = new ApiClient(process.env.PROKERALA_CLIENT_ID, process.env.PROKERALA_CLIENT_SECRET);
    // const chalitcharts = await client.get('v2/astrology/chart', {
    //   'ayanamsa': 1,
    //   'coordinates': latitude + ',' + latitude,
    //   'datetime': iso8601String,
    //   'chart_type': "bhava",
    //   'chart_style': "north-indian",
    //   'format': "svg",
    //   'la': "en",
    // });
    // const mooncharts = await client.get('v2/astrology/chart', {
    //   'ayanamsa': 1,
    //   'coordinates': latitude + ',' + latitude,
    //   'datetime': iso8601String,
    //   'chart_type': "moon",
    //   'chart_style': "north-indian",
    //   'format': "svg",
    //   'la': "en",
    // });
    // Return the results
    res.json({
      fullName,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      gender,
      latitude,
      longitude,
      timezone,
      mhahObj,
      mhahCal,
      mahadasha,
      antardasha,
      sunrise,
      sunset,
      dateAndZone,
      choghadiya,
      abhihijeetMuhurt,
      d1,
      d2,
      d3,
      d4,
      d5,
      d6,
      d7,
      d8,
      d9,
      d10,
      d11,
      d12,
      d30,
      // chalitcharts,
      // mooncharts,
    });
  } catch (error) {
    console.error("Error generating Kundli:", error.message);
    res.status(500).json({ error: 'Error generating Kundli. Please try again later.' });
  }
};

module.exports = {
  generateKundli,
};


// //server\controllers\astrologyController.js
// const NodeGeocoder = require('node-geocoder');
// const { MhahPanchang } = require('mhah-panchang');
// const { ApiClient } = require('@prokerala/api-client');
// const IndianAstrology = require('indian-astrology');
// const { calculateSunriseSunset, calculateAbhijeetMuhurt, calculateChoghadiya } = require("astrology-insights");
// const axios = require('axios');
// const Bottleneck = require('bottleneck');

// // Geocoder Initialization
// const geocodeInitializer = () => {
//   return NodeGeocoder({
//     provider: 'opencage',
//     apiKey: process.env.OPENCAGE_API_KEY,
//   });
// };
// // Generate ISO 8601 String
// const getEncodedISO8601String = (dateStr, timeStr) => {
//   const [year, month, day] = dateStr.split('-').map(Number);
//   const [hour, minute] = timeStr.split(':').map(Number);
//   const dateObj = new Date(year, month - 1, day, hour, minute, 0);
//   const offsetInMinutes = -dateObj.getTimezoneOffset();
//   const absOffset = Math.abs(offsetInMinutes);
//   const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
//   const offsetMins = String(absOffset % 60).padStart(2, '0');
//   const yyyy = dateObj.getFullYear();
//   const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
//   const dd = String(dateObj.getDate()).padStart(2, '0');
//   const hh = String(dateObj.getHours()).padStart(2, '0');
//   const min = String(dateObj.getMinutes()).padStart(2, '0');
//   const ss = String(dateObj.getSeconds()).padStart(2, '0');

//   return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}+${offsetHours}:${offsetMins}`;
// };
// // API Rate Limiter
// const limiter = new Bottleneck({
//   minTime: 500, // 500 milliseconds
// });
// // API Request Function with Retry Logic

// const apiRequest = async (url, data, retries = 3) => {
//   const config = {
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': 'tiAhSusLaj2dCDrksS3kz62HFHu2sca02UjKIwpY'
//     },
//   };
//   for (let attempt = 0; attempt < retries; attempt++) {
//     try {
//       const response = await limiter.schedule(() =>
//         axios.post(url, data, config )
//       );
//       return response.data.output;
//     } catch (error) {
//       if (error.response?.status === 429 && attempt < retries - 1) {
//         console.log(`Rate limit hit. Retrying... (${retries - attempt - 1} retries left)`);
//         await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retry
//       } else {
//         console.error("API Request Failed:", error.response?.data || error.message);
//         throw error;
//       }
//     }
//   }
//   throw new Error("Max retries reached for API request.");
// };

// // Generate Kundli Controller
// const generateKundli = async (req, res) => {
//   try {
//     const { fullName, dateOfBirth, timeOfBirth, placeOfBirth, gender } = req.body;

//     if (!fullName || !dateOfBirth || !timeOfBirth || !placeOfBirth || !gender) {
//       return res.status(400).json({ error: 'Missing required fields: fullName, dateOfBirth, timeOfBirth, or placeOfBirth.' });
//     }
//     // Geocoding Place of Birth
//     const geocoder = geocodeInitializer();
//     const geoResults = await geocoder.geocode(placeOfBirth);

//     if (!geoResults || geoResults.length === 0) {
//       return res.status(404).json({ error: 'Place of birth not found.' });
//     }
//     const { latitude, longitude } = geoResults[0];
//     const iso8601String = getEncodedISO8601String(dateOfBirth, timeOfBirth);
//     // Mhah Panchang Calculations
//     const mhahPanchang = new MhahPanchang();
//     const mhahObj = mhahPanchang.calculate(new Date(iso8601String));
//     const mhahCal = mhahPanchang.calendar(new Date(iso8601String), latitude, longitude);
//     //Fetch Using Astrology-Insights
//     const timezone = "Asia/Kolkata"; // Indian timezone (change this to your desired timezone)
//     const date = new Date(dateOfBirth);
//     const { sunrise, sunset } = calculateSunriseSunset(date, latitude, longitude, timezone);
//     const abhihijeetMuhurt = calculateAbhijeetMuhurt(dateOfBirth, sunrise, sunset, latitude, longitude, timezone);
//     const choghadiya = calculateChoghadiya(dateOfBirth, sunrise, sunset, timezone);
//     //Important Inputs for Kundli
//     const inputs = {
//       year: parseInt(dateOfBirth.split('-')[0]),
//       month: parseInt(dateOfBirth.split('-')[1]),
//       date: parseInt(dateOfBirth.split('-')[2]),
//       hours: parseInt(timeOfBirth.split(':')[0]),
//       minutes: parseInt(timeOfBirth.split(':')[1]),
//       seconds: 0,
//       latitude,
//       longitude,
//       timezone: 5.5,
//       config: { observation_point: 'topocentric', ayanamsha: 'lahiri', language: 'en' },
//       chart_config: {
//         font_family: "Roboto",
//         chart_style: "north_india",
//         planet_name_font_size: "15px",
//         native_name_font_size: "20px",
//         native_details_font_size: "15px",
//         chart_border_width: 1,
//         chart_background_color: "#FFFFFF",
//         chart_border_color: "#000000",
//         native_details_font_color: "#000",
//         native_name_font_color: "#231F20",
//         planet_name_font_color: "#BC412B",
//         chart_heading_font_color: "#2D3319"
//       },
//     };

//     console.log('OPENCAGE_API_KEY:', process.env.OPENCAGE_API_KEY);
//     console.log('ASTROLOGY_API_KEY:', process.env.ASTROLOGY_API_KEY);
//     // Fetch Data from astrology APIs
//     const mahadashaResult = await apiRequest('https://json.apiastro.com/vimsottari/maha-dasas', inputs);
//     const mahadasha = JSON.parse(mahadashaResult);
//     const antardashaResult = await apiRequest('https://json.apiastro.com/vimsottari/maha-dasas-and-antar-dasas', inputs);
//     const antardasha = JSON.parse(antardashaResult);
//     //Fetch Data from IndianAstrology
//     const dateAndZone = IndianAstrology.getByDateAndZone(inputs.date, inputs.month, inputs.year, inputs.hours, inputs.minutes, 5.5, false);
//     //charts

//     const d1 = await apiRequest('https://json.apiastro.com/horos6cope-chart-url', inputs);
//     const d2 = await apiRequest('https://json.apiastro.com/d2-chart-url', inputs);
//     const d3 = await apiRequest('https://json.apiastro.com/d3-chart-url', inputs);
//     const d4 = await apiRequest('https://json.apiastro.com/d4-chart-url', inputs);
//     const d5 = await apiRequest('https://json.apiastro.com/d5-chart-url', inputs);
//     const d6 = await apiRequest('https://json.apiastro.com/d6-chart-url', inputs);
//     const d7 = await apiRequest('https://json.apiastro.com/d7-chart-url', inputs);
//     const d8 = await apiRequest('https://json.apiastro.com/d8-chart-url', inputs);
//     const d9 = await apiRequest('https://json.apiastro.com/navamsa-chart-url', inputs);
//     const d10 = await apiRequest('https://json.apiastro.com/d10-chart-url', inputs);
//     const d11 = await apiRequest('https://json.apiastro.com/d11-chart-url', inputs);
//     const d12 = await apiRequest('https://json.apiastro.com/d12-chart-url', inputs);
//     const d30 = await apiRequest('https://json.apiastro.com/d30-chart-url', inputs);

//     // Return the results
//     res.json({
//       fullName,
//       dateOfBirth,
//       timeOfBirth,
//       placeOfBirth,
//       gender,
//       latitude,
//       longitude,
//       timezone,
//       mhahObj,
//       mhahCal,
//       mahadasha,
//       antardasha,
//       sunrise,
//       sunset,
//       dateAndZone,
//       choghadiya,
//       abhihijeetMuhurt,
//       d1,
//       d2,
//       d3,
//       d4,
//       d5,
//       d6,
//       d7,
//       d8,
//       d9,
//       d10,
//       d11,
//       d12,
//       d30,
//     });
//   } catch (error) {
//     console.error("Error in generating Kundli:", error.message);
//     res.status(500).json({
//       error: 'Internal Server Error. Please try again later.',
//       message: error.message, // You can include the error message for debugging purposes
//     });
//   }
// };
// module.exports = {
//   generateKundli,
// };
