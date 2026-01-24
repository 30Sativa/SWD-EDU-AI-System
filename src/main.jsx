import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'   
import RouteMap from './routes/RouteMap'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <RouteMap />
    </HashRouter>
  </React.StrictMode>
)
