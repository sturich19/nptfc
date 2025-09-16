import axios from 'axios';
import { Team } from '../objects/team';
const API_URL = process.env.REACT_APP_API_URL + 'Teams';

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
        console.error("Error posting team: ", error);
        throw error;
    }
};

export const PutTeam = async (team : Team) => {
    const url = `${API_URL}/${team.id}`;

    try {
        const response = await axios.put(url, team);
        return response.data;
    } catch (error) {
        console.error("Error updating team: ", error);
        throw error;
    }
};

export const DeleteTeam = async (teamId : number) => {
    const url = `${API_URL}/${teamId}`;

    try {
        const response = await axios.delete(url);
        return response.data;
    } catch (error) {
        console.error("Error deleting team: ", error);
        throw error;
    }
};
