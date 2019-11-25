import apiRequest from '../apiRequest'

export const RecommendationInfo = (query, success, error) => {
  apiRequest(`/accommodation/recommendation/?${query}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error,
    });
}

