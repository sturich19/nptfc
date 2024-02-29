import axios from 'axios';
import { LeagueTable } from '../objects/league-table';
const API_URL = 'https://nptfc-backend.azurewebsites.net/api/league';

export const GetLeagueTable = async (seasonId : any) => {
    const url = API_URL + "/";

    try {
        const response = await axios.get(url + seasonId);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const PostLeagueTableResult = async (leagueTableResult : LeagueTable) => {
    const url = API_URL;

    try {
        const response = await axios.post(url, leagueTableResult);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};