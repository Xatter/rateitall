import { useEffect, useState } from 'react';
import { RatingMessage, MessageType } from "./types";
import Rating from 'react-rating';

import './Popup.css';

function Popup() {
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

  const clearAllRatings = () => {
    let message = {
      type: MessageType.ClearRatings
    };

    browser.runtime.sendMessage(message);
  }

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={getAllRatings}>Ratings</button>
        <Rating onChange={sendRating} />
        <button onClick={clearAllRatings}>Clear all Ratings</button>
      </header>
    </div>
  );
}

export default Popup;
