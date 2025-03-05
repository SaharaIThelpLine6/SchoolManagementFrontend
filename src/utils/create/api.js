import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_URL;
const token = localStorage.getItem('token');
const AuthStr = `Bearer ${token}`;

export const insertUserInfo = async (token, data) => {
    let headersList = {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    }

    let bodyContent = JSON.stringify({...data
    });

    let reqOptions = {
        url: `${API_URL}/api/users/insert_user_info`,
        method: "POST",
        headers: headersList,
        data: bodyContent,
    }

    let response = await axios.request(reqOptions);
    console.log(response.data);
};

export const insertData = async (data, path) => {
    let headersList = {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "Authorization": AuthStr
    };

    let bodyContent = JSON.stringify({ data: data });

    let reqOptions = {
        url: `${API_URL}${path}`,
        method: "POST",
        headers: headersList,
        data: bodyContent,
    };

    try {
        let response = await axios.request(reqOptions);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error inserting data:", error);
        return { success: false, error: error.message };
    }
};