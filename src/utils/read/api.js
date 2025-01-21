import axios from "axios";
const API_URL = import.meta.env.VITE_SERVER_URL;

const token = localStorage.getItem('token');

const AuthStr = `Bearer ${token}`;

export const getUserInfo = async (limit, tokenDux, page) => {
  try {
    const res = await axios.get(`${API_URL}/api/users?limit=${limit}&page=${page}`, { headers: { Authorization: `Bearer ${tokenDux}` } })
    return res.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error("Data fetching failed");
  }

};
export const getUserType = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/users/user_type`, { headers: { Authorization: AuthStr } })
    return res.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error("Data fetching failed");
  }

};
export const verifyToken = async (token) => {
  console.log(token);

  const configuration = {
    method: "POST",
    url: `${API_URL}/api/users/authenticate`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const res = await axios(configuration);
    return res.data;
  } catch (error) {
    console.error("Error in token verification:", error);
    throw new Error("Token verification failed");  // Throws an error if the request fails
  }
};

export const getSettingsData = async (token, path) => {
  try {
    const res = await axios.get(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error("Data fetching failed");
  }

};

export const getUserData = async (token, path) => {
  try {
    const res = await axios.get(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } })
    return res.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error("Data fetching failed");
  }

};

export const getPublicData = async (path) => {
  try {
    const res = await axios.get(`${API_URL}${path}`)
    return res.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error("Data fetching failed");
  }

};