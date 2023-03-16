const fs = require("fs");
const puppeteer = require("puppeteer");

const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana",
    "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
    "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New_Hampshire", "New_Jersey", "New_Mexico", "New_York", "North_Carolina", "North_Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode_Island", "South_Carolina", "South_Dakota", "Tennessee",
    "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

(async () => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const data = {};

    for (var i = 0; i < states.length; i++) {

        // Go to page
        await page.goto(`https://en.wikipedia.org/wiki/${states[i]}`);

        // Get rawdata
        const populationDataYears = await page.$$eval(".us-census-pop tr th", ths => ths.map(th => th.innerText)); // Starts at 4
        const populationData = await page.$$eval(".us-census-pop tr td", tds => tds.map(td => td.innerText)); // Starts at 0, skips by 2

        // Organize rawdata
        rawdata = []

        yearIndex = 4;
        for (var dataIndex = 0; dataIndex < populationData.length-1; dataIndex+=3) {
            rawdata.push(
                {
                    year: populationDataYears[yearIndex],
                    population: populationData[dataIndex],
                    percentChange: populationData[dataIndex+2]
                }
            );
            yearIndex += 1;
        }

        data[states[i]] = rawdata;
        console.log(`✓${states[i]} data collected`);

    }

    // Save data
    fs.writeFile("data.json", JSON.stringify(data), error => console.log(error));

    await browser.close();

})();