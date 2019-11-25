import apiRequest from '../apiRequest'

export const FetchAccommodationInfo = (id, success, error) => {
  apiRequest(`/accommodation/retrieve/${id}/`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}
export const SubmitAdvertiseImg = (data, success, error) => {
  apiRequest(`/accommodation/update/`,
    {
      method: "PUT",
      payload: data,
      isJSON: false,
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}
export const fetch_img_data = async (
  url,
) => {
  const options = {
    method: "GET",
    mode: 'cors',
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin',
  };
  // Get the image
  try {
    return await fetch(
      `${url}`,
      options
    ).then(resp => resp.blob());
  } catch (err) {
    return;
  }
};

export const GetUnavailable = (data, success, error) => {
  apiRequest(`/accommodation/not_available/?accommodation=${data}`,
    {
      method: "GET",
      isJSON: true,
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}
export const postBooking = (data, success, error) => {
  apiRequest(`/accommodation/booking/`,
    {
      method: "POST",
      payload: data,
      isJSON: true,
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const Deletable = (data, success, error) => {
  apiRequest(`/accommodation/delete/?id=${data}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const RequestDelete = (data, success, error) => {
  apiRequest(`/accommodation/delete/?id=${data}`,
    {
      method: "DELETE",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const SubmitAdvertise = (data, success, error) => {
  apiRequest("/accommodation/upload/",
    {
      method: "PUT",
      payload: data,
      isAuthenticated: true,
      isJSON: false,
      onSuccess: success,
      onError: error
    });
}
