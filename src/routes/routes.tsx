import {Route, Routes } from 'react-router-dom';
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
import AdminFixture from '../pages/admin/admin-fixture';
import LeagueFixturesPage from '../pages/league-fixtures';
import AdminLeagueFixtureUpdate from '../pages/admin/admin-league-fixture-update';
import AgeGroupOverview from '../pages/ageGroups/age-group-overview';
import LeagueFixtureHistory from '../pages/league-fixture-history';
import Logout from '../pages/logout';
import AgeGroups from '../pages/ageGroups/age-groups';

const AppRoutes = () => {

    return(        
        <Routes>
            <Route path="/" element={<Layout/>}>
                <Route index element={<Home/>}></Route>     
                <Route path="/Season/:id" element={<SeasonView/>}></Route>
                <Route path="/AgeGroups" element={<AgeGroups/>}></Route>
                <Route path="/AgeGroup/:id" element={<AgeGroupOverview/>}></Route>
                <Route path="/players" element={<Players/>}></Route>
                <Route path="/TigersFixture/:id" element={<TigersFixturePage/>}></Route>
                <Route path="/LeagueFixtures/:id/:id2" element={<LeagueFixturesPage/>}></Route>
                <Route path="/league/:id" element={<LeagueTablePage/>}></Route>
                <Route path="/admin" element={<Admin/>}></Route>
                <Route path="/AdminLeagueTableUpdate" element={<AdminLeagueTableUpdate/>}></Route>
                <Route path="/AdminFixture" element={<AdminFixture/>}></Route>
                <Route path="/AdminTigersFixture" element={<AdminTigersFixture/>}></Route>
                <Route path="/AdminSeason" element={<AdminSeason/>}></Route>                    
                <Route path="/AdminPlayer" element={<AdminPlayer/>}></Route>  
                <Route path="/AdminTeam" element={<AdminTeam/>}></Route>  
                <Route path="/AdminGameStats" element={<AdminGameStats/>}></Route>  
                <Route path="/AdminLeagueFixtureUpdate/:id/:id2" element={<AdminLeagueFixtureUpdate/>}></Route>                    
                <Route path="/LeagueFixtureHistory/:id/:id2" element={<LeagueFixtureHistory/>}></Route>  
                <Route path="/Logout" element={<Logout/>}></Route>
                <Route path="*" element={<Home/>}></Route>
            </Route>
        </Routes>        
    )
}

export default AppRoutes;