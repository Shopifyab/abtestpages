const path = window.location.pathname;

const pageMap = {
  '^/$': 'home',
  '^/collections/': 'collection_page',
  '^/products/': 'product_page',
  '^/cart$': 'cart_page',
  '^/checkout$': 'checkout_page',
  '^/thank_you$': 'order_confirmation_page',
  '^/blogs/[^/]+/[^/]+$': 'blog_post_page',
  '^/blogs/': 'blog_page',
  '^/pages/': 'custom_page',
  '^/search$': 'search_results_page',
  '^/account/login$': 'login_page',
  '^/account/register$': 'register_page',
  '^/account$': 'account_page',
  '^/account/addresses$': 'address_book_page',
  '^/account/orders$': 'order_history_page',
  '^/gift_cards$': 'gift_card_page',
  '^/gift_cards/new$': 'gift_card_purchase_page',
  '^/contact$': 'contact_page',
  '^/about-us$': 'about_us_page',
  '^/faq$': 'faq_page',
};
console.log("running1")

window.onload = function() {
  console.log("in onload");
  updateElements();
  setupHistoryProxy();
};


const currentPage = Object.entries(pageMap).find(([key]) => new RegExp(key).test(path))?.[1] || 'unknown_page';
const currentPageFormatted = currentPage.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
const hasABH = localStorage.getItem('abh') !== null;
const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("abtid")) {
  localStorage.setItem('abtid', urlParams.get("abtid"));
    if (!hasABH) {
  localStorage.setItem('abh', 'true');
}
}
  const testID = urlParams.get("abtid") || localStorage.getItem('abtid');

  const abWidget = urlParams.get("abwidget") === 'true' || sessionStorage.getItem('abwidget') === 'true' || false;
// const runFunction = () => {
  let collectionsList = JSON.parse(sessionStorage.getItem("ABCL")) || {};
  let addedViews = JSON.parse(sessionStorage.getItem("ABAV")) || {};
  let addedUniqueViews = JSON.parse(localStorage.getItem("ABAU")) || {};

  const currUrl = new URL(window.location.href);
  const [hrefUrl] = currUrl.href.split("?");
  let paramsLine = getParams(window.location.href) || "";

  function setupHistoryProxy() {
    const originalHistory = window.history;
  
    // Handler object for the Proxy
    const handler = {
      apply(target, thisArg, argumentsList) {
        const result = Reflect.apply(...arguments);
        setTimeout(() => {
        updateElements();
          
        }, 1000)
        return result;
      },
    };
  
    // Create the Proxy for pushState and replaceState methods
    const pushStateProxy = new Proxy(originalHistory.pushState, handler);
    const replaceStateProxy = new Proxy(originalHistory.replaceState, handler);
  
    // Replace the original methods with the Proxy versions
    window.history.pushState = pushStateProxy;
    window.history.replaceState = replaceStateProxy;
  }

 
  function getParams(url) {
    const parser = new URL(url);
    return parser.search.slice(1);
  }


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
      localStorage.setItem("ABAU", JSON.stringify(addedUniqueViews));
    }

    if (!addedViews[testID] && abWidget !== 'true' && !hasABH) {
      if (seenThroughCollection) {
        collectionsList[testID] = "added";
        sessionStorage.setItem("ABCL", JSON.stringify(collectionsList));
      }
      addedViews[testID] = true;

      sessionStorage.setItem("ABAV", JSON.stringify(addedViews));
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
  const newTestList = { ...testList };

  for (const test of tests) {
    const testVariations = Object.keys(runningTests[test]).filter((key) => key !== "data");
    const randomIndex = Math.floor(Math.random() * testVariations.length);
    const randomVariation = testVariations[randomIndex];
    newTestList[test] = randomVariation;
  }

  localStorage.setItem("ABTL", JSON.stringify(newTestList));
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

  if (testID && !paramsLine.includes('abtr')) {
    const unique = !testList || !testList[testID];
    handleTest({ testID, unique });
  } 

}

  }
  if (paramsLine != "control") {
    onStart()
  }

  function removeProductFromCart(variantId) {
  return fetch('/cart/update.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      updates: {
        [variantId]: 0
      }
    })
  });
}

function addProductToCart(variantId, quantity) {
  return fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: variantId,
      quantity: quantity
    })
  });
}

function formatCurrency(value, currency) {
  try {
    var numberFormat = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
    });

    return numberFormat.format(value);
  } catch (error) {
    console.error('Failed to format currency:', error);
    return value; // Return the original value if formatting fails
  }
}

function updateElements() {
      if (selectors.hasOwnProperty(currentPage)) {

  const tests = selectors[currentPage];
  for (const test in tests) {
              const testVariation = testList[test]
    if (testVariation !== "0" && runningTests.hasOwnProperty(test)) {
      for(const value in tests[test]) {
        for(let i = 0; i < tests[test][value].length; i++) {
          const selectorElement = document.querySelector(tests[test][value][i])
          let newValue = runningTests?.[test]?.data?.[value]?.[testVariation]
          if(value === 'price' || value === 'compare') {
            newValue = formatCurrency(newValue, currencyCode);
          }
          selectorElement.textContent = newValue
        }
      }
    }
  }
}
}

function replaceProductInCart(oldVariantId, newVariantId, newQuantity) {
  removeProductFromCart(oldVariantId)
    .then(response => {
      if (response.ok) {
        return addProductToCart(newVariantId, newQuantity);
      } else {
        throw new Error('Something went wrong while removing the product from the cart');
      }
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Something went wrong while adding the new product to the cart');
      }
    })
    .then(cart => {
      console.log('Product replaced successfully:', cart);
      // Perform any additional actions like updating the cart UI
    })
    .catch(error => {
      console.error('Error replacing product:', error);
    });
}

function checkCartItemsInNestedObject(testIdObject) {
  return new Promise((resolve) => {
    fetch('/cart.js')
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong while fetching the cart data');
        }
      })
      .then((cartData) => {
        let foundItems = [];
        cartData.items.forEach((item) => {
          Object.entries(testIdObject).forEach(([testId, data]) => {
            if (data.data.variants?.[item.variant_id]?.name) {
              if(testList?.[testID] !== data.data.variants?.[item.variant_id]?.v) {
                 foundItems.push({
                testId: testId,
                variantId: item?.variant_id,
                variantData: data.data?.variants?.[item.variant_id],
                quantity: item?.quantity,
                varName: data.data.variants?.[item.variant_id]?.name
              });
              }
             
            }
          });
        });

        resolve(foundItems);
      })
      .catch((error) => {
        console.error('Error fetching cart data:', error);
      });
  });
}

  document.addEventListener('DOMContentLoaded', () => {

  const addToCartForm = document.querySelector('.product-form');

  if (addToCartForm) {
    addToCartForm.addEventListener('submit', (event) => {
      event.preventDefault();
   setTimeout(() => {
checkCartItemsInNestedObject(runningTests)
  .then((foundItems) => {
    if (foundItems.length > 0) {
      foundItems.forEach((item) => {
        const testVar = testList[item.testId]
        const replaceVariant = runningTests[item.testId].data.variantsByV[testVar][item.varName]
        replaceProductInCart(item.variantId, replaceVariant, item.quantity)
      })
      console.log('Found matching items:', foundItems);
    } else {
      console.log('No matching items found');
    }
  });
   }, 1000)
    });
  }
});



// }
// runFunction()



































  if (abWidget === true && runningTests?.[testID]) {
     sessionStorage.setItem('abwidget', 'true');
const widget = document.createElement("div");
widget.classList.add("widget");
widget.setAttribute("id", "widget");
widget.style.position = "fixed";
widget.style.top = "10px";
widget.style.left = "10px";
widget.style.backgroundColor = "white";
widget.style.zIndex = "9999";
widget.style.display = "flex";
    widget.style.flexDirection = 'column'
widget.style.fontFamily = "Roboto, sans-serif";
widget.style.borderRadius = "10px";
widget.style.boxShadow = "0px 15px 30px rgba(0, 0, 0, 0.15)";
    widget.style.width = '400px'

    const pageHeader = document.createElement("div");
pageHeader.id = "page-preview";
pageHeader.textContent = `Test: ${runningTests[testID].data.name}`;
pageHeader.style.backgroundColor = "#F7F9FD";
pageHeader.style.padding = "5px 15px";
pageHeader.style.borderRadius = "10px 10px 0px 0px";
pageHeader.style.fontSize = "16px";
    pageHeader.style.fontWeight = '600';
pageHeader.style.display = "flex";
pageHeader.style.justifyContent = "space-between";
pageHeader.style.alignItems = "center";
    pageHeader.addEventListener("mouseover", function () {
  pageHeader.style.cursor = "move";
});
widget.appendChild(pageHeader);

const pageHeaderButton = document.createElement("button");
pageHeaderButton.textContent = "View in App";
pageHeaderButton.style.backgroundColor = "#007BFF";
pageHeaderButton.style.color = "white";
pageHeaderButton.style.padding = "5px 20px";
pageHeaderButton.style.borderRadius = "5px";
pageHeaderButton.style.outline = "none";
pageHeaderButton.style.border = "0px";
pageHeaderButton.style.marginLeft = "20px";

pageHeaderButton.addEventListener("mouseover", function () {
  pageHeaderButton.style.cursor = "pointer";
});

    pageHeaderButton.addEventListener("click", () => {
      window.open(`https://1bfd-2600-4041-413b-6d00-1434-93fe-3334-1143.ngrok.io/${testID}`, '_blank');
    });

      const closeWidgetButton = document.createElement("img");
  closeWidgetButton.src = "https://shopifycardimages.s3.amazonaws.com/Close.svg";
  closeWidgetButton.style.marginLeft = "10px";
  closeWidgetButton.addEventListener("mouseover", function () {
    closeWidgetButton.style.cursor = "pointer";
    closeWidgetButton.style.opacity = ".5";
  });
  closeWidgetButton.addEventListener("mouseout", () => {
    closeWidgetButton.style.backgroundColor = "unset";
    closeWidgetButton.style.opacity = "1";
  });
  closeWidgetButton.addEventListener("click", function () {
      sessionStorage.removeItem('abwidget');
  localStorage.removeItem('abtid');
    removeBackgroundForSelectors();
     widget.remove();
  });
pageHeader.appendChild(closeWidgetButton);

const tabs = document.createElement("div");
tabs.classList.add("tabs");
tabs.style.fontSize = "16px";
tabs.style.fontWeight = "500";
tabs.style.display = 'flex';


const tabPreview = document.createElement("div");
tabPreview.id = "tab-preview";
tabPreview.classList.add("tab");
tabPreview.textContent = "Preview";
tabs.appendChild(tabPreview);
tabPreview.style.display = "flex";
tabPreview.style.flexDirection = "column";
tabPreview.style.alignItems = "center";
tabPreview.style.justifyContent = "center";
tabPreview.style.padding = "10px 15px";
tabPreview.style.color = "#007BFF";
tabPreview.style.fontWeight = '600'
tabPreview.addEventListener("mouseover", function () {
  tabPreview.style.cursor = "pointer";
});

    const tabPreviewUnderline = document.createElement("div")
tabPreviewUnderline.style.height = "4px";
tabPreviewUnderline.style.width = "95px";
tabPreviewUnderline.style.backgroundColor = "#007BFF";
tabPreviewUnderline.style.borderRadius = "12px";
    tabPreviewUnderline.style.display = 'flex';
        tabPreviewUnderline.style.marginTop = '8px';


    tabPreview.appendChild(tabPreviewUnderline)

const tabSelectors = document.createElement("div");
tabSelectors.id = "tab-selectors";
tabSelectors.classList.add("tab");
tabSelectors.textContent = "Selectors";
tabs.appendChild(tabSelectors);
tabSelectors.style.display = "flex";
tabSelectors.style.flexDirection = "column";
tabSelectors.style.alignItems = "center";
tabSelectors.style.justifyContent = "center";
tabSelectors.style.padding = "10px 15px";
tabSelectors.style.fontWeight = '600';
    tabSelectors.style.color = '#85909F'
tabSelectors.addEventListener("mouseover", function () {
  tabSelectors.style.cursor = "pointer";
});

    const tabSelectorsUnderline = document.createElement("div");

tabSelectorsUnderline.style.height = "4px";
tabSelectorsUnderline.style.width = "105px";
tabSelectorsUnderline.style.backgroundColor = "white";
tabSelectorsUnderline.style.borderRadius = "12px";
  tabSelectorsUnderline.style.display = 'flex';
        tabSelectorsUnderline.style.marginTop = '8px';
tabSelectors.appendChild(tabSelectorsUnderline)
widget.appendChild(tabs);

const pages = document.createElement("div");
pages.classList.add("pages");
pages.style.overflow = 'auto'

const pagePreview = document.createElement("div");
pagePreview.id = "page-preview";
pagePreview.classList.add("page", "active");
pagePreview.style.padding = "10px 15px 40px";
pagePreview.style.fontSize = "18px";
pagePreview.style.display = "flex";
pagePreview.style.flexDirection = "column";

pages.appendChild(pagePreview);





    
const dropdown = document.createElement("select");

const options = runningTests[testID].data.var
let selectedValue = options?.[0]?.id || "0";
    const currentTestVar = testList[testID]
options.forEach((option) => {
  const optionElement = document.createElement("option");
  optionElement.textContent = option.name;
  optionElement.value = option.id;
   if (option.id === currentTestVar) {
     optionElement.selected = true;
    selectedValue = option.id;
  }
  dropdown.appendChild(optionElement);
});

dropdown.style.fontSize = "18px";
dropdown.style.marginTop = "5px";
dropdown.style.padding = "10px";
    dropdown.style.border = '1.5px solid #007BFF';
dropdown.style.borderRadius = '5px';
    dropdown.style.color = '#202842'
const container = document.createElement("div");
container.style.display = "flex";
container.style.flexDirection = "column";

const label = document.createElement("label");
label.textContent = "Test Variations";
label.style.fontSize = "14px";
label.style.marginTop = "10px";

dropdown.addEventListener("change", (event) => {
  selectedValue = event.target.value;
});

    container.appendChild(label);
container.appendChild(dropdown);



pagePreview.appendChild(container);

function createMainButton(label, onClick) {
  const button = document.createElement("button");
  button.textContent = label;
  button.style.backgroundColor = "#007BFF";
  button.style.color = "white";
  button.style.padding = "10px 20px";
  button.style.borderRadius = "5px";
  button.style.outline = "none";
  button.style.border = "0px";
  button.style.margin = "20px 0px 0px 0px";
  button.addEventListener("mouseover", function () {
    button.style.cursor = "pointer";
    button.style.opacity = .8;
  });
  button.addEventListener("mouseout", function () {
    button.style.cursor = "pointer";
    button.style.opacity = 1;
  });
  button.addEventListener("click", onClick);
  return button;
}

const PreviewButton = createMainButton("Enter Preview", () => {
  const testList = JSON.parse(localStorage.getItem("ABTL")) || {};

  testList[testID] = selectedValue;

  localStorage.setItem("ABTL", JSON.stringify(testList));
  const path = location.pathname;

location.assign(path);
});

pagePreview.appendChild(PreviewButton);
PreviewButton.addEventListener("mouseover", function () {
  PreviewButton.style.cursor = "pointer";
});

const pageSelectors = document.createElement("div");
pageSelectors.id = "page-selectors";
pageSelectors.classList.add("page");

pageSelectors.style.padding = "0px 15px 20px";
pageSelectors.style.fontSize = "16px";
pageSelectors.style.fontWeight = "600";

pageSelectors.style.display = "flex";
pageSelectors.style.flexDirection = "column";
pageSelectors.textContent = `Current Page: ${currentPageFormatted}`
pages.appendChild(pageSelectors);

    const dotColors = {
      title: '#acd9ff',
      price: '#ffacac',
      compare: '#c3ffac',
      description: '#e0acff'
    }

const createSelectorComponent = (type, label) => {
  const title = document.createElement("h5");
  title.textContent = label;
  title.style.margin = "0px";
  title.style.fontWeight = '600'
  title.style.fontSize = '16px'
  title.style.color = '#05172E'
  const titleContainer = document.createElement("div");
  titleContainer.style.display = "flex";
  titleContainer.style.alignItems = "center";
  titleContainer.style.margin = "20px 0px 10px 0px";
  const dot = document.createElement("div");
dot.style.width = "14px";
dot.style.height = "14px";
dot.style.borderRadius = "2px";
dot.style.backgroundColor = dotColors[type];
  dot.style.display = 'flex';
  dot.style.marginLeft = '10px'

  titleContainer.appendChild(title);
  titleContainer.appendChild(dot);

  const priceInputList = document.createElement("ul");
  priceInputList.style.listStyleType = "none";
  priceInputList.style.padding = "0";
  priceInputList.style.margin = "0px";
  priceInputList.id = type + "-inputlist";

  const addButton = document.createElement("button");
  addButton.textContent = "Add " + label;
  addButton.style.display = "flex";
  addButton.style.justifyContent = "center";
  addButton.style.alignItems = "center";
  addButton.style.padding = "5px 10px";
  addButton.style.outline = "none";
  addButton.style.backgroundColor = "unset";
  addButton.style.border = "1.5px solid #007BFF";
  addButton.style.borderRadius = "5px";
  addButton.style.color = '#007BFF'
  addButton.style.fontWeight = '600'
  const plusImage = document.createElement("img");
  plusImage.src = "https://shopifycardimages.s3.amazonaws.com/Plus+(1).svg";
  plusImage.style.marginRight = "10px";
  addButton.prepend(plusImage);
  addButton.addEventListener("click", () => handleButtonClick(type))
  addButton.addEventListener("mouseover", function () {
    addButton.style.cursor = "pointer";
    addButton.style.backgroundColor = "#f2f8ff";
  });
  addButton.addEventListener("mouseout", () => {
    addButton.style.backgroundColor = "unset";
  });


  const container = document.createElement("div");
  container.appendChild(titleContainer);
  container.appendChild(priceInputList);
  container.appendChild(addButton);


  return container;
};

function addInput(type, value) {
  const listItem = document.createElement("li");
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = `Enter a ${type}`;
  input.style.padding = "10px";
  input.style.fontSize = "16px";
  input.style.width = "90%";
  input.style.border = '1.5px solid #EDEEF0'
  input.style.borderRadius = '8px'
  input.style.marginBottom = "15px";
  if (value) {
    input.value = value;
  }
  const deleteButton = document.createElement("img");
  deleteButton.src = "https://shopifycardimages.s3.amazonaws.com/Close.svg";
  deleteButton.style.marginLeft = "10px";
  deleteButton.addEventListener("mouseover", function () {
    deleteButton.style.cursor = "pointer";
    deleteButton.style.opacity = ".5";
  });
  deleteButton.addEventListener("mouseout", () => {
    deleteButton.style.backgroundColor = "unset";
    deleteButton.style.opacity = "1";
  });
  deleteButton.addEventListener("click", function () {
    listItem.remove();
    const element = document.querySelector(input.value);
    if (element) {
      element.style.removeProperty("background-color");
    }
  });

  listItem.appendChild(input);
  listItem.appendChild(deleteButton);

  const list = document.getElementById(`${type}-inputlist`);
  list?.appendChild(listItem);
}


const TitleSelectorContainer = createSelectorComponent("title", "Title");
pageSelectors.appendChild(TitleSelectorContainer);
const PriceSelectorContainer = createSelectorComponent("price", "Price");
pageSelectors.appendChild(PriceSelectorContainer);

const CompareSelectorContainer = createSelectorComponent(
  "compare",
  "Compare at Price"
);
pageSelectors.appendChild(CompareSelectorContainer);
const DescriptionSelectorContainer = createSelectorComponent(
  "description",
  "Description"
);
pageSelectors.appendChild(DescriptionSelectorContainer);



const SaveButton = createMainButton("Save", () => {
  SaveButton.textContent = 'Saving...'
  saveSelectors();
});

pageSelectors.appendChild(SaveButton);

widget.appendChild(pages);

document.body.appendChild(widget);


const resizeHandle = document.createElement("div");
resizeHandle.classList.add("resize-handle");
resizeHandle.style.position = "absolute";
resizeHandle.style.bottom = "0";
resizeHandle.style.left = "0";
    resizeHandle.style.right = "0";
resizeHandle.style.height = "5px";
resizeHandle.style.backgroundColor = "#999";
    resizeHandle.style.display = 'flex';
resizeHandle.style.cursor = "ns-resize";
widget.appendChild(resizeHandle);
  const minHeight = 300;
  const maxHeight = 600;
  const handle = document.querySelector('.resize-handle');

  handle.addEventListener('mousedown', onMouseDown);

  function onMouseDown(event) {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = widget.clientHeight;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);


    function onMouseMove(event) {
      event.preventDefault();
      const dy = event.clientY - startY;
      const newHeight = startHeight + dy;

      if (newHeight >= minHeight && newHeight <= maxHeight) {
        widget.style.height = `${newHeight}px`;
      }
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  }




    

let isDragging = false;
let dragOffsetX, dragOffsetY;
let widgetTopLimit = 0;
let widgetBottomLimit;    
pageHeader.addEventListener("mousedown", function (e) {
  const bodyHeight = document.body.clientHeight;
  const widgetHeight = widget.clientHeight;
  const widgetTop = widget.offsetTop;
  widgetBottomLimit = bodyHeight - widgetTop - widgetHeight;
  isDragging = true;
  dragOffsetX = e.pageX - widget.offsetLeft;
  dragOffsetY = e.pageY - widget.offsetTop;
  widget.style.cursor = "move";
});

    

document.addEventListener("mouseup", function () {
  isDragging = false;
  widget.style.cursor = "default";
});

document.addEventListener("mousemove", function (e) {
 if (isDragging) {
    const newLeft = e.pageX - dragOffsetX;
    const newTop = e.pageY - dragOffsetY;
    const bodyWidth = document.body.clientWidth;
    const widgetWidth = widget.clientWidth;
    const widgetRightLimit = bodyWidth - widgetWidth;
    if (newLeft < 0) {
      widget.style.left = "0px";
    } else if (newLeft > widgetRightLimit) {
      widget.style.left = widgetRightLimit + "px";
    } else {
      widget.style.left = newLeft + "px";
    }
    if (newTop < widgetTopLimit) {
      widget.style.top = widgetTopLimit + "px";
   } else {
      const buffer = 400;
      const bodyHeight = document.body.clientHeight;
      const widgetHeight = widget.clientHeight;
      const widgetBottom = bodyHeight - (widget.offsetTop + widgetHeight);
      const widgetTop = widget.offsetTop;
      const maxTop = bodyHeight - widgetHeight - buffer;
      if (widgetBottom > buffer && newTop > maxTop) {
        widget.style.top = maxTop + "px";
      } else if (newTop > widgetBottomLimit) {
        widget.style.top = (bodyHeight - widgetHeight) + "px";
      } else {
        widget.style.top = newTop + "px";
      }
    }
  }
});

pageSelectors.style.display = "none";

tabPreview.addEventListener("click", function (e) {
  pagePreview.style.display = "block";
  pageSelectors.style.display = "none";
  tabPreview.style.color = "#007BFF";
  tabSelectors.style.color = "#85909F";
  tabSelectorsUnderline.style.backgroundColor = 'white'
    tabPreviewUnderline.style.backgroundColor = '#007BFF'

  removeBackgroundForSelectors();
});

tabSelectors.addEventListener("click", function (e) {
  pagePreview.style.display = "none";
  pageSelectors.style.display = "block";
  tabSelectors.style.color = "#007BFF";
  tabPreview.style.color = "#85909F";
  tabPreviewUnderline.style.backgroundColor = 'white'
    tabSelectorsUnderline.style.backgroundColor = '#007BFF'

  addBackgroundForSelectors();
});

let selectedElement = null;
let hoverEnabled = false;
let inspectType = "";
function handleHover(event) {
  if (hoverEnabled) {
    const element = event.target;
    const widgetComponent = document.getElementById("widget");
    if (!widgetComponent.contains(element)) {
      if (selectedElement !== element) {
        if (selectedElement) {
          selectedElement.style.border = ""; // remove highlight
        }
        selectedElement = event.target;
        selectedElement.style.border = `2px solid ${dotColors[inspectType]}`; // add highlight
      }
    }
  }
}

function getPath(el) {
  if (!(el instanceof Element)) return;
  const path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += "#" + el.id;
      path.unshift(selector);
      break;
    } else if (el.classList.length) {
      selector += "." + Array.from(el.classList).join(".");
    } else {
      let sibling = el;
      let nth = 1;
      while (sibling.nodeType === Node.ELEMENT_NODE && sibling !== el) {
        sibling = sibling.previousSibling;
        if (sibling && sibling.nodeName.toLowerCase() === selector) {
          nth++;
        }
      }
      if (nth !== 1) {
        selector += ":nth-of-type(" + nth + ")";
      }
    }
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(" > ");
}

function handleButtonClick(type) {
  inspectType = type;
  hoverEnabled = !hoverEnabled;
  if (!hoverEnabled && selectedElement) {
    selectedElement.style.border = "";
    const path = getPath(selectedElement);
    selectedElement = null;
  }
}

document.addEventListener("mouseover", handleHover);

document.addEventListener("click", function (event) {
  if (hoverEnabled && selectedElement) {
      event.preventDefault();
    selectedElement.style.border = "";
    const path = getPath(selectedElement);
    addInput(inspectType, path);
    const element = document.querySelector(path);
    if (element) {
      element.style.backgroundColor =  dotColors[inspectType];
    }
    selectedElement = null;
    hoverEnabled = !hoverEnabled;
  }
});

            const testSelectors = selectors?.[currentPage]?.[testID] || {};

      for (const key in testSelectors) {
  if (testSelectors.hasOwnProperty(key)) {
    const arr = testSelectors[key];
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];
      addInput(key, value);
    }
  }
}

function addBackgroundForSelectors() {
      for (const key in testSelectors) {
  if (testSelectors.hasOwnProperty(key)) {
    const arr = testSelectors[key];
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];

      const element = document.querySelector(value);
element.style.backgroundColor = dotColors[key];
    }
  }
}
}

    function removeBackgroundForSelectors() {
            for (const key in testSelectors) {
  if (testSelectors.hasOwnProperty(key)) {
    const arr = testSelectors[key];
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];

      const element = document.querySelector(value);
element.style.removeProperty("background-color");
    }
  }
}
    }



let executing = false;

const saveSelectors = async () => {
  if (!executing) {
    executing = true;
    try {
      const urlWithoutQueryParams = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`;
      const selectors = {
  price: [],
  title: [],
  compare: [],
  description: [],
  currentURL: urlWithoutQueryParams
};

const lists = document.querySelectorAll('#price-inputlist, #title-inputlist, #compare-inputlist, #description-inputlist');

lists.forEach(list => {
  const inputs = list.querySelectorAll('li input');
  const type = list.id.split('-')[0]; // get the type from the id attribute

  inputs.forEach(input => {
    selectors[type].push(input.value); // add the value to the corresponding type in the selectors object
  });
});

      const requestBody = {
  shopName: Shopify.shop,
  testID: testID,
  page: currentPage,
  selectors: selectors
};
      console.log("body", requestBody)
    const response = await fetch(`https://${location.host}/apps/elevateab/addselectors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('API call failed');
    }

    const data = await response.json();
    console.log('API response:', data);
        SaveButton.textContent = 'Save'
  SaveButton.style.cursor = 'pointer';
  SaveButton.style.opacity = '1'
      SaveButton.disabled = false;
  } catch (error) {
    console.error('API call failed:', error);
  }
    executing = false;
}
}
    
  }
  
