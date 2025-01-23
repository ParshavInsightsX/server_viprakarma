// const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
// const swisseph = require('swisseph-v2');
// const path = require('path');

// // Set ephemeris path
// swisseph.swe_set_ephe_path(path.join(__dirname, '../../ephe'));

// /**
//  * Create a Julian Day for local date/time by adjusting for timezone.
//  */
// function createJulianDay(year, month, day, hours, minutes, seconds, timezone) {
//   const totalHours = hours - timezone + (minutes / 60) + (seconds / 3600);
//   return swisseph.swe_julday(year, month, day, totalHours, swisseph.SE_GREG_CAL);
// }

// /**
//  * Get planetary positions in sidereal mode.
//  */
// async function getPlanetPositions(jd_ut, options = {}) {
//   const {
//     flags = swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SIDEREAL | swisseph.SEFLG_SPEED,
//     ayanamsha = swisseph.SE_SIDM_LAHIRI,
//   } = options;

//   swisseph.swe_set_sid_mode(ayanamsha, 0, 0);

//   const planets = [
//     { id: swisseph.SE_SUN, label: 'Sun' },
//     { id: swisseph.SE_MOON, label: 'Moon' },
//     { id: swisseph.SE_MERCURY, label: 'Mercury' },
//     { id: swisseph.SE_VENUS, label: 'Venus' },
//     { id: swisseph.SE_MARS, label: 'Mars' },
//     { id: swisseph.SE_JUPITER, label: 'Jupiter' },
//     { id: swisseph.SE_SATURN, label: 'Saturn' },
//     { id: swisseph.SE_TRUE_NODE, label: 'Rahu' },
//   ];

//   const results = [];
//   for (let planet of planets) {
//     const calcResult = await new Promise((resolve, reject) => {
//       swisseph.swe_calc_ut(jd_ut, planet.id, flags, (res) => {
//         if (res.error) return reject(res.error);
//         resolve(res);
//       });
//     });

//     results.push({
//       name: planet.label,
//       longitude: calcResult.longitude,
//       speed: calcResult.longitudeSpeed,
//     });
//   }

//   return results;
// }

// /**
//  * Generate a North Indian style chart using Chart.js
//  */
// async function generateChart(data, config) {
//   const { font_family, chart_background_color } = config;

//   // Initialize Chart.js renderer
//   const width = 500; // Canvas width
//   const height = 500; // Canvas height
//   const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

//   // Chart.js configuration
//   const chartConfig = {
//     type: 'radar',
//     data: {
//       labels: data.labels, // Planet names
//       datasets: [
//         {
//           label: 'Planet Positions',
//           data: data.values, // Planet longitudes
//           borderColor: '#BC412B',
//           backgroundColor: 'rgba(188, 65, 43, 0.2)',
//           pointBackgroundColor: '#BC412B',
//         },
//       ],
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       plugins: {
//         legend: {
//           display: true,
//           labels: {
//             font: {
//               family: font_family,
//             },
//           },
//         },
//       },
//       scales: {
//         r: {
//           angleLines: {
//             display: true,
//           },
//           suggestedMin: 0,
//           suggestedMax: 360,
//         },
//       },
//     },
//     plugins: [],
//   };

//   // Render chart as a buffer
//   return await chartJSNodeCanvas.renderToBuffer(chartConfig);
// }

// /**
//  * Main function to generate both Chalit (Birth) and Gochar (Transit) charts.
//  */
// async function generateCharts(inputs) {
//   const {
//     year,
//     month,
//     date,
//     hours,
//     minutes,
//     seconds,
//     latitude,
//     longitude,
//     timezone,
//     chart_config,
//   } = inputs;

//   // 1) Calculate Julian Day
//   const jdBirth = createJulianDay(year, month, date, hours, minutes, seconds, timezone);

//   // 2) Get planet positions
//   const birthPlanets = await getPlanetPositions(jdBirth);

//   // 3) Prepare data for Chart.js
//   const planetLabels = birthPlanets.map((p) => p.name);
//   const planetLongitudes = birthPlanets.map((p) => p.longitude);

//   const birthChartData = {
//     labels: planetLabels,
//     values: planetLongitudes,
//   };

//   // 4) Generate Chalit Chart
//   const chalitChartBuffer = await generateChart(birthChartData, chart_config);

//   // 5) Calculate Julian Day for Gochar (Transit)
//   const now = new Date();
//   const jdNow = createJulianDay(
//     now.getFullYear(),
//     now.getMonth() + 1,
//     now.getDate(),
//     now.getHours(),
//     now.getMinutes(),
//     now.getSeconds(),
//     timezone
//   );

//   // 6) Get planet positions for Transit
//   const transitPlanets = await getPlanetPositions(jdNow);

//   const transitChartData = {
//     labels: transitPlanets.map((p) => p.name),
//     values: transitPlanets.map((p) => p.longitude),
//   };

//   // 7) Generate Gochar Chart
//   const gocharChartBuffer = await generateChart(transitChartData, chart_config);

//   return { chalitChartBuffer, gocharChartBuffer };
// }

// module.exports = { generateCharts };
