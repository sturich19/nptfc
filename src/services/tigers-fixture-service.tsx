import axios from 'axios';
import { TigersFixture } from '../objects/tigers-fixture';
const API_URL = process.env.REACT_APP_API_URL + 'tigersfixtures';

export const GetTigersFixturesForSeason = async (seasonId : any) => {
    const url = API_URL + '/season/';

    try {
        const response = await axios.get(url + seasonId);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};


export const GetTigersFixtures = async () => {
    
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const GetTigersFixture = async (fixtureId : any) => {
    const url = API_URL + '/';

    try {
        const response = await axios.get(url + fixtureId);
        return response.data;
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
};

export const PostTigersFixture = async (fixture : TigersFixture) => {
    const url = API_URL;

    try {
        const response = await axios.post(url, fixture);
        return response.data;
    } catch (error) {
        console.error("Error posting tigers fixture: ", error);
        throw error;
    }
};

export const PutTigersFixture = async (fixture : TigersFixture) => {
    const url = API_URL + '/' + fixture.id;

    try {
        const response = await axios.put(url, fixture);
        return response.data;
    } catch (error) {
        console.error("Error updating tigers fixture: ", error);
        throw error;
    }
};

export const DeleteTigersFixture = async (fixtureId: number) => {
    const url = API_URL + '/' + fixtureId;

    try {
        const response = await axios.delete(url);
        return response.data;
    } catch (error) {
        console.error("Error deleting tigers fixture: ", error);
        throw error;
    }
};
