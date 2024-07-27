const sheetId = PropertiesService.getScriptProperties().getProperty("sheet_id");
const apiToken = PropertiesService.getScriptProperties().getProperty("api_key");
const siteId = PropertiesService.getScriptProperties().getProperty("site_id");

const options = {
  method: "get",
  headers: {
    Authorization: `Bearer ${apiToken}`,
  },
};

// Organic source filter definition
const sourceFilter = "==Google|Bing|DuckDuckGo|Yandex|Yahoo!|ya.ru;";


/**
 * Main function to fetch data from the API and insert it into Google Sheets
 * Modify startDate and endDate to set the desired date range for data fetching.
 */

function main() {

  // Uncomment and set these dates in YYYY-MM-DD format to fetch data over a range of dates.
  /*
  var startDate = new Date("2024-05-01");
  var endDate = new Date("2024-06-26");
  */

  // Comment the string below if you want to fetch data over a range of dates.
  const date = getYesterdayAsString();

  // Read entry page filters from Google Sheets column (A is 0)
  const entryPageFilter = getEntryPageFromSheet("Pillar Management", 0);
  console.log(entryPageFilter);

  // Read all pillar pages Google Sheets column (A is 0)
  const pillarPages = getDataFromColumn("Pillar Management", 2);
  console.log(pillarPages);

  /**
   * Loop through each date in the specified range
   * Uncomment the following block to enable date range processing
   */
  /*
  while (startDate <= endDate) {
    const date = formatDateAsString(startDate);
  */

  // Fetch page-related data
  fetchAndInsertPageData(date, entryPageFilter);

  // Fetch daily-related data
  fetchAndInsertDailyData(date, entryPageFilter);

  // Fetch goal-related data
  pillarPages.forEach(page => {
    fetchAndInsertGoalData(date, page);
  });

  // Prepare the next date, uncomment to fetch data over a range of dates.
  
  /*  startDate.setDate(startDate.getDate() + 1);
  } */

}

// Fetches entry page filter from Google Sheets

function getEntryPageFromSheet(sheetName, column) {
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();

  // Assuming the first row is the header
  const paths = data.slice(1) // Skip the header
    .map((row) => row[column]) // Extract paths from the specified column
    .filter((path) => path && path.trim() !== ""); // Keep only non-blank, non-empty paths

  // Create the filter with '==' at the start and then join paths with '**|' (ensure no '==' in each path)
  const filter = `==${paths.map((path) => `${path}**`).join("|")}`;

  return filter;
}

function getDataFromColumn(sheetName, column) {
  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();

  // Assuming the first row is the header
  const arr = data.slice(1)  // Skip the header
    .map((row) => row[column])      // Extract paths from the first column
    .filter((path) => path && path.trim() !== "");  // Keep only non-blank, non-empty paths

  return arr;  // Return the array of data
}

/**
 * Fetches and inserts page-related data into Google Sheets
 */

function fetchAndInsertPageData(date, entryPageFilter) {
  const url = `https://plausible.io/api/v1/stats/breakdown?site_id=${siteId}&period=day&date=${date}&property=visit:entry_page&metrics=visits,visitors,pageviews,bounce_rate,events,visit_duration&filters=visit:source${encodeURIComponent(
    sourceFilter
  )}visit:entry_page${encodeURIComponent(entryPageFilter)}`;

  const response = fetchAndParseJson(url);
  if (response) {
    parsePageResponse(date, response.results);
  }
}

/**
 * Fetches and inserts daily-related data into Google Sheets
 */


function fetchAndInsertDailyData(date, entryPageFilter) {
  const url = `https://plausible.io/api/v1/stats/timeseries?site_id=${siteId}&interval=date&period=day&date=${date}&metrics=visits,visitors,pageviews,bounce_rate,visit_duration&filters=visit:source${encodeURIComponent(
    sourceFilter
  )}visit:entry_page${encodeURIComponent(entryPageFilter)}`;

  const response = fetchAndParseJson(url);
  if (response) {
    parseDailyResponse(response.results);
  }
}

/**
 * Fetches and inserts goal-related data into Google Sheets
 */

function fetchAndInsertGoalData(date, page) {
  const url = `https://plausible.io/api/v1/stats/breakdown?site_id=${siteId}&period=day&date=${date}&property=event:goal&metrics=visitors,events&filters=visit:source${encodeURIComponent(
    sourceFilter
  )}visit:entry_page==${page}`;

  const response = fetchAndParseJson(url);
  if (response) {
    parseGoalResponse(date, response.results, page);
  }
}

/**
 * Parses page-related data and inserts it into Google Sheets
 */

function parsePageResponse(date, data) {
  const results = data.map((entry) => [
    date,
    entry.entry_page,
    entry.visits,
    entry.visitors,
    entry.pageviews,
    entry.events,
    entry.bounce_rate,
    entry.visit_duration,
  ]);

  insertDataToSheet("MP - Pages", [
    "Date",
    "Entry Page",
    "Sessions",
    "Users",
    "Pageviews",
    "Events",
    "Bounce Rate",
    "Visit Duration",
  ], results);
}

/**
 * Parses daily-related data and inserts it into Google Sheets
 */

function parseDailyResponse(data) {
  const dailyData = [
    data[0].date,
    data[0].visits,
    data[0].visitors,
    data[0].pageviews,
    data[0].bounce_rate,
    data[0].visit_duration,
  ];

  insertDataToSheet("MP - Date", ["Date", "Sessions", "Users", "Pageviews", "Bounce Rate", "Visit Duration"], [dailyData]);
}

/**
 * Parses goal-related data and inserts it into Google Sheets
 */

function parseGoalResponse(date, data, page) {
  const results = data.map((entry) => [
    date,
    page,
    entry.goal,
    entry.visitors,
    entry.events,
  ]);

  insertDataToSheet("MP - Goals", ["Date", "Page", "Goal", "Users", "Events"], results);
}

/**
 * Inserts data into a specified Google Sheet
 */

function insertDataToSheet(sheetName, headers, data) {

  if (data.length === 0) {
    console.log("No data to insert.");
    return; // Exit the function if there's no data to insert
  }

  const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);

  // Insert header if it's the first row
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  sheet.getRange(sheet.getLastRow() + 1, 1, data.length, headers.length).setValues(data);
}

/**
 * Fetches and parses JSON data from a specified URL
 */

function fetchAndParseJson(url) {
  try {
    const response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.getContentText());
  } catch (e) {
    console.error("Error fetching data:", e.message);
    return null;
  }
}

/**
 * Returns yesterday's date in YYYY-MM-DD format
 */

function getYesterdayAsString() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const year = yesterday.getFullYear();
  const month = ("0" + (yesterday.getMonth() + 1)).slice(-2); // Pad month with leading zero
  const day = ("0" + yesterday.getDate()).slice(-2);

  return `${year}-${month}-${day}`;
}

/**
 * Formats a given Date object into a string in YYYY-MM-DD format.
 */
function formatDateAsString(date) {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}
