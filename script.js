
console.log("the file")
var currentUrl = window.location.href;
if (currentUrl.includes("example.com")) {
  console.log("Current URL contains 'example.com'");
} else {
  console.log("Current URL does not contain 'example.com'");
}
var abtd = localStorage.getItem("ABTL");
// var abti = sessionStorage.getItem("abti");

// use abtd and abti in your A/B testing code
console.log("abtd", abtd);
