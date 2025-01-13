import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_URL;

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