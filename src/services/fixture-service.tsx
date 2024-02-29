import axios from 'axios';
import { Fixture } from '../objects/fixture';
const API_URL = 'https://nptfc-backend.azurewebsites.net/api/fixtures';

export const GetFixturesForSeason = async (seasonId : any) => {
    const url = API_URL + '/season/';

    try {
        const response = await axios.get(url + seasonId);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const GetResultsForTeam = async (seasonId : any, teamId : any) => {
    const url = API_URL + '/results/';

    try {
        const response = await axios.get(url + seasonId + "," + teamId);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const PostFixture = async (fixture : Fixture) => {
    const url = API_URL;

    try {
        const response = await axios.post(url, fixture);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const PutFixture = async (fixture : Fixture) => {
    const url = API_URL;

    try {
        const response = await axios.put(url, fixture);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const GetFixtureGrid = async (seasonId : any) => {
    const url = API_URL + '/grid/';

    try {
        const response = await axios.get(url + seasonId);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const GetFixture = async (fixtureId : any) => {
    const url = API_URL + "/";

    try {
        const response = await axios.get(url + fixtureId);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};


