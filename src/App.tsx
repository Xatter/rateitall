import { useEffect, useState } from 'react';
import logo from './logo.svg';
import { RatingMessage, MessageType } from "./types";
import Rating from 'react-rating';

import './App.css';
import { isPropertySignature } from 'typescript';

function App() {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const queryInfo = { active: true, lastFocusedWindow: true };
    chrome.tabs && chrome.tabs.query(queryInfo, tabs => {
      const url = tabs[0].url || '';
      setUrl(url);
    })
  });

  const sendRating = (newValue: number) => {
    let message: RatingMessage = {
      type: MessageType.Rating,
      url: url,
      rating: newValue
    }

    chrome.runtime.sendMessage(message);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>URL:</p>
        <p>{url}</p>
        <Rating onChange={sendRating} />
      </header>
    </div>
  );
}

export default App;
