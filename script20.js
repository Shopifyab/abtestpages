const runningTests = JSON?.parse(elevateTests) || {};

const runFunction = () => {
  let testList = JSON.parse(localStorage.getItem("ABTL")) || {};
  let collectionsList = JSON.parse(sessionStorage.getItem("ABCL")) || {};
  let addedViews = JSON.parse(sessionStorage.getItem("ABAV")) || {};
  let addedUniqueViews = JSON.parse(localStorage.getItem("ABAU")) || {};

  function getParams(url) {
    const parser = new URL(url);
    return parser.search.slice(1);
  }

  const url = new URL(window.location.href);
  const [hrefUrl] = url.href.split("?");
  const paramsLine = getParams(window.location.href) || "";

  const handleTest = async ({ testID, unique }) => {
    const newObj = testList || {};
    const testVar = unique
      ? Object.keys(runningTests[testID])[
          Math.floor(Math.random() * Object.keys(runningTests[testID]).length)
        ]
      : newObj[testID];

    const seenThroughCollection = !!collectionsList?.[testID];

    if (!addedUniqueViews[testID]) {
      firstView = true;
      addedUniqueViews[testID] = true;
      console.log("Set Unique Views: ", addedUniqueViews);
      localStorage.setItem("ABAU", JSON.stringify(addedUniqueViews));
    }

    if (!addedViews[testID]) {
      if (seenThroughCollection) {
        collectionsList[testID] = "added";
        console.log("Set Collections List: ", collectionsList);
        sessionStorage.setItem("ABCL", JSON.stringify(collectionsList));
      }
      addedViews[testID] = true;

      console.log("Set Added View: ", addedViews);
      sessionStorage.setItem("ABAV", JSON.stringify(addedViews));
      console.log("Send Add View Request");
      const addViewUrl = `https://${window.location.host}/apps/elevateab/addview`;
      const params = new URLSearchParams({
        testID,
        Variation: testVar,
        unique: firstView,
        clickthrough: seenThroughCollection,
        referrer: document.referrer,
        store: Shopify.shop,
      });

      fetch(addViewUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
    }
    paramsLine = paramsLine ? paramsLine + '&abtr=true' : paramsLine + 'abtr=true'
    window.location.href = runningTests[testID][testVar] + "?" + paramsLine;
  };

  const handleDecideTests = async (tests) => {
    let newObj = testList || {};

    for (let i = 0; i < tests.length; i++) {
      const keys = Object.keys(runningTests[tests[i]]);
      testVar = keys[Math.floor(Math.random() * keys.length)];
      newObj[tests[i]] = testVar;
    }
    console.log("Set Test List in HandleDecideTests: ", newObj);
     localStorage.setItem("ABTL", JSON.stringify(newObj));
  };

  let onStart = () => {
    let missingTests = [];
    for (let item in runningTests) {
      if (!testList?.[item]) {
        missingTests.push(item);
      }
    }
    if (missingTests.length > 0) {
      handleDecideTests(missingTests);
    }

    const matchingUrl = Object.values(runningTests).find((urls) =>
      Object.values(urls).includes(hrefUrl)
    );
    if (matchingUrl) {
      const testID = Object.keys(runningTests).find(
        (key) => runningTests[key] === matchingUrl
      );

  if (testID && !paramsLine?.abtr) {
    const unique = !testList || !testList[testID];
    handleTest({ testID, unique });
  }

}

  }
  if (paramsLine != "control") {
    onStart()
  }

}
runFunction()
