import './layout-styles.css';
import { Outlet } from "react-router-dom";
import Header from "../components/header/header";

const Layout = () => {

    return(
        <>
            <div className='container-fluid g-0'>
                <div className='row'>
                    <Header/>
                </div>                
                <div className='row' id='main-body'>
                    <Outlet/>   
                </div>
            </div>                        
        </>
    )
}

export default Layout;