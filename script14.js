const scriptFunction = async () => {

  console.log("elevate tests", elevateTests);
  
  const runningTests = elevateTests;
  const testList = JSON.parse(localStorage.getItem("ABTL")) || {};
  const collectionsList = JSON.parse(sessionStorage.getItem("ABCL")) || {};
  const addedViews = JSON.parse(sessionStorage.getItem("ABAV")) || {};
  const addedUniqueViews = JSON.parse(localStorage.getItem("ABAU")) || {};

  const getParams = (link) => {
    const params = {};
    const parser = document.createElement("a");
    parser.href = link;
    const paramsLine = parser.search.substring(1);
    const vars = paramsLine.split("&");
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split("=");
      params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
  };

  const handleTest = async ({ testID, unique }) => {
    let newObj = testList;
    let firstView = false;
    let testVar;
    const redirectedParam = paramsLine ? '&abtr=true' : 'abtr=true';
    if (!testList[testID]) newObj = {};
    const keys = Object.keys(runningTests[testID]);
    testVar = keys[Math.floor(Math.random() * keys.length)];
    newObj[testID] = testVar;
    window.location.href = runningTests[testID][testVar] + "?" + paramsLine + redirectedParam;
    const seenThroughCollection = collectionsList[testID] === true;
    if (!addedUniqueViews[testID]) {
      firstView = true;
      addedUniqueViews[testID] = true;
      await localStorage.setItem("ABAU", JSON.stringify(addedUniqueViews));
    }
    if (!addedViews[testID]) {
      if (seenThroughCollection) {
        collectionsList[testID] = 'added';
        await sessionStorage.setItem("ABCL", JSON.stringify(collectionsList));
      }
      addedViews[testID] = true;
      await sessionStorage.setItem("ABAV", JSON.stringify(addedViews));
      await localStorage.setItem("ABTL", JSON.stringify(newObj));
      const http = new XMLHttpRequest();
      const addViewUrl = `https://${storeDomain}/apps/elevateab/addview`;
      const params = `testID=${testID}&Variation=${testVar}&unique=${firstView}&clickthrough=${seenThroughCollection}&referrer=${document.referrer}&store=${store}`;
      http.open("POST", addViewUrl, true);
      http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      http.send(params);
    }
  };

  const handleDecideTests = async (tests) => {
    const newObj = testList;
    for (const test of tests) {
      const keys = Object.keys(runningTests[test]);
      const testVar = keys[Math.floor(Math.random() * keys.length)];
      newObj[test] = testVar;
    }
    await localStorage.setItem("ABTL", JSON.stringify(newObj));
  };

const onStart = () => {
  const hrefUrl = window.location.href.split("?")[0].replace(/\/$/, "");
  const missingTests = Object.keys(runningTests).filter((item) => !testList[item]);
  if (missingTests.length > 0) {
    handleDecideTests(missingTests);
  }
  for (const item in runningTests) {
    if (runningTests.hasOwnProperty(item)) {
      const variationUrls = Object.values(runningTests[item]);
      if (variationUrls.includes(hrefUrl) && !params.abtr) {
        const unique = !testList[item];
        handleTest({ testID: item, unique });
        break;
      }
    }
  }
};

const params = getParams(window.location.href);
const paramsLine = params.control ? "" : params.toString();

onStart();

}

scriptFunction()
