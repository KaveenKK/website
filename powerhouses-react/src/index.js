import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import GroupChat from './GroupChat';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

function getPropsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const houseId = params.get('houseId');
  const houseName = params.get('houseName');
  const userId = params.get('userId');
  const username = params.get('username');
  const avatar = params.get('avatar');
  const discord_id = params.get('discord_id');
  if (houseId && userId) {
    return {
      houseId,
      houseName,
      user: { _id: userId, username, avatar, discord_id }
    };
  }
  return null;
}

const root = ReactDOM.createRoot(document.getElementById('root'));

const chatProps = getPropsFromUrl();
if (chatProps) {
  root.render(
    <React.StrictMode>
      <GroupChat {...chatProps} />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
