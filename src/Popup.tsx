import { useEffect, useState } from 'react';
import { MessageType, PageRatings, RatingData } from "./types";
import './Popup.css';

function Popup() {
    const [ratings, setRatings] = useState<PageRatings | null>(null);
    const [url, setUrl] = useState<string>('');

    useEffect(() => {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            const tabUrl = tabs[0]?.url ?? '';
            setUrl(tabUrl);
            chrome.runtime.sendMessage(
                { type: MessageType.RatingsQuery, url: tabUrl },
                (result: PageRatings | null) => { setRatings(result); }
            );
        });
    }, []);

    const clearAll = () => {
        chrome.runtime.sendMessage({ type: MessageType.ClearRatings });
        setRatings(null);
    };

    const entries = ratings ? Object.entries(ratings) : [];

    return (
        <div style={{ minWidth: 300, padding: 16, fontFamily: 'system-ui, sans-serif', fontSize: 14 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>Ratings on this page</h3>

            {entries.length === 0 ? (
                <p style={{ color: '#888', margin: '0 0 12px' }}>
                    No ratings yet. Right-click any selected text and choose <strong>Rate It!</strong>
                </p>
            ) : (
                <ul style={{ listStyle: 'none', margin: '0 0 12px', padding: 0 }}>
                    {entries.map(([xpath, data]: [string, RatingData]) => (
                        <li key={xpath} style={{ marginBottom: 10, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                            <div style={{ fontWeight: 600, marginBottom: 2 }}>{data.text}</div>
                            <div style={{ color: '#f5a623', fontSize: 18 }}>
                                {'★'.repeat(data.rating)}{'☆'.repeat(5 - data.rating)}
                            </div>
                            {data.note && <div style={{ color: '#555', marginTop: 2 }}>{data.note}</div>}
                        </li>
                    ))}
                </ul>
            )}

            <button onClick={clearAll} style={{ padding: '6px 12px', cursor: 'pointer' }}>
                Clear all ratings
            </button>
        </div>
    );
}

export default Popup;
