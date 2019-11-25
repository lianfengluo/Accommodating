import apiRequest from '../apiRequest'

export const UserReviewInfo = (user_id, success, error) => {
  apiRequest(`/user/review/?id=${user_id}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const UserReviewOverall = (user_id, success, error) => {
  apiRequest(`/user/review/overall/?id=${user_id}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const UserReviewNext = (url, success, error) => {
  apiRequest(url,
    {
      method: "GET",
      isAuthenticated: true,
      fullUrl: true,
      onSuccess: success,
      onError: error
    });
}

export const AccommodationViewInfo = (acc_id, success, error) => {
  apiRequest(`/accommodation/review/?id=${acc_id}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const AccommodationReviewOverall = (acc_id, success, error) => {
  apiRequest(`/accommodation/review/overall/?id=${acc_id}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const AccommodationReviewNext = (url, success, error) => {
  apiRequest(url,
    {
      method: "GET",
      isAuthenticated: true,
      fullUrl: true,
      onSuccess: success,
      onError: error
    });
}