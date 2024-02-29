import axios from 'axios';
const API_URL = 'http://nptfc-backend.azurewebsites.net/api/FantasyFootball';

export const GetAgeGroupFantasyStats = async (ageGroup : number) => {
    try {
        
        const url = API_URL + '/ageGroup/';
        const response = await axios.get(url + ageGroup);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const GetSeasonFantasyStats = async (seasonId : any) => {
    try {
        
        const url = API_URL + '/season/';
        const response = await axios.get(url + seasonId);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const GetFixtureFantasyStats = async (fixtureId : any) => {
    try {
        
        const url = API_URL + '/fixture/';
        const response = await axios.get(url + fixtureId);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};