import apiRequest from '../apiRequest'

export const FetchSearchInfo = (req, success, error) => {
  apiRequest(`/accommodation/info/?${req}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}
