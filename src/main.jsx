import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import store from './app/store.js'
import { GoogleOAuthProvider } from "@react-oauth/google";



const CLIENT_ID =  "599558492449-gb9c52k4vegip4ieaqsgsvh8bqao63ne.apps.googleusercontent.com"

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store} >
      <GoogleOAuthProvider clientId={CLIENT_ID} >
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </BrowserRouter>


)
