import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '../pages/layout';
import Home from '../pages/home';
import TigersFixturePage from '../pages/tigers-fixture-page';
import LeagueTablePage from '../pages/league-table';
import SeasonView from '../pages/season/season-view';
import Admin from '../pages/admin';
import AdminLeagueTableUpdate from '../pages/admin/admin-league-table-update';
import AdminTigersFixture from '../pages/admin/admin-tigers-fixture';
import AdminSeason from '../pages/admin/admin-season';
import AdminPlayer from '../pages/admin/admin-player';
import AdminTeam from '../pages/admin/admin-team';
import AdminGameStats from '../pages/admin/admin-game-stats';
import Players from '../pages/players';
import FantasyStats from '../pages/fantasy-stats';
import AdminFixture from '../pages/admin/admin-fixture';
import LeagueResultsPage from '../pages/league-results';
import AdminLeagueFixtureUpdate from '../pages/admin/admin-league-fixture-update';

const AppRoutes = () => {

    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route index element={<Home/>}></Route>     
                    <Route path="/season/:id" element={<SeasonView/>}></Route>
                    <Route path="/players" element={<Players/>}></Route>
                    <Route path="/TigersFixture/:id" element={<TigersFixturePage/>}></Route>
                    <Route path="/LeagueResults/:id/:id2" element={<LeagueResultsPage/>}></Route>
                    <Route path="/league/:id" element={<LeagueTablePage/>}></Route>
                    <Route path="/admin" element={<Admin/>}></Route>
                    <Route path="/AdminLeagueTableUpdate" element={<AdminLeagueTableUpdate/>}></Route>
                    <Route path="/AdminFixture" element={<AdminFixture/>}></Route>
                    <Route path="/AdminTigersFixture" element={<AdminTigersFixture/>}></Route>
                    <Route path="/AdminSeason" element={<AdminSeason/>}></Route>                    
                    <Route path="/AdminPlayer" element={<AdminPlayer/>}></Route>  
                    <Route path="/AdminTeam" element={<AdminTeam/>}></Route>  
                    <Route path="/AdminGameStats" element={<AdminGameStats/>}></Route>  
                    <Route path="/AdminLeagueFixtureUpdate/:id" element={<AdminLeagueFixtureUpdate/>}></Route>
                    <Route path="/Fantasy" element={<FantasyStats/>}></Route>  
                    <Route path="*" element={<Home/>}></Route>
                </Route>
            </Routes>
        </BrowserRouter>   
    )
}

export default AppRoutes;