import { RemoveLocalStorage } from './user/action.js'
import { BACKEND_DOMAIN } from './global.js'

/**
 * 
 * @param {string} url a url of the asyn operation
 * @param {an object} param1 the object that contains the header detail and request method/type/data
 *                           and the callback function onSuccess and on Error
 */
const apiRequest = async (
  url,
  {
    method = "GET",
    payload = null,
    isAuthenticated = true,
    isJSON = true,
    fullUrl = false,
    onSuccess = () => { },
    onError = () => {
      console.error("Error in the response");
    }
  }
) => {
  const options = {
    method,
    // mode: 'cors',
    // credentials: 'same-origin',
    withCredentials: true,
    cache: 'no-cache',
    headers: {
      // "Access-Control-Allow-Credentials": '*',
    }
  };
  if (isAuthenticated) {
    options.headers.Authorization = `Token ${localStorage.getItem("token")}`;
  }
  if (payload) {
    if (isJSON) {
      payload = JSON.stringify(payload);
      options.headers["Content-Type"] = "application/json";
    }
    options.body = payload;
  }

  // Perform the API request
  let response;
  try {
    response = await fetch(
      fullUrl ? url : `${BACKEND_DOMAIN}/api${url}`,
      options
    );
  } catch (err) {
    onError({ "error": "Failed to contact server. Please try again." });
    return;
  }
  let result;
  const responseType = response.headers.get("content-type") || "";
  if (responseType.indexOf("application/json") !== -1) {
    try {
      result = await response.json();
    } catch (err) {
      onError({ "error": "Failed to parse response from server." });
      return;
    }
  }
  if (response.status === 204) {
    // delete success status.
    onSuccess();
    return;
  }
  // 401 User unauthorized was returned
  if (response.status === 401 && localStorage.getItem("token")) {
    RemoveLocalStorage();
    window.location.href = "/";
    onError(result);
    return;
  }
  // If an error code was returned by the request (other than 401)
  if (response.status >= 400 && response.status < 600) {
    // Return the response as an error
    onError(result);
  } else {
    onSuccess(result);
  }
};

export default apiRequest;
