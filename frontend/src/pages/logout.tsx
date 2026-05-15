import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

const Logout = () => {
    const { logout  } = useAuth0();
    useEffect(() => {
        logout({
            logoutParams: {
              returnTo: window.location.origin,
            },
          });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);   

    return(
        <>
        </>
    )
}
export default Logout;