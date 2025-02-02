import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_URL;
const token = localStorage.getItem('token');
const AuthStr = `Bearer ${token}`;


export const updateUserInfo = async (id, data) => {
    let headersList = {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "Authorization": AuthStr
    }

    let bodyContent = JSON.stringify({id: id, data: data});

    let reqOptions = {
        url: `${API_URL}/api/users/update_user_info`,
        method: "PUT",
        headers: headersList,
        data: bodyContent,
    }

    let response = await axios.request(reqOptions);
    console.log(response.data);
};

export const updateInData = async (id, data, path) => {
    let headersList = {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "Authorization": AuthStr
    };

    let bodyContent = JSON.stringify({ id: id, data: data });

    let reqOptions = {
        url: `${API_URL}${path}`,
        method: "PUT",
        headers: headersList,
        data: bodyContent,
    };

    try {
        let response = await axios.request(reqOptions);
        console.log(response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error updating data:", error);
        return { success: false, error: error.message };
    }
};