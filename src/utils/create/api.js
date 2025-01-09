import axios from "axios";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const insertUserInfo = async (token, data) => {
    /* const configuration = {
         method: "POST",
         url: `${API_URL}/api/users/insert_user_info`,
         headers: {
             Authorization: `Bearer ${token}`,
             "Content-Type": 'application/json'
         },
         body: data
     };
 
     console.log(configuration);
     
 
     try {
         const res = await axios(configuration);
         return res.data;
     } catch (error) {
         console.error("Error in token verification:", error);
         throw new Error("Token verification failed"); 
     }*/


    let headersList = {
        "Accept": "*/*",
        "Content-Type": "application/json"
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