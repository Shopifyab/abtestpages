console.log("the file")
var currentUrl = window.location.href;
if (currentUrl.includes("example.com")) {
  console.log("Current URL contains 'example.com'");
} else {
  console.log("Current URL does not contain 'example.com'");
}

const scriptFunction = async () => {
  var abtd = localStorage.getItem("ABTL");

// use abtd and abti in your A/B testing code
console.log("elevate tests", elevateTests, "theabtd", abtd);

}

scriptFunction()
