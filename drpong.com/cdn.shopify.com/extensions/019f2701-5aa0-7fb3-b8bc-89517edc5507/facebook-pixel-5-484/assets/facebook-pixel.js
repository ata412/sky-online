// FILE CỐ ĐỊNH — KHÔNG hardcode/không codegen sửa file này. Endpoint lấy từ window.OMEGA_CAPI_ENDPOINT
// (set bởi omega-init.js — sinh từ env lúc build, load TRƯỚC file này ở app-embed block). Fallback = prod.
let endpointCapi =
  (typeof window !== "undefined" && window.OMEGA_CAPI_ENDPOINT) ||
  "https://fbpx-capi.omegatheme.com/capi/SPF001/event";
// ================================ Detect variables =================================
function getPixelData() {
  const objectPixel = JSON.parse(
    localStorage.getItem("list-pixel-new-web-pixel"),
  );
  return {
    pixelClients: objectPixel?.pixel ?? [],
    pixelConversions: objectPixel?.conversion ?? [],
  };
}
let ot_fb_shop = Shopify?.shop;
localStorage.setItem("ot_fb_shop", ot_fb_shop);
let fb_pageURL = window?.location?.href;
if (typeof __st != "undefined" && typeof __st?.pageurl != "undefined") {
  fb_pageURL = "https://" + __st?.pageurl;
}

fb_pageURL = otTransformURL(fb_pageURL);
let ot_information_campaign = otFBDetectCampaign();
localStorage.setItem(
  "ot_information_campaign",
  JSON.stringify(ot_information_campaign),
);

let externalID = otFBDetectExternalID();
let sectionOrderId = otFBDetectSectionOrderID();
let obj_fbp_fbc = otGetAttributeFBCAndFBP();

otSetCookieByAttributeWindow("obj_fbp_fbc", JSON.stringify(obj_fbp_fbc ?? {}));

let OT_LIST_CAMPAIGNS = [];
if (localStorage.getItem("OT_LIST_CAMPAIGNS") !== null) {
  OT_LIST_CAMPAIGNS = JSON.parse(localStorage.getItem("OT_LIST_CAMPAIGNS"));
}

let OT_DATA_CUSTOMER = {
  external_id: externalID,
  section_order_id: sectionOrderId,
};
if (
  localStorage.getItem("OT_DATA_CUSTOMER") !== null &&
  otIsJsonString(localStorage.getItem("OT_DATA_CUSTOMER"))
) {
  OT_DATA_CUSTOMER = JSON.parse(localStorage.getItem("OT_DATA_CUSTOMER"));
}

let OT_DATA_CUSTOMER__TRACK_FB = {
  external_id: externalID,
};
if (
  localStorage.getItem("OT_DATA_CUSTOMER__TRACK_FB") !== null &&
  otIsJsonString(localStorage.getItem("OT_DATA_CUSTOMER__TRACK_FB"))
) {
  OT_DATA_CUSTOMER__TRACK_FB = JSON.parse(
    localStorage.getItem("OT_DATA_CUSTOMER__TRACK_FB"),
  );
}

let otListAllCustomEvents = [];
let otListAllCustomAddToCart = [];
let otListAllCustomCheckout = [];
let otListAllCustomLead = [];

/**
 * Function to transforms a url
 * @param {*} url Store Url
 * @returns
 */
function otTransformURL(url) {
  let paramsURL = url.split("?")[1];
  if (typeof paramsURL !== "undefined") {
    if (paramsURL.indexOf("&") !== -1) {
      let paramsWithoutVariant = paramsURL.slice(
        paramsURL.indexOf("&") + 1,
        paramsURL.length,
      );
      return url.split("?")[0] + "?" + paramsWithoutVariant;
    } else {
      return url.split("?")[0];
    }
  } else {
    return url;
  }
}

function otSetCookieByAttributeWindow(cname, cvalue) {
  const d = new Date();
  const exdays = 7;
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/**
 * Function to Check Type Json
 * @param {*} str
 * @returns true: is Json string
 */
function otIsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    console.log(e);
    return false;
  }
  return true;
}

function otGetCookie(cname) {
  let name = cname + "=";
  let decodedCookie = document.cookie;
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function otDeleteCookie(name, path = "/", domain = "") {
  const d = new Date();
  d.setTime(d.getTime() + 0 * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + 0 + ";" + expires + `;path=${path}`;
  if (domain) {
    document.cookie =
      name + "=" + 0 + ";" + expires + `;path=${path};domain=${domain}`;
  }
}

function generateEventID(length) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomValues = crypto.getRandomValues(new Uint32Array(length));
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return `omega-${result}${Date.now()}`;
}

function ot_getUrlParam(paramName) {
  let match = window?.location?.search.match(
    "[?&]" + paramName + "(?:&|$|=([^&]*))",
  );
  return match ? (match[1] ? match[1] : "") : null;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Function to hash code type sha-256
 * @param {string} message: message to hash
 * @returns hash code
 */
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

function otGetAttributeFBCAndFBP() {
  //FBP: version.subdomainIndex.creationTime.randomnumber
  //FBC: version.subdomainIndex.creationTime.fbclid
  const subdomainIndex = "1"; //is which domain the cookie is defined
  const ramdomNumber = new Date().getTime() + getRandomInt(1, 100000);
  const creationTime = new Date().getTime();
  const fbc_will_send = otDetectFbc(subdomainIndex, creationTime);
  const fbp_will_send = otDetectFbp(subdomainIndex, creationTime, ramdomNumber);
  return {
    fbc: fbc_will_send,
    fbp: fbp_will_send,
  };
}

// fbclid thật của Meta dài, ký tự base64url. Loại rác như "", "fbclid", chuỗi quá ngắn.
function isValidFbclid(v) {
  return typeof v === "string" && /^[A-Za-z0-9_-]{20,}$/.test(v);
}

function otDetectFbc(subdomainIndex, creationTime) {
  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
  const fbclid_in_url = ot_getUrlParam("fbclid");

  // Fresh fbclid in URL always wins — refresh creationTime to "now".
  // Bỏ fbclid rác/placeholder (vd URL ?fbclid=fbclid) để không lưu & gửi fbc hỏng.
  if (fbclid_in_url != null) {
    if (!isValidFbclid(fbclid_in_url)) return null;
    const fbc = `fb.${subdomainIndex}.${creationTime}.${fbclid_in_url}`;
    otSetCookieByAttributeWindow("OT_FBCLID", fbc);
    return fbc;
  }

  // Fallback to cookies, but drop anything whose creationTime is > 90 days old
  // (Facebook flags such fbc as expired in CAPI)
  const candidate = otGetCookie("_fbc") || otGetCookie("OT_FBCLID");
  if (!candidate) return null;

  const parts = candidate.split(".");
  if (parts.length < 4) return null;

  const ts = Number.parseInt(parts[2], 10);
  if (!ts || Date.now() - ts > NINETY_DAYS_MS) return null;

  // Loại luôn fbc đã lỡ lưu với fbclid rác (segment thứ 4 trở đi).
  if (!isValidFbclid(parts.slice(3).join("."))) return null;

  return candidate;
}

function otFBDetectExternalID() {
  let externalID = otGetCookie("c_user");
  let externalIDOmega = otGetCookie("ex_id");
  if (externalID != null && externalID !== "") {
    otSetCookieByAttributeWindow("ex_id", externalIDOmega);
    return externalID;
  } else if (externalIDOmega != null && externalIDOmega !== "") {
    return externalIDOmega;
  } else {
    externalIDOmega = generateEventID(10);
    otSetCookieByAttributeWindow("ex_id", externalIDOmega);
    return externalIDOmega;
  }
}

function otFBDetectSectionOrderID() {
  let externalID = otGetCookie("section_order_id");
  if (externalID != null && externalID !== "") {
    return externalID;
  } else {
    externalID = generateEventID(10);
    otSetCookieByAttributeWindow("section_order_id", externalID);
    return externalID;
  }
}

function otDetectFbp(subdomainIndex, creationTime, ramdomNumber) {
  const fbplid_in_cookie = otGetCookie("OT_FBPLID");
  const _fbp = otGetCookie("_fbp");
  if (_fbp !== "") {
    return _fbp;
  } else if (fbplid_in_cookie !== "") {
    return fbplid_in_cookie;
  } else {
    let fbp = `fb.${subdomainIndex}.${creationTime}.${ramdomNumber}`;
    otSetCookieByAttributeWindow("OT_FBPLID", fbp);
    return fbp;
  }
}
/**
 *
 * @returns true: come from ads
 */
function OtDetectAdsUrl() {
  let isAdsUrl = false;
  const ARRAY_PARAMS_UTM = [
    "fbclid",
    "omega_utm_campaign",
    "omega_ad_name",
    "omega_adset_name",
    "omega_utm_source",
    "utm_campaign",
    "ad_name",
    "utm_source",
    "adset_name",
    "campaign_id",
    "adset_id",
    "ad_id",
  ];
  ARRAY_PARAMS_UTM.every((param) => {
    if (window.location.search.includes(param)) {
      isAdsUrl = true;
      return false;
    }
    return true;
  });
  return isAdsUrl;
}

function otDetectField(key_origin) {
  let value_omega = ot_getUrlParam(key_origin);
  let key = key_origin.replace("omega_", "");
  let value = ot_getUrlParam(key);
  if (value_omega != null) {
    otSetCookieByAttributeWindow("ot_fb_" + key, value_omega);
    return value_omega;
  }
  if (value) {
    otSetCookieByAttributeWindow("ot_fb_" + key, value);
    return value;
  } else {
    otSetCookieByAttributeWindow("ot_fb_" + key, "undetectable");
    return "undetectable";
  }
}

function otDetectUTMUrl() {
  let utmInfo = {
    utm_source: otDetectField("utm_source"),
    utm_campaign: otDetectField("utm_campaign"),
    adset_name: otDetectField("adset_name"),
    ad_name: otDetectField("ad_name"),
    campaign_id: otDetectField("campaign_id"),
    adset_id: otDetectField("adset_id"),
    ad_id: otDetectField("ad_id"),
  };

  let listCampaigns =
    JSON.parse(localStorage.getItem("OT_LIST_CAMPAIGNS")) || [];

  // Kiểm tra và xóa các campaign không có trong cookie (vượt quá attribute window)
  listCampaigns = listCampaigns.filter(function (campaign) {
    let cookieName = "ot_list_" + campaign.campaign_id;
    return otGetCookie(cookieName) !== "";
  });

  // Kiểm tra xem utmInfo có bị trùng với bất kỳ campaign nào trong listCampaigns
  let isDuplicate = listCampaigns.some(function (campaign) {
    return JSON.stringify(campaign) === JSON.stringify(utmInfo);
  });

  // Nếu không trùng, thêm thông tin UTM mới vào listCampaigns
  if (!isDuplicate) {
    listCampaigns.push(utmInfo);
    localStorage.setItem("OT_LIST_CAMPAIGNS", JSON.stringify(listCampaigns));

    // Set cookie để biết "ot_list_" + utmInfo.campaign_id là active
    let cookieName = "ot_list_" + utmInfo.campaign_id;
    otSetCookieByAttributeWindow(cookieName, "active");
  }

  return utmInfo;
}

function otDetectUTMCookie() {
  return {
    utm_source: otGetCookie("ot_fb_utm_source"),
    utm_campaign: otGetCookie("ot_fb_utm_campaign"),
    adset_name: otGetCookie("ot_fb_adset_name"),
    ad_name: otGetCookie("ot_fb_ad_name"),
    campaign_id: otGetCookie("ot_fb_campaign_id"),
    adset_id: otGetCookie("ot_fb_adset_id"),
    ad_id: otGetCookie("ot_fb_ad_id"),
  };
}

function otFBDetectCampaign() {
  const isComeFromAds = OtDetectAdsUrl();
  return isComeFromAds ? otDetectUTMUrl() : otDetectUTMCookie();
}

function otCheckEnableTracking(fieldName) {
  const blockedDomains = ["halipax.com", "ausmenics.myshopify.com"];
  const originLocation = window?.location?.origin;
  if (blockedDomains.some((domain) => originLocation?.includes(domain))) {
    return false;
  }
  return omegaFBSettings?.settings?.[fieldName];
}

// ------ INIT fbevents.js -----
function initFacebookEventScript() {
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); // NOSONAR
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e); // NOSONAR
    t.async = !0; // NOSONAR
    t.src = v; // NOSONAR
    s = b.getElementsByTagName(e)[0]; // NOSONAR
    s.parentNode.insertBefore(t, s); // NOSONAR
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js",
  );
}

async function otDisagreeForTracking() {
  let isDisagreeForTracking = false;
  const LIST_SHOP_CONSENT_MODE = [
    "livefresh-juice.myshopify.com",
    "long-testapp.myshopify.com",
    "0d1a37-4.myshopify.com",
    "quickstart-7683b804.myshopify.com",
    "dccomics-shop.myshopify.com",
    "ecoflow-uk.myshopify.com",
  ];
  if (LIST_SHOP_CONSENT_MODE.includes(Shopify?.shop)) {
    try {
      await new Promise((resolve, reject) => {
        if (!window?.Shopify?.loadFeatures) {
          reject(new Error("Shopify.loadFeatures not available"));
          return;
        }

        window.Shopify.loadFeatures(
          [{ name: "consent-tracking-api", version: "0.1" }],
          (error) => {
            if (error) reject(error);
            else resolve();
          },
        );
      });

      isDisagreeForTracking =
        window?.Shopify?.customerPrivacy?.getTrackingConsent() !== "yes";
      if (isDisagreeForTracking) {
        otDeleteCookie("_fbp", "/", `.${Shopify?.shop}`);
        otDeleteCookie("obj_fbp_fbc");
        otDeleteCookie("OT_FBPLID");
      }
    } catch (err) {
      console.error("[Omega] Error loading consent-tracking-api:", err);
    }
  }

  // if isDisagreeForTracking = false => init facebook event script
  if (!isDisagreeForTracking) {
    initFacebookEventScript();
  }

  return isDisagreeForTracking;
}

async function otHandleCheckWorkingPage() {
  const isDisagreeForTracking = await otDisagreeForTracking();
  if (isDisagreeForTracking) {
    return false;
  }
  return omegaFBSettings?.settings?.enable;
}

(async () => {
  const shouldRunHandleCheckWorkingPage = await otHandleCheckWorkingPage();
  if (shouldRunHandleCheckWorkingPage) {
    let content = { ...OT_DATA_CUSTOMER__TRACK_FB };
    const { pixelClients } = getPixelData();
    pixelClients.forEach((pixelId) => {
      fbq("init", pixelId, content);
    });
  }
})();

if (typeof $ == "undefined") {
  javascript: (function (e, s, i, c) {
    e.src = s;
    e.integrity = i;
    e.crossOrigin = c;
    e.onload = function () {
      $ = jQuery.noConflict();
    };
    document.head.appendChild(e);
  })(
    document.createElement("script"),
    "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js",
    "sha384-tsQFqpEReu7ZLhBV2VZlAu7zcOV+rXbYlF2cqB8txI/8aZajjp4Bqd+V6D5IgvKT",
    "anonymous",
  );
}

(function (window, document) {
  if (window.otfbq) return;
  window.otfbq = async function () {
    if (arguments.length > 0) {
      let pixelId, trackType, contentObj, eventID;
      if (typeof arguments[0] == "string") pixelId = "" + arguments[0];
      if (typeof arguments[1] == "string") trackType = arguments[1];
      if (typeof arguments[2] == "object") contentObj = arguments[2];
      if (typeof arguments[3] != "undefined") eventID = arguments[3];
      if (typeof arguments[4] != "undefined") nameCustomEvent = arguments[4];
      if (eventID == "" || typeof eventID == "undefined") {
        eventID = new Date().getTime() + getRandomInt(1, 100000);
      }
      let params = [];
      if (
        typeof pixelId === "string" &&
        pixelId.replace(/\s+/gi, "") != "" &&
        typeof trackType === "string" &&
        trackType.replace(/\s+/gi, "")
      ) {
        params.push("id=" + encodeURIComponent(pixelId));
        switch (trackType) {
          case "PageView":
          case "ViewContent":
          case "Search":
          case "AddToCart":
          case "InitiateCheckout":
          case "AddPaymentInfo":
          case "Lead":
          case "CompleteRegistration":
          case "Purchase":
          case "AddToWishlist":
            params.push("ev=" + encodeURIComponent(trackType));
            break;
          case "trackCustom":
            params.push("ev=" + encodeURIComponent(nameCustomEvent));
            break;
          default:
            return;
        }

        params.push("dl=" + encodeURIComponent(fb_pageURL));
        if (document.referrer)
          params.push("rl=" + encodeURIComponent(document.referrer));
        params.push("if=false");
        params.push("ts=" + new Date().getTime());
        if (typeof contentObj == "object") {
          for (let u in contentObj) {
            if (
              typeof contentObj[u] == "object" &&
              contentObj[u] instanceof Array
            ) {
              if (contentObj[u].length > 0) {
                for (let y = 0; y < contentObj[u].length; y++) {
                  contentObj[u][y] = (contentObj[u][y] + "")
                    .replace(/^\s+|\s+$/gi, "")
                    .replace(/\s+/gi, " ")
                    .replace(/,/gi, "§");
                }
                params.push(
                  "cd[" +
                    u +
                    "]=" +
                    encodeURIComponent(
                      contentObj[u]
                        .join(",")
                        .replace(/^/gi, "['")
                        .replace(/$/gi, "']")
                        .replace(/,/gi, "','")
                        .replace(/§/gi, ","),
                    ),
                );
              }
            } else {
              params.push("cd[" + u + "]=" + encodeURIComponent(contentObj[u]));
            }
          }
        }
        let keys_params_advanced = Object.keys(OT_DATA_CUSTOMER__TRACK_FB);
        if (keys_params_advanced.length > 0) {
          for (const element of keys_params_advanced) {
            params.push(
              "&ud[" +
                element +
                "]=" +
                (await sha256(OT_DATA_CUSTOMER__TRACK_FB[element])),
            );
          }
        }
        params.push("v=" + encodeURIComponent("2.7.19"));
        let imgId = new Date().getTime();
        let img = document.createElement("img");
        ((img.id = "fb_" + imgId),
          (img.src =
            "https://www.facebook.com/tr/?eid=" +
            eventID +
            "&" +
            params.join("&")),
          (img.width = 1),
          (img.height = 1),
          (img.style = "display:none;"));
        document.body.appendChild(img);
        window.setTimeout(function () {
          let t = document.getElementById("fb_" + imgId);
          t.parentElement.removeChild(t);
        }, 5000);
      }
    }
  };
})(window, document);

window.otBaseCodeFB = function () {
  if (arguments.length > 0) {
    let pixelId, eventName, contentObj, eventID;
    if (typeof arguments[0] == "string") pixelId = "" + arguments[0];
    if (typeof arguments[1] == "string") eventName = arguments[1];
    if (typeof arguments[2] == "object") contentObj = arguments[2];
    if (typeof arguments[3] != "undefined") eventID = arguments[3];
    if (typeof arguments[4] != "undefined") nameCustomEvent = arguments[4];
    if (eventID == "" || typeof eventID == "undefined") {
      eventID = new Date().getTime() + getRandomInt(1, 100000);
    }
    if (
      typeof pixelId === "string" &&
      pixelId.replace(/\s+/gi, "") != "" &&
      typeof eventName === "string" &&
      eventName.replace(/\s+/gi, "")
    ) {
      let content = { ...OT_DATA_CUSTOMER__TRACK_FB };

      fbq("init", pixelId, content);
      switch (eventName) {
        case "PageView":
          fbq("trackSingle", pixelId, "PageView", {}, { eventID });
          break;
        case "ViewContent":
        case "Search":
        case "AddToCart":
        case "InitiateCheckout":
        case "AddPaymentInfo":
        case "Lead":
        case "CompleteRegistration":
        case "Purchase":
        case "AddToWishlist":
          fbq("trackSingle", pixelId, eventName, contentObj, {
            eventID,
          });
          break;
        case "trackCustom":
          fbq("trackSingle", pixelId, nameCustomEvent, contentObj, {
            eventID,
          });
          break;
        default:
          return;
      }
    }
  }
};

function trackEventFBConversionAPIByBeacon(t, e) {
  const { pixelConversions } = getPixelData();
  const payload = {
    event_source_url: fb_pageURL,
    shop: Shopify?.shop,
    external_id: OT_DATA_CUSTOMER?.external_id,
    section_order_id: OT_DATA_CUSTOMER?.section_order_id,
    pixels: pixelConversions,
    ads_data: {
      ...ot_information_campaign,
      fbp: otGetAttributeFBCAndFBP()?.fbp,
      fbc: otGetAttributeFBCAndFBP()?.fbc,
      obj_fbp_fbc: otGetAttributeFBCAndFBP(),
    },
    user_data: {
      ...OT_DATA_CUSTOMER,
    },
    ...e,
  };

  if (payload?.event_id) {
    payload.event_id = `${payload.event_id}`;
  }

  if (payload?.action === "Custom" && payload?.event_name) {
    payload.custom_event_name = e.event_name;
    delete payload.event_name;
  }

  fetch(endpointCapi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch((error) => console.log(error));
}

function trackEventFBConversionAPI(t, e) {
  trackEventFBConversionAPIByBeacon(t, e);
}

function trackLeadEvent(arrayFBPixelTrack) {
  const { pixelClients, pixelConversions } = getPixelData();
  let eventID = generateEventID(36);
  pixelClients.forEach(function (element) {
    otfbq(element, "Lead", "", eventID);
  });
  trackEventFBConversionAPI(
    {},
    {
      action: "Custom",
      event_name: "Lead",
      event_id: eventID,
      event_source_url: fb_pageURL,
      pixels: pixelConversions,
    },
  );
}

function trackCustomEvent(arrayFBPixelTrack, event_name, data = "") {
  const eventID = generateEventID(36);
  const { pixelClients, pixelConversions } = getPixelData();
  pixelClients.forEach(function (element) {
    let trackCustom = "trackCustom";
    otfbq(`${element}`, trackCustom, data, eventID, event_name);
  });
  trackEventFBConversionAPIByBeacon(
    {},
    {
      action: "Custom",
      event_name: event_name,
      event_id: eventID,
      pixels: pixelConversions,
    },
  );
}

let debounceTimeout = null;
setTimeout(() => {
  let ot_mutationObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (debounceTimeout) clearTimeout(debounceTimeout);

      debounceTimeout = setTimeout(async () => {
        const event = JSON.parse(
          localStorage.getItem("OT_DATA_TRIGGER_ATC_NEW_TRIGGER"),
        );
        if (event) {
          checkAddToCartEvent();
        }

        debounceTimeout = null;
      }, 500);
    });
  });

  ot_mutationObserver.observe(document.documentElement, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true,
  });
}, 500);

function getItemOnCartPageFB(callback) {
  fetch("/cart.js")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((cart) => {
      localStorage.setItem("ot_cart", JSON.stringify(cart));
      if (typeof callback === "function") {
        callback(cart);
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
}

function detectLastInfoATCByProductId(productId, cartItems) {
  if (cartItems?.length > 0) {
    const cartItemsByProductId = cartItems.filter(
      (item) => item.product_id == productId,
    );
    const cartItem = cartItemsByProductId[0];
    if (!cartItem) return [];

    const productInfo = {
      url: "https://" + ot_fb_shop + cartItem.url,
      title: cartItem?.variant_title
        ? `${cartItem?.product_title} - ${cartItem?.variant_title}`
        : cartItem?.product_title,
      id: productId ?? "",
    };
    return [productInfo];
  }
  return [];
}

async function omegaCallBackAddToCartTrigger(event) {
  const { pixelClients, pixelConversions } = getPixelData();
  let content_type_event =
    omegaFBSettings?.settings?.content_type_event == "variant"
      ? "product"
      : "product_group";
  getItemOnCartPageFB((cart) => {
    let item_count = localStorage.getItem("item_count");
    let productInfo = detectLastInfoATCByProductId(
      event.data.cartLine.merchandise.product.id,
      cart.items,
    );

    localStorage.setItem("item_count", cart.item_count);
    if (item_count != cart.item_count && cart.items.length > 0) {
      localStorage.removeItem("OT_DATA_TRIGGER_ATC_NEW_TRIGGER");
      let event_id = generateEventID(36);
      let content_id = `${event.data.cartLine.merchandise.id}`;
      if (content_type_event == "product_group") {
        content_id = `${event.data.cartLine.merchandise.product.id}`;
      }

      let dataPost = {
        content_ids: [content_id],
        content_type: content_type_event,
        value: event.data.cartLine.merchandise.price.amount,
        content_name: event.data.cartLine.merchandise.product.title,
        currency: event.data.cartLine.merchandise.price.currencyCode,
        content_category: event.data.cartLine.merchandise.product.type,
        content_brand: event.data.cartLine.merchandise.product.vendor,
        contents: JSON.stringify([
          {
            id: content_id,
            name: event.data.cartLine.merchandise.product.title,
            quantity: 1,
            item_price: event.data.cartLine.merchandise.price.amount,
            item_category: event.data.cartLine.merchandise.product.type,
          },
        ]),
      };

      if (otCheckEnableTracking("pixel_track_addtocart")) {
        pixelClients.forEach(function (element) {
          otfbq(`${element}`, "AddToCart", dataPost, event_id);
        });
      }

      if (otCheckEnableTracking("capi_track_addtocart")) {
        trackEventFBConversionAPI(
          {},
          {
            ...dataPost,
            action: "AddToCart",
            event_id: event_id,
            num_items: 1,
            pixels: pixelConversions,
            products: productInfo,
          },
        );
      }
    }
  });
}

function trackAddToCartPixels({
  pixelClients,
  content_id,
  content_type_event,
  lastItem,
  event_id,
}) {
  if (!otCheckEnableTracking("pixel_track_addtocart")) {
    return;
  }
  pixelClients.forEach(function (element) {
    otfbq(
      `${element}`,
      "AddToCart",
      {
        content_ids: [content_id],
        content_type: content_type_event,
        value: Number.parseInt(lastItem.price) / 100,
        content_name: lastItem["product_title"],
        currency: Shopify.currency.active,
      },
      event_id,
    );
  });
}

function trackAddToCartConversions({
  pixelConversions,
  content_id,
  content_type_event,
  lastItem,
  event_id,
  cartItems,
}) {
  if (!otCheckEnableTracking("capi_track_addtocart")) {
    return;
  }
  let productInfo = detectLastInfoATCByProductId(
    lastItem["product_id"],
    cartItems,
  );
  trackEventFBConversionAPI(
    {},
    {
      action: "AddToCart",
      event_id: event_id,
      content_ids: [content_id],
      content_type: content_type_event,
      value: Number.parseInt(lastItem.price) / 100,
      content_name: lastItem["product_title"],
      currency: Shopify.currency.active,
      pixels: pixelConversions,
      products: productInfo,
    },
  );
}

function resolveAddToCartItem({ cart, content_type_event }) {
  let lastItem = omegaFBSettings?.settings?.skip_atc_zero_value
    ? cart?.items?.find((item) => item?.final_price != 0)
    : cart.items[0];
  localStorage.setItem("item_count", cart.item_count);

  if (meta?.product?.id) {
    let itemInCart = cart.items.find(
      (item) => item.product_id == meta.product.id,
    );
    if (
      omegaFBSettings?.settings?.skip_atc_zero_value &&
      itemInCart?.final_price == 0
    ) {
      return null;
    }
    lastItem = itemInCart;
  }

  let content_id = `${lastItem["variant_id"]}`;
  if (content_type_event == "product_group") {
    content_id = `${lastItem["product_id"]}`;
  }

  return { lastItem, content_id };
}

function checkAddToCartEvent() {
  if (Shopify?.shop == "newpawfecthouse.myshopify.com") {
    return;
  }
  const { pixelClients, pixelConversions } = getPixelData();
  getItemOnCartPageFB(function (cart) {
    let item_count = localStorage.getItem("item_count");
    if (item_count != cart.item_count) {
      localStorage.setItem("item_count", cart.item_count);
    }
    let content_type_event =
      omegaFBSettings?.settings?.content_type_event == "variant"
        ? "product"
        : "product_group";
    const isAddNewItem =
      cart.items.length > 0 &&
      cart.items[0].handle != "shipping-protection" &&
      item_count < cart.item_count;
    if (!isAddNewItem) {
      return;
    }

    const resolved = resolveAddToCartItem({ cart, content_type_event });
    if (!resolved) {
      return;
    }
    const { lastItem, content_id } = resolved;

    let event_id = generateEventID(36);
    trackAddToCartPixels({
      pixelClients,
      content_id,
      content_type_event,
      lastItem,
      event_id,
    });
    trackAddToCartConversions({
      pixelConversions,
      content_id,
      content_type_event,
      lastItem,
      event_id,
      cartItems: cart.items,
    });
  });
}

async function omegaCallBackCheckout() {
  const { pixelClients, pixelConversions } = getPixelData();

  const content_type_event =
    omegaFBSettings.settings.content_type_event == "1"
      ? "product"
      : "product_group";
  getItemOnCartPageFB((cart) => {
    if (cart.items.length > 0) {
      let content_ids = [];
      let content_name = [];
      let products = [];
      cart.items.forEach(function (value, index) {
        products.push({
          id: value.product_id,
          title: value.product_title,
        });
        //detect content id
        if (content_type_event == "product_group") {
          content_ids.push(value.product_id);
        } else {
          content_ids.push(value.variant_id);
        }
        //detect content id
        content_name.push(value.product_title);
        if (index == cart.items.length - 1) {
          let event_id = generateEventID(36);
          if (otCheckEnableTracking("pixel_track_checkout")) {
            pixelClients.forEach(function (element, index) {
              otfbq(
                `${element}`,
                "InitiateCheckout",
                {
                  content_type: content_type_event,
                  content_ids: content_ids,
                  currency: Shopify.currency.active,
                  value: Number.parseFloat(cart.total_price) / 100,
                  num_items: cart.item_count,
                  content_name: content_name,
                },
                event_id,
              );
            });
          }
          if (otCheckEnableTracking("capi_track_checkout")) {
            trackEventFBConversionAPIByBeacon(
              {},
              {
                action: "InitiateCheckout",
                event_id: event_id,
                event_source_url: fb_pageURL,
                content_ids: content_ids,
                content_type: content_type_event,
                num_items: cart.item_count,
                value: Number.parseFloat(cart.total_price) / 100,
                content_name: content_name,
                currency: Shopify.currency.active,
                pixels: pixelConversions,
                shop: Shopify.shop,
                products: products,
              },
            );
          }
        }
      });
    } else if (
      typeof meta != "undefined" &&
      typeof meta.product != "undefined"
    ) {
      let content_ids =
        content_type_event == "product_group"
          ? [`${meta.product.id}`]
          : [`${meta.product.variants[0].id}`];
      let event_id = generateEventID(36);
      if (otCheckEnableTracking("pixel_track_checkout")) {
        pixelClients.forEach(function (element, index) {
          otfbq(
            `${element}`,
            "InitiateCheckout",
            {
              content_type: content_type_event,
              content_ids: content_ids,
              currency: Shopify.currency.active,
              value: meta.product.variants[0].price / 100,
              num_items: 1,
              content_name: meta.product.variants[0].name,
            },
            event_id,
          );
        });
      }
      if (otCheckEnableTracking("capi_track_checkout")) {
        trackEventFBConversionAPIByBeacon(
          {},
          {
            action: "InitiateCheckout",
            event_id: event_id,
            event_source_url: fb_pageURL,
            content_ids: content_ids,
            content_type: content_type_event,
            num_items: 1,
            products: [
              {
                id: meta.product.id,
                title: meta.product.variants[0].name,
              },
            ],
            value: meta.product.variants[0].price / 100,
            content_name: meta.product.variants[0].name,
            currency: Shopify.currency.active,
            pixels: pixelConversions,
          },
        );
      }
    }
  });
}

// ===== Start Integrate Quote =====

// eventType = 'submit-quote' | 'add-to-quote'
function otFBPixelIntegrateQuote(eventType, data) {
  const otListShopCustomEventIntegrate = [
    {
      otShopName: "laura-kincade-australia.myshopify.com",
      events: [{ name: "LEAD", type: "submit-quote" }],
    },
    {
      otShopName: "valtrainc.myshopify.com",
      events: [{ name: "Submit Quote", type: "submit-quote" }],
    },
    {
      otShopName: "huyen-test-app.myshopify.com",
      events: [{ name: "test-integrate-submit", type: "submit-quote" }],
    },
    {
      otShopName: "iaecdj-ea.myshopify.com",
      events: [{ name: "Quote submission", type: "submit-quote" }],
    },
    {
      otShopName: "779bca-2.myshopify.com",
      events: [{ name: "QuoteLead", type: "submit-quote" }],
    },
    {
      otShopName: "holzschfurniture.myshopify.com",
      events: [{ name: "QuoteEvent", type: "submit-quote" }],
    },
  ];

  const customShop = otListShopCustomEventIntegrate.find(
    (shop) => shop?.otShopName == Shopify?.shop,
  );

  if (customShop) {
    const eventData = customShop?.events?.find(
      (event) => event?.type == eventType,
    );
    if (eventData?.name) {
      trackCustomEvent([], eventData.name, data);
    }
    return;
  }

  switch (eventType) {
    case "add-to-quote":
      trackCustomEvent([], "AddToQuote", data);
      break;
    case "submit-quote":
      trackCustomEvent([], "SubmitQuote", data);
      break;
    default:
  }
}
// ===== End Integrate Quote =====

// ===== CUSTOM EVENT CHECKOUT SHOP PAY =====
localStorage.removeItem("ot_tracking_ic_shop_pay");

const otButtonCheckout =
  '.bettercart_checkout,[name^="checkout"],[name^="checkout"] .loader-button__text,.shopify-payment-button__button,.btn-checkout,a.fbq-checkout,.checkout_btn,.OTCheckout,.OTCheckout span,#cart .action_button.right,.xcotton-checkout,shop-pay-wallet-button, shop-pay-wallet-button button, shop-pay-wallet-button slot';
// shopify-google-pay-button, shopify-paypal-button, shopify-apple-pay-button, .paypal-button

if (window?.ShopifyPay) {
  document.addEventListener("click", function (event) {
    if (!event?.target?.closest(otButtonCheckout)) return;
    omegaCallBackCheckout();
    localStorage.setItem("ot_tracking_ic_shop_pay", "true");
  });
}

// ===== End CUSTOM EVENT CHECKOUT SHOP PAY =====