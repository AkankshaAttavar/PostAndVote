import { createRoot } from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<App tab="home" />);

// WebSocket connection test code
// const ws = new WebSocket('wss://p.bridge.walletconnect.org');
// ws.onopen = () => console.log('Connection established');
// ws.onerror = (error) => console.error('WebSocket Error:', error);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
