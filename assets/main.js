let taxableIncome;


// Yearly Changes
const primaryRebate = 14220;
const taxTable = {
    taxFloor: [0, 35253, 63853, 100263, 147891],
    taxScale: [
        [18, 1, 195850],
        [26, 195851, 305850],
        [31, 305851, 423300],
        [36, 423301, 555600],
        [39, 555601, 708310]
    ]
}

getBursaryType = () => {

}

getIncome = () => {
    taxableIncome = document.getElementById("input-taxable-income").value;
}

getPaye = () => {
    let paye = 0;
    let taxThreshhold = primaryRebate * 100 / 18;
    let taxLevel = 0;

    for (i = 0; taxTable.taxScale.length +1; i++) {
        // Under Tax Threshold
        if (taxableIncome <= taxThreshhold) {
            paye = 0;
            break;

        }
        // Above 600 000
        else if (taxableIncome > 600000) {
            console.log("No SF For You");
            break;

        }
        // Tax Scales
        else if (taxableIncome >= taxTable.taxScale[i][1] && taxableIncome <= taxTable.taxScale[i][2]) {
            paye =
                Math.round(
                    taxTable.taxFloor[i] +
                    (taxableIncome - taxTable.taxScale[i][1]) *
                    (taxTable.taxScale[i][0] / 100) -
                    primaryRebate
                );
            break;
        }
    }
    // Tax Scale 1 - 18%
    document.getElementById("input-paye").value = paye;
}

;

calculate = () => {
    getIncome();
    getPaye();
}