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

$(".input1").on("input", function () {
    let value = $(".input1").val();
    value = value.replace("R ", "");
    value = value.split("");
    if (value.length > 3 && value.length <= 7) {
        value = value.join("");
        value = value.replace(/ /g, "");
        value = value.split("");
        value.splice(-3, 0, " ")
        console.log("fire t")
    }
    else if (value.length >= 8) {
        value = value.join("");
        value = value.replace(/ /g, "");
        value = value.split("");
        value.splice(-6, 0, " ");
        value.splice(-3, 0, " ")
    }
    $(".input1").val(`R ${value.join("")}`);
});

$(".input1").on("change", function () {
    let value = $(".input1").val();
    console.log(value)
    console.log(convertToNumber(value)*2)
});