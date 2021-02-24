if (location.protocol !== 'https:' && !location.href.includes("://localhost"))
{
    location.href = 'https:' + location.href.substring(location.protocol.length);
}

const vaccinationData = [
    {
        "statusDate" : "2021-02-14",
        "vaccinationRate" : 1.18,
        "vaccinatedPersons" : 102390,
        "administeredVaccineDoses" : 542848
    },
    {
        "statusDate" : "2021-02-15",
        "vaccinationRate" : 1.24,
        "vaccinatedPersons" : 107118,
        "administeredVaccineDoses" : 525334
    },
    {
        "statusDate" : "2021-02-16",
        "vaccinationRate" : 1.30,
        "vaccinatedPersons" : 112527,
        "administeredVaccineDoses" : 563073
    },
    {
        "statusDate" : "2021-02-17",
        "vaccinationRate" : 1.60,
        "vaccinatedPersons" : 138016,
        "administeredVaccineDoses" : 614066
    },
    {
        "statusDate" : "2021-02-18",
        "vaccinationRate" : 1.66,
        "vaccinatedPersons" : 143703,
        "administeredVaccineDoses" : 625196
    },
    {
        "statusDate" : "2021-02-19",
        "vaccinationRate" : 1.73,
        "vaccinatedPersons" : 149719,
        "administeredVaccineDoses" : 635089
    },
    {
        "statusDate" : "2021-02-20",
        "vaccinationRate" : 1.74,
        "vaccinatedPersons" : 150831,
        "administeredVaccineDoses" : 636780
    },
    {
        "statusDate" : "2021-02-21",
        "vaccinationRate" : 2.01,
        "vaccinatedPersons" : 173407,
        "administeredVaccineDoses" : 675556
    }
];

const vaccinationStatusDates = vaccinationData.map(function (row) { return row.statusDate; });
const vaccinationDataPercent = vaccinationData.map(function (row) { return row.vaccinationRate; });

function toDate(dateString) {
    return new Date(dateString + 'T00:00:00.000Z');
}

function toDateString(date) {
    return ('0' + date.getDate()).slice(-2) + '.'
        + ('0' + (date.getMonth()+1)).slice(-2) + '.'
        + date.getFullYear();
}

function toNumberString(number) {
    return typeof number == 'number' ? number.toLocaleString("de-CH") : number;
}

function toDurationString(numberOfDays) {
    let years = 0;
    while (numberOfDays >= 365) {
        years++;
        numberOfDays -= 365;
    }
    const yearText = years === 1 ? "Jahr" : "Jahre";

    let months = 0;
    while (numberOfDays >= 30) {
        months++;
        numberOfDays -= 30;
    }
    const monthText = months === 1 ? "Monat" : "Monate";

    const days = numberOfDays;
    const dayText = days === 1 ? "Tag" : "Tage";

    return years + " " + yearText + ", " + months + " " + monthText + ", " + days + " " + dayText;
}

function updateChart() {
    const threshold = new Array(vaccinationDataPercent.length).fill(70);
    const ctx = document.getElementById('vaccinationChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: vaccinationStatusDates,
            datasets: [
                { label: 'vollständig geimpft', data: vaccinationDataPercent, borderColor: '#dc1c13', borderWidth: 3, fill: false },
                { label: 'Herdenimmunität (70%)', data: threshold, borderColor: '#69f0ae', borderWidth: 1, fill: false }
            ]
        },
        options: {
            title: {
                display: false
            },
            legend: {
                display: true
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        suggestedMax: 100
                    }
                }]
            },
            responsive: true,
        }
    });
}

function updateTable() {
    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds

    const statusDate = toDate(vaccinationData[vaccinationData.length - 1].statusDate);
    const administeredVaccineDoses = vaccinationData[vaccinationData.length - 1].administeredVaccineDoses;

    const residents = 8606033 + 38650; // Schweiz und Liechtenstein (Stand 2019, Bundesamt für Statistik)
    const toBeVaccinated = Math.round(residents * .7);
    const vaccinatedPersons = vaccinationData[vaccinationData.length - 1].vaccinatedPersons;
    const stillToBeVaccinated = toBeVaccinated - vaccinatedPersons;
    const stillRequiredVaccineDoses = stillToBeVaccinated * 2;

    const vaccinationRateDays = 7;
    const vaccinationRateDaysIndex = vaccinationRateDays + 1;
    const administeredVaccineDosesBefore = vaccinationData[vaccinationData.length - vaccinationRateDaysIndex].administeredVaccineDoses;
    const vaccinationRateLast = Math.round((administeredVaccineDoses - administeredVaccineDosesBefore) / vaccinationRateDays);

    const deviation = Math.ceil(Math.abs(Date.now() - statusDate) / oneDay) - 1;
    const daysToGo = Math.round(stillRequiredVaccineDoses / vaccinationRateLast) - deviation;
    const endDate = new Date().setDate(new Date().getDate() + daysToGo);

    document.getElementById("endDate").innerHTML = toDateString(new Date(endDate));
    document.getElementById("daysToGo").innerHTML = toNumberString(daysToGo);
    document.getElementById("daysToGoText").innerHTML = toDurationString(daysToGo);

    document.getElementById("residents").innerHTML = toNumberString(residents);
    document.getElementById("toBeVaccinated").innerHTML = toNumberString(toBeVaccinated);
    document.getElementById("vaccinatedPersons").innerHTML = toNumberString(vaccinatedPersons);
    document.getElementById("vaccinationRateLast").innerHTML = toNumberString(vaccinationRateLast);

    const vaccinationRateDaysElements = document.getElementsByClassName("vaccinationRateDays");
    for (let i = 0; i < vaccinationRateDaysElements.length; i++) {
        vaccinationRateDaysElements[i].innerHTML = toNumberString(vaccinationRateDays);
    }

    const statusDateElements = document.getElementsByClassName("statusDate");
    for (let i = 0; i < statusDateElements.length; i++) {
        statusDateElements[i].innerHTML = vaccinationData[vaccinationData.length - 1].statusDate;
    }

    const statusDateBeforeElements = document.getElementsByClassName("statusDateBefore");
    for (let i = 0; i < statusDateBeforeElements.length; i++) {
        statusDateBeforeElements[i].innerHTML = vaccinationData[vaccinationData.length - vaccinationRateDaysIndex].statusDate;
    }
}

window.onload = function () {
    updateChart();
    updateTable();
}
