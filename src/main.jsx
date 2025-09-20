import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';
import "./index.css"
import L from 'leaflet'

// Override default Leaflet marker icons to use files from public/imgs
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/imgs/marker-icon-2x.png',
  iconUrl: '/imgs/marker-icon.png',
  shadowUrl: '/imgs/marker-shadow.png',
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
        <App />
    </BrowserRouter>
  </AuthProvider>
)
