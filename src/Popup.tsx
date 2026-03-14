import { useEffect, useState } from 'react';
import { MessageType, PageRatings, RatingData } from "./types";
import { getModifierLabel } from "./platform";
import './Popup.css';

const modifierLabel = getModifierLabel();

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
            <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Mr. Rate It All</h3>

            <div style={{ background: '#f5f5f5', borderRadius: 6, padding: '8px 10px', marginBottom: 14, fontSize: 13, color: '#444', lineHeight: 1.5 }}>
                <strong>How to rate:</strong>
                <ol style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    <li>Select text on the page, then right-click → <strong>Rate It!</strong></li>
                    <li>On sites that block selection (e.g. GrubHub), hold <strong>{modifierLabel}</strong> while dragging to select text first.</li>
                </ol>
            </div>

            <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>Ratings on this page</h4>

            {entries.length === 0 ? (
                <p style={{ color: '#888', margin: '0 0 12px' }}>None yet.</p>
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
