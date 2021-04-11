const fs = require('fs');
const Papa = require('papaparse');
const request = require('request');

const POPULATION = 8606033 + 38650;
request.get('https://covid.ourworldindata.org/data/owid-covid-data.csv', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var csv = body;
        const owidData = Papa.parse(csv, {
            header: true,
        })
            .data.filter(data => data.iso_code === 'CHE' || data.iso_code === 'LIE');

        console.log(`Parsed CSV, nr of records: ${owidData.length}.`);

        const lastUpdate = owidData.reduce((latestFound, curr) => {
            if (new Date(curr.date) > new Date(latestFound)) {
                return curr.date;
            }
        }, 0);

        console.log({ lastUpdate });

        const hunData = {
            lastUpdate,
            history: owidData.map(owid => ({
                statusDate: owid.date,
                vaccinationRate: (+owid.total_vaccinations / POPULATION) * 100,
                vaccinatedPersons: +owid.new_vaccinations,
                administeredVaccineDoses: +owid.total_vaccinations,
            })).slice(Math.max(owidData.length - 15, 1)),
        };
        fs.writeFileSync('data.json', JSON.stringify(hunData, null, 2))
        console.log('Data successfully written to data.json.');
    } else {
        console.error({
            error: error && JSON.stringify(error),
            response: response && JSON.stringify(response),
        });
    }
});
