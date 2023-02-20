
console.log("the file")
var currentUrl = window.location.href;
if (currentUrl.includes("example.com")) {
  console.log("Current URL contains 'example.com'");
} else {
  console.log("Current URL does not contain 'example.com'");
}

const scriptFunction = async () => {
  var abtd = localStorage.getItem("ABTL");
// var abti = sessionStorage.getItem("abti");

// use abtd and abti in your A/B testing code
console.log("abtd", abtd);
const result = await fetch(`https://elevateab.app/api/scripttag`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				abtd: abtd,
			}),
		});
  console.log("the result", result)
}

scriptFunction()
