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
    browser.tabs && browser.tabs.query(queryInfo).then(tabs => {
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

    browser.runtime.sendMessage(message);
  };

  const getAllRatings = () => {
    let message = {
      type: MessageType.RatingsQuery
    }

    browser.runtime.sendMessage(message);
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={getAllRatings}>Ratings</button>
        <Rating onChange={sendRating} />
      </header>
    </div>
  );
}

export default App;
