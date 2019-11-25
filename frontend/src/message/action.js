import apiRequest from '../apiRequest'

export const GetRenterInfo = (success, error) => {
  apiRequest("/message/renter/",
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const GetHostInfo = (success, error) => {
  apiRequest("/message/host/",
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}
export const GetFirstMessage = (id, success) => {
  apiRequest(`/message/first/?id=${id}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
    });
}
export const GetAllMessage = (id, success, error) => {
  apiRequest(`/message/all/?id=${id}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}
export const PostMessage = (data, success, error) => {
  apiRequest(`/message/post/`,
    {
      method: "POST",
      payload: data,
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}
export const AcceptRequest = (data, success, error) => {
  apiRequest(`/message/accept/?id=${data}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}
export const PaidRequest = (data, success, error) => {
  apiRequest(`/message/paid/?id=${data}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
      onError: error
    });
}

export const GetUnreadCount = (data, success, ) => {
  apiRequest(`/message/unread_count/?id=${data}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
    });
}

export const ReadMessage = (data, success, ) => {
  apiRequest(`/message/read_message/?id=${data}`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
    });
}

export const AllUnreadCount = (success, ) => {
  apiRequest(`/message/unread_all/`,
    {
      method: "GET",
      isAuthenticated: true,
      onSuccess: success,
    });
}
