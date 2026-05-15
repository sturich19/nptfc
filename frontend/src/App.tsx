import { useAuth0 } from '@auth0/auth0-react';
import './App.css';
import AppRoutes from './routes/routes';
import { useEffect } from 'react';

function App() {

  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (  
    <div>
      {isAuthenticated ? (
        <div>
          <AppRoutes/>
        </div>
      ) : (
        <div>Redirecting to login...</div>
      )}
    </div>        
  );
}
export default App;
