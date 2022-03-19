import { useEffect, useState } from 'react';
import logo from './logo.svg';
import { MessageType, Sender } from "./types";
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
    chrome.runtime.sendMessage(
      {
        from: Sender.React,
        type: MessageType.Rating,
        message: {
          url: url,
          rating: newValue
        }
      }
    );
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
