//server\controllers\kundliController.js
const NodeGeocoder = require('node-geocoder');
const SunCalc = require('suntimes'); // Adjusted for compatibility with CommonJS
const { getSunSign, getAscendant, getMoonSign, getMockHouses } = require('./kundliHelper'); // Assuming you refactor some helper functions to a separate file

/**
 * Initializes the geocoder.
 */
function geocodeInitializer() {
  try {
    const geocoder = NodeGeocoder({
      provider: 'opencage',
      apiKey: process.env.OPENCAGE_API_KEY,
    });
    console.log('Geocoder initialized successfully.');
    return geocoder;
  } catch (error) {
    console.error('Failed to initialize Geocoder:', error.message);
    process.exit(1);
  }
}

/**
 * Converts time from UTC to IST and formats it.
 * @param {string} sunstr - Sunrise or sunset time in UTC (ISO format).
 * @returns {string} Formatted time in IST.
 */
function zoneConversion(sunstr) {
  let zone = 'am';
  const suntime = sunstr.split('T')[1];
  let [hour, minute, second] = suntime.split(':').map(Number);

  hour += 5;
  minute += 30;
  if (minute >= 60) {
    minute -= 60;
    hour += 1;
  }
  if (hour >= 24) {
    hour -= 24;
  }
  if (hour > 12) {
    hour -= 12;
    zone = 'pm';
  }

  return `${hour}:${minute}:${second} ${zone}`;
}

/**
 * Generates a Kundli with planetary data.
 */
const generateKundli = async (req, res) => {
  try {
    const { fullName, dateOfBirth, timeOfBirth, placeOfBirth } = req.body;

    if (!fullName || !dateOfBirth || !timeOfBirth || !placeOfBirth) {
      return res.status(400).json({ error: 'Missing required fields: fullName, dateOfBirth, timeOfBirth, or placeOfBirth.' });
    }

    const geocoder = geocodeInitializer();
    const geoResults = await geocoder.geocode(placeOfBirth);
    if (!geoResults || geoResults.length === 0) {
      return res.status(404).json({ error: 'Place of birth not found.' });
    }

    const { latitude, longitude } = geoResults[0];
    const [year, month, day] = dateOfBirth.split('-').map(Number);
    const sunriseUTC = SunCalc.getSunriseDateTimeUtc(new Date(year, month - 1, day), latitude, longitude);
    const sunsetUTC = SunCalc.getSunsetDateTimeUtc(new Date(year, month - 1, day), latitude, longitude);

    const sunrise = zoneConversion(sunriseUTC);
    const sunset = zoneConversion(sunsetUTC);

    const sunSign = getSunSign(month, day);
    const ascendant = getAscendant(new Date().getHours());
    const moonSign = getMoonSign(year, month, day);
    const houses = getMockHouses();

    const kundliData = {
      fullName,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      latitude,
      longitude,
      sunSign,
      ascendant,
      moonSign,
      houses,
      sunrise,
      sunset,
    };

    return res.json({ success: true, kundli: kundliData });
  } catch (error) {
    console.error('Error generating Kundli:', error.message);
    res.status(500).json({ error: 'Error generating Kundli. Please try again later.' });
  }
};

module.exports = {
  generateKundli,
};
