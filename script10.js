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
const result = await fetch(`https://${window.Shopify.shop}/apps/elevateab/scripttag`, {
			method: "POST", 
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				abtd: abtd,
			}),
		});
	const data = await result.json();
          console.log(data.data);
	if(data.data === "url" && window.location.href != 'https://development-store1221.myshopify.com/products/ocean-blue-shirt'){
		console.log("its a match")
			window.location.href = 'https://development-store1221.myshopify.com/products/ocean-blue-shirt'

	}
}

scriptFunction()
