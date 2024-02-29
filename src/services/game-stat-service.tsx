import axios from 'axios';
import { GameStat } from '../objects/game-stat';
const API_URL = 'http://nptfc-backend.azurewebsites.net/api/GameStats';

export const GetGameStats = async () => {
    try {
        const response = await axios.get(`${API_URL}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const GetPlayerGameStats = async (playerId : number) => {
    try {
        
        const url = API_URL + '/Player/';
        const response = await axios.get(url + playerId);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const GetSeasonGameStats = async (seasonId : any) => {
    try {
        
        const url = API_URL + '/Season/';
        const response = await axios.get(url + seasonId);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const GetSeasonGameStatsForPlayer = async (seasonId : number, playerId : number) => {
    try {
        
        const url = API_URL + '/';
        const response = await axios.get(url + playerId + ", " + seasonId);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const GetFixtureGameStats = async (fixtureId : any) => {
    try {
        
        const url = API_URL + '/Fixture/';
        const response = await axios.get(url + fixtureId);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const PostGameStat = async (gameStat : GameStat) => {
    const url = API_URL;

    try {
        const response = await axios.post(url, gameStat);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};
