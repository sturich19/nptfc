import axios from 'axios';
import { Team } from '../objects/team';
const API_URL = 'http://localhost:5032/api/Teams';

export const GetTeams = async () => {
    
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const PostTeam = async (team : Team) => {
    const url = API_URL;

    try {
        const response = await axios.post(url, team);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};
