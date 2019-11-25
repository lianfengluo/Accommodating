import apiRequest from '../apiRequest'

export const GetBookingInfo = (data, success, error) => {
  apiRequest(`/accommodation/booking/?id=${data}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error,
    });
}


export const PostReview = (data, success, error) => {
  apiRequest(`/accommodation/post_review/`,
    {
      method: "POST",
      payload: data,
      isAuthenticated: true,
      onSuccess: success,
      onError: error,
    });
}

export const CancelBooking = (data, success, error) => {
  apiRequest(`/accommodation/cancel/`,
    {
      method: "POST",
      payload: data,
      isAuthenticated: true,
      onSuccess: success,
      onError: error,
    });
}