export const API_KEY = "AIzaSyBfRNtUwUGwjJdVxczFDjczbFK1q1yDeOU";
// https://maps.googleapis.com/maps/api/place/autocomplete/json?input=12%20Norton&types=geocode&language=au&&components=(country:au,locality:NSW)&key=AIzaSyBfRNtUwUGwjJdVxczFDjczbFK1q1yDeOU
// export const BACKEND_DOMAIN = "http://0.0.0.0:80";
export const BACKEND_DOMAIN = process.env.REACT_APP_BACKEND_DOMAIN ? process.env.REACT_APP_BACKEND_DOMAIN : "http://0.0.0.0:9000";
export const BACKEND_STATIC_URL = BACKEND_DOMAIN + '/media/';
export const BACKEND_PAGESIZE = process.env.REACT_APP_BACKEND_PAGESIZE ? process.env.REACT_APP_BACKEND_PAGESIZE : 20;
