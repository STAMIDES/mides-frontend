import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx';

// FIXME: StrictMode CALLS TWICE THE USEEFFECT FUNCTION, MAKING TWO REQUESTS TO THE API{ ONLY ON DEVELOPMENT}
ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    </BrowserRouter>
  </AuthProvider>
)
