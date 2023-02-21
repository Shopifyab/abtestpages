
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
console.log("abtd", abtd);
const result = await fetch(`https://227b-2600-4041-414f-ef00-a956-fa6c-b0b5-b8fb.ngrok.io/api/scripttag`, {
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
