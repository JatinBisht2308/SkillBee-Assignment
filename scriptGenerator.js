const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ejs = require("ejs");

const api = "https://www.boredapi.com/api/activity";
const outputDir = "dist";
// this function will fetch data from the given API endpoint
async function getDataFromApi() {
  try {
    const uniqueDataObject = {};

    // Fetch data until we have 10 unique items or until we reach 20 attempts
    while (Object.keys(uniqueDataObject).length < 10) {
      const response = await axios.get(api);
      const data = response.data;

      // Assuming the API returns an object with a unique 'key' property, you can change the key as per your API response
      const uniqueKey = data.key;

      // Check if the data is unique before adding it to the object
      if (!uniqueDataObject[uniqueKey]) {
        uniqueDataObject[uniqueKey] = data;
      }
    }

    return uniqueDataObject;
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return null;
  }
}
async function generatePages() {
  const data = await getDataFromApi();
  if (data.length === 0) return;

  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Read the Eta template file
  const template = fs.readFileSync(
    path.join(__dirname, "template.ejs"),
    "utf-8"
  );

  // Generate pages using the template and dynamic data
  let index = 0;
  for (const key in data) {
    // console.log(key);
    // console.log(data[key]);
    const pageHtml = ejs.render(template, { data: data[key] });
    const outputPath = path.join(__dirname, outputDir, `page${index + 1}.html`);
    fs.writeFileSync(outputPath, pageHtml);
    console.log(`Generated page ${index + 1}`);
    const item = data[key];
   
    index++;
  }
}

generatePages();
