/* Table of Contents 

1. Calculate PAYE from Income Tax Input
2. Add / Remove Beneficiary Fiels Dynamically
3. Calculate Educational Expenses
4. Calculate Admin Fee
5. Calculate "With Smartfunder" fields
6. Remove Beneficiary

*/

// ____________________________________________________________

// 1. Calculate PAYE from Income Tax Input

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


const taxThreshhold = primaryRebate * 100 / 18;
let taxLevel = 0;

getIncome = () => {
    return parseInt($("#input-taxable-income").val());
}

// Calculate PAYE
getPaye = (taxableIncome) => {

    let paye = 0;

    for (i = 0; taxTable.taxScale.length + 1; i++) {
        // Under Tax Threshold
        if (taxableIncome <= taxThreshhold) {
            paye = 0;
            break;
        }
        // Above 600 000
        else if (taxableIncome > 600000) {
            alert("Employees with current taxable income over R600 000 do not qualify for the SmartFunder Benefit");
            document.getElementById("input-taxable-income").value = "";
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
    return paye
}

// Change PAYE Input upon Income Input Change
$("#input-taxable-income").on("input", () => {
    document.getElementById("input-paye").value = getPaye(getIncome());;
});



// ____________________________________________________

// 2. Add / Remove Beneficiary Fiels Dynamically

let beneficiaryCount = 1; //Start with 1 Beneficiary

const addBeneficiary = () => {
    beneficiaryCount++;
    const beneficiaryLine = $(".ed-expenses-container .form-row").html();
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

function removeBeneficiary(beneficiaryID) {
    $(`#${beneficiaryID}`).remove();
    beneficiaryCount--;
    console.log(beneficiaryCount);

    // adjust beneficiaryID's
    for (i = 2; i <= beneficiaryCount +1; i++) { //adjust i for first child h2 tag
        console.log(i)
        $(`.ed-expenses-container > .form-row:nth-child(${i})`).attr("id",`beneficiary-row-${i-1}`)
    }
};

$(document).on("click", ".remove-beneficiary-btn", function () {
    let beneficiaryID = $(this).parent().parent().attr("id");
    removeBeneficiary(beneficiaryID);
});


//  __________________________________________________________

// 3. Caluculate Educational Expenses

const calcExpenses = () => {


    // Run for every beneficiary
    for (j = 1; j <= beneficiaryCount; j++) {

        // // Run Order Check
        // const runOrderCheck = () => {
        //     if ($(`#beneficiary-row-${j} .benefit-type-input`).val() !== "") {
        //         $(`#beneficiary-row-${j} .total-fees-input`).prop("disabled", false);
        //     }
        // }

        // Calc Tax Exempt & Not Exempt
        let totalFeesInput = $(`#beneficiary-row-${j} .total-fees-input`).val();
        let benefitTypeInput = $(`#beneficiary-row-${j} .benefit-type-input`).val();

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

            $(`#beneficiary-row-${j} #input-tax-exempt`).val(taxExempt);
            $(`#beneficiary-row-${j} #input-not-tax-exempt`).val(notTaxExempt);
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
        $(".total-row #total-tax-exempt").val(totalTaxExempt);

        // Total Tax Not Exempt
        let totalNotTaxExemptInput = $(`#beneficiary-row-${k} #input-not-tax-exempt`).val();
        totalNotTaxExempt += (totalNotTaxExemptInput == "" ? 0 : parseInt(totalNotTaxExemptInput));
        $(".total-row #total-tax-not-exempt").val(totalNotTaxExempt);
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

// 5. Calculate "With Smartfunder" fields

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

// Reset All

$(document).on("click", "#reset-all-btn", () => {
    location.reload();
});