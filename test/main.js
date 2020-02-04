convertToNumber = (text) => {
    // Remove "R" + whitespace and convert to number | return number
    let number = text.replace("R ", "");
    number = number.replace(/ /g, "");
    number = parseInt(number)
    return number;
}

// convertToText = (number) => {
//     // Add "R" + thousand seperator by splicing whitespace into array | return text
//     let text = number.toString();
//     text = text.split("");
//     text.splice(1,0," ");
//     text = text.join("");
//     text = `R${text}`;
//     return text;
// }

// $(".input1").on("change", function () {
//     let value = $(".input1").val();
//     $(".input1").attr("type", "text")
//     $(".input1").val(convertToText(value));
// });

// $(".input1").on("focus", function () {
//     let value  = $(".input1").val();
//     $(".input1").attr("type", "number");
//     $(".input1").val(convertToNumber(value));
// });

// Prevent Non-Numeric entries while preserving "Text" type attribute for currency symbol
document.querySelector(".input1").addEventListener("keypress", function (e) {
    if (
      e.key.length === 1 && e.key !== '.' && isNaN(e.key) && !e.ctrlKey || 
      e.key === '.' && e.target.value.toString().indexOf('.') > -1
    ) {
      e.preventDefault();
    }
  });

//   Add Thousands seperator & currency symbol

$(".input-to-edit").on("input", function (event) {
    let value = $(".input1").val();
    value = value.replace("R ", "");
    value = value.replace(/ /g, "");
    value = value.split("");
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
        value = `R ${value.join("")}`
    }
    $(".input1").val(value);
});
