// All API calls in this app should import API_BASE_URL from here instead
// of writing "http://127.0.0.1:5000" directly. That way, deploying to a
// different environment (staging, production on Azure, etc.) only means
// changing the .env file -- not editing every page that calls fetch().
//
// process.env.REACT_APP_API_URL comes from frontend/.env. Create React App
// only exposes env vars whose name starts with REACT_APP_ to the browser;
// anything else is silently unavailable, by design (so you don't
// accidentally leak server-only secrets into client-side code).
//
// The fallback after `||` means: if no .env file exists (e.g. on a
// teammate's machine who hasn't set one up yet), default to localhost
// instead of crashing with "undefined" in every URL.
export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000";
