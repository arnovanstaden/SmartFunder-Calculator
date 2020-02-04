/* Table of Contents 

    1. Global Functions
    2. Calculate PAYE from Income Tax Input
    3. Add / Remove Beneficiary Fiels Dynamically
    4. Calculate Educational Expenses
    5. Calculate "With Smartfunder" fields
    6. Extras
        6.1. Reset All
        6.2. Prevent non numeric entries in text inputs
        6.3. Thousands Seperator & Currency Symbol

*/


/* COMMENTS LEGEND 

    // General
    () Explanatory
    [] Logical

*/


// ____________________________________________________________

// 1. GLOBAL FUNCTIONS

// Convert Text to Number - (Remove "R" + whitespace and convert to number | return number)
convertTextToNumber = (text) => {
    let number = text.replace("R ", "");
    number = number.replace(/ /g, "");
    number = parseInt(number)
    return number;
}


// Remove invalid 0's infront - (due to input type=text)

function removeZeros(value) {
    let nozeros = value.replace("R ", "");
    nozeros = nozeros.replace(/ /g, "");
    let i = 0;
    while (i < nozeros.length) {
        if (nozeros.startsWith("0")) {
            nozeros = nozeros.replace("0", "");
        }
        i++;
    }
    return nozeros;
}

// Function to call for non-editable inputs to change to currency

function changeToCurrency(value) {
    currency = value.toString();
    currency = currency.split("");
    if (currency.length > 3 && currency.length <= 6) {
        currency = currency.join("");
        currency = currency.replace(/ /g, "");
        currency = currency.split("");
        currency.splice(-3, 0, " ")
    } else if (currency.length >= 7) {
        currency = currency.join("");
        currency = currency.replace(/ /g, "");
        currency = currency.split("");
        currency.splice(-6, 0, " ");
        currency.splice(-3, 0, " ")
    }

    if (!currency.length == 0) {
        currency = `R ${currency.join("")}`
    }
    return currency
}

// ____________________________________________________________

// 2. CALCULATE PAYE FROM INCOME TAX INPUT

// Yearly Changes - {Might Change every year after budget announcement}
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


const taxThreshhold = primaryRebate * 100 / 18; // (Yearly income under on which no tax payable)
let taxLevel = 0;

// Get the income from user input in whithout SF section
getIncome = () => {
    return parseInt($("#input-taxable-income").val());
}

// Calculate PAYE
getPaye = (taxableIncome) => {

    let paye = 0;

    for (i = 0; taxTable.taxScale.length + 1; i++) {

        // Under Tax Threshold - (No tax payable)
        if (taxableIncome <= taxThreshhold) {
            paye = 0;
            break;
        }

        // Above 600 000 - (SmartFunder Benefit N/A)
        else if (taxableIncome > 600000) {
            alert("Employees with current taxable income over R600 000 do not qualify for the SmartFunder Benefit");
            document.getElementById("input-taxable-income").value = "";
            break;
        }

        // Tax Scales - (Determine where in tax scale income falls)
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
    return paye
}

// Change PAYE Input upon Income Input Change
$("#input-taxable-income").on("input", () => {
    document.getElementById("input-paye").value = getPaye(getIncome());;
});



// ____________________________________________________

// 3. ADD / REMOVE BENEFICIARY FIELS DYNAMICALLY

let beneficiaryCount = 1; // [Always Start with 1 Beneficiary]

// Add Beneficiary

const addBeneficiary = () => {
    beneficiaryCount++;
    const beneficiaryLine = $(".ed-expenses-container .form-row").html(); // - (insert beneficairy html)
    $(".ed-expenses-container").append(
        `<div class="form-row" id="beneficiary-row-${beneficiaryCount}"> 
        ${beneficiaryLine}
        </div>`);
    $(`#beneficiary-row-${beneficiaryCount} .beneficiary-number`).val(`Beneficiary ${beneficiaryCount}`);
};

$(document).on("click", ".add-beneficiary-btn", () => {
    addBeneficiary();
    $(".add-beneficiary-btn").addClass("clicked-once")
});

// Remove Beneficiary

function removeBeneficiary(beneficiaryID) {
    $(`#${beneficiaryID}`).remove(); // [Delete beneficiary withh correct ID]
    beneficiaryCount--;

    // adjust beneficiaryID's
    for (i = 2; i <= beneficiaryCount + 1; i++) { // [adjust remaining beneficiaries' IDs for correct successive numbering] - [adjust i for first child h2 tag]
        $(`.ed-expenses-container > .form-row:nth-child(${i})`).attr("id", `beneficiary-row-${i-1}`)
    }
};

$(document).on("click", ".remove-beneficiary-btn", function () {
    let beneficiaryID = $(this).parent().parent().attr("id"); // [need parent's parent ID to be unique]
    removeBeneficiary(beneficiaryID);
});


//  __________________________________________________________

// 4. CALUCULATE EDUCATIONAL EXPENSES

const calcExpenses = () => {


    // Run for every beneficiary
    for (j = 1; j <= beneficiaryCount; j++) {



        // Get input values from user
        let totalFeesInput = $(`#beneficiary-row-${j} .total-fees-input`).val();
        totalFeesInput = convertTextToNumber(totalFeesInput);
        let benefitTypeInput = $(`#beneficiary-row-${j} .benefit-type-input`).val();

        // Calc Tax Exempt & Not Exempt

        const calcTaxExempt = () => {
            let taxExempt = 0;
            let notTaxExempt = 0;
            const schoolCeiling = 20000
            const tertiaryCeiling = 60000

            // for School
            if (benefitTypeInput == "school" && totalFeesInput <= schoolCeiling) {
                taxExempt = totalFeesInput
            } else if (benefitTypeInput == "school" && totalFeesInput > schoolCeiling) {
                taxExempt = schoolCeiling;
                notTaxExempt = totalFeesInput - schoolCeiling
            }

            // for tertiary
            if (benefitTypeInput == "tertiary" && totalFeesInput <= tertiaryCeiling) {
                taxExempt = totalFeesInput
            } else if (benefitTypeInput == "tertiary" && totalFeesInput > tertiaryCeiling) {
                taxExempt = tertiaryCeiling;
                notTaxExempt = totalFeesInput - tertiaryCeiling
            }

            $(`#beneficiary-row-${j} #input-tax-exempt`).val(changeToCurrency(taxExempt));
            $(`#beneficiary-row-${j} #input-not-tax-exempt`).val(changeToCurrency(notTaxExempt));
        }

        // Run Functions for every Benficiary
        // runOrderCheck();
        calcTaxExempt();
    }


}

calcTotals = () => {

    // Calculate Totals
    let totalFees = 0;
    let totalTaxExempt = 0;
    let totalNotTaxExempt = 0;

    // LOGIC: Loop through every input in each column, parse and add to total if !== "" otherwise add 0

    for (k = 1; k <= beneficiaryCount; k++) {

        // Total Fees
        let totalFeesInput = $(`#beneficiary-row-${k} .total-fees-input`).val();
        totalFees += (totalFeesInput == "" ? 0 : parseInt(totalFeesInput));
        $(".total-row #total-fees").val(totalFees);

        // Total Tax Exempt
        let totalTaxExemptInput = $(`#beneficiary-row-${k} #input-tax-exempt`).val();
        totalTaxExempt += (totalTaxExemptInput == "" ? 0 : parseInt(totalTaxExemptInput));
        console.log(changeToCurrency(totalTaxExempt))
        $(".total-row #total-tax-exempt").val(changeToCurrency(totalTaxExempt));

        // Total Tax Not Exempt
        let totalNotTaxExemptInput = $(`#beneficiary-row-${k} #input-not-tax-exempt`).val();
        totalNotTaxExempt += (totalNotTaxExemptInput == "" ? 0 : parseInt(totalNotTaxExemptInput));
        console.log(changeToCurrency(totalNotTaxExempt))
        $(".total-row #total-tax-not-exempt").val(changeToCurrency(totalNotTaxExempt));
    }

}

$(document).on("input", ".ed-expenses-container input", () => {
    calcExpenses();
    calcTotals();
});

$(document).on("change", ".ed-expenses-container select", () => {
    calcExpenses();
    calcTotals();
});


// __________________________________________________--

// 5. CALCULATE "WITH SMARTFUNDER" FIELDS

calculate = () => {

    // Check all fields not empty
    if ($('.input-to-edit').filter(function () {
            return this.value === '';
        }).length !== 0) {
        alert("You need to fill in all the relevant fields");
    } else {
        // Taxable Income
        const taxableIncome = $("#input-taxable-income").val();
        $("#with-sf-tax-income").html(taxableIncome);

        // Total Fees, Tax Exempt & Not Tax Exempt
        $("#with-sf-total-fees").html($(".total-row #total-fees").val());
        $("#with-sf-tax-exempt").html(-$(".total-row #total-tax-exempt").val());
        $("#with-sf-not-tax-exempt").html($(".total-row #total-tax-not-exempt").val());

        // New Taxable Income
        const newTaxableIncome = taxableIncome - $(".total-row #total-tax-exempt").val();
        $("#with-sf-new-tax-income").html("R " + newTaxableIncome);

        // New PAYE
        $("#with-sf-new-paye").html("R " + getPaye(newTaxableIncome));

        // Annual Saving
        const annualSaving = ($("#input-paye").val() -
            getPaye(newTaxableIncome)
            // - getAdminFee(taxableIncome)
        );
        $("#annual-saving").html("R " + annualSaving);
    }
}



// __________________________________________________--

// 6. EXTRAS

// 6.1. Reset All

$(document).on("click", "#reset-all-btn", () => {
    location.reload();
});

// 6.2. Prevent non numeric entries in text inputs

$(document).on("keypress", ".input-to-format", function (e) {
    if (
        e.key.length === 1 && e.key !== '.' && isNaN(e.key) && !e.ctrlKey ||
        e.key === '.' && e.target.value.toString().indexOf('.') > -1
    ) {
        e.preventDefault();
    }
});

//   6.3. Thousands Seperator & Currency Symbol

// Add Thousands seperator & remove "R"
$(document).on("input", ".input-to-format", function (event) {
    let value = $(this).val();
    value = removeZeros(value) // [R + " " removed in removeZeros function]
    value = value.split(""); // [Create array to insert thousand seperators]
    if (value.length > 3 && value.length <= 6) {
        value = value.join("");
        value = value.replace(/ /g, "");
        value = value.split("");
        value.splice(-3, 0, " ")
    } else if (value.length >= 7) {
        value = value.join("");
        value = value.replace(/ /g, "");
        value = value.split("");
        value.splice(-6, 0, " ");
        value.splice(-3, 0, " ")
    }

    if (!value.length == 0) {
        value = `${value.join("")}`
    }
    $(this).val(value);
});

// Add "R" on input leave - ["R" inserted here otherwise too buggy if user edits input via mouse at custom index]
$(document).on("focusout", ".input-to-format", function () {
    let value = $(this).val();
    if (!value.length == 0) {
        value = `R ${value}`
    }
    $(this).val(value);
});


// Remove "R" on input enter
$(document).on("focus", ".input-to-format", function () {
    let value = $(this).val();
    value = value.replace("R ", "");
    $(this).val(value);
});