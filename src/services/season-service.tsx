import axios from 'axios';
import { Season } from '../objects/season';
const API_URL = process.env.REACT_APP_API_URL + 'seasons';

export const GetSeasons = async () => {
    try {
        const response = await axios.get(`${API_URL}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const GetSeason = async (id : any) => {
    const url = API_URL + '/';

    try {
        const response = await axios.get(url + id);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const PostSeason = async (season : Season) => {
    const url = API_URL;

    try {
        const response = await axios.post(url, season);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};
