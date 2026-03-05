import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import RouteMap from './routes/RouteMap'
import './index.css'


import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "306282710999-97fg03oejd5u9p84ur0hu2mv8v6nrskm.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <RouteMap />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
)
