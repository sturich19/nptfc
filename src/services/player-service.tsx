import axios from 'axios';
import { Player } from '../objects/player';
const API_URL = 'http://nptfc-backend.azurewebsites.net/api/players';

export const GetPlayers = async () => {
    try {
        const response = await axios.get(`${API_URL}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const GetPlayer = async (id : any) => {
    const url = API_URL + '/';

    try {
        const response = await axios.get(url + id);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const PostPlayer = async (player : Player) => {
    const url = API_URL;

    try {
        const response = await axios.post(url, player);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};
