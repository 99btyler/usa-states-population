const fs = require("fs");
const puppeteer = require("puppeteer");


// Formatted for Wikipedia's url and "historical population" table
const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana",
    "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
    "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New_Hampshire", "New_Jersey", "New_Mexico", "New_York", "North_Carolina", "North_Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode_Island", "South_Carolina", "South_Dakota", "Tennessee",
    "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];
const YEAR_EARLIEST = 1790;
const YEAR_LATEST = 2020;
const YEAR_INCREMENT = 10;


(async () => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Create csv_header
    let csv_header = "state;";
    for (var year = YEAR_EARLIEST; year <= YEAR_LATEST; year+=YEAR_INCREMENT) {
        csv_header += `${year}(population);${year}(percentChange);`;
    }
    csv_header = `${csv_header.slice(0, -1)}\n`;
    fs.writeFile("data.csv", csv_header, error => error ? console.log(error) : console.log("✓ Created csv_header"));

    // Create csv_data
    for (const state in states) {

        await page.goto(`https://en.wikipedia.org/wiki/${states[state]}`);
        const rawdata = await page.$$eval(".us-census-pop tr", trs => trs.map(tr => tr.innerText));

        let csv_line = `${states[state]};`;
        let expected_year = YEAR_EARLIEST;
        for (var i = 1; i < rawdata.length-1; i++) {

            const row = rawdata[i].split("\t"); // 0=year, 1=population, 2='', 3=percentChange
            const state_year = row[0];
            const state_population = row[1];
            const state_percentChange = row[3];

            while (expected_year < parseInt(state_year)) {
                csv_line += "—;—;";
                expected_year += YEAR_INCREMENT;
            }
            csv_line += `${state_population};${state_percentChange};`;
            expected_year += YEAR_INCREMENT;

        }

        csv_line = `${csv_line.slice(0, -1)}\n`;
        fs.appendFile("data.csv", csv_line, error => error ? console.log(error) : console.log(`✓ Added csv_line ${states[state]}`));

    }

    await browser.close();

})();