import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Popup from './Popup';

// Mock chrome APIs
const mockSendMessage = jest.fn();
const mockQuery = jest.fn();

(global as any).chrome = {
    tabs: { query: mockQuery },
    runtime: { sendMessage: mockSendMessage }
};

beforeEach(() => {
    mockQuery.mockReset();
    mockSendMessage.mockReset();
});

test('shows empty state when there are no ratings', async () => {
    mockQuery.mockImplementation((_filter: any, cb: Function) => cb([{ url: 'https://example.com' }]));
    mockSendMessage.mockImplementation((_msg: any, cb: Function) => cb(null));

    await act(async () => { render(<Popup />); });

    expect(screen.getByText(/None yet/i)).toBeInTheDocument();
});

test('renders ratings returned from storage', async () => {
    mockQuery.mockImplementation((_filter: any, cb: Function) => cb([{ url: 'https://example.com' }]));
    mockSendMessage.mockImplementation((_msg: any, cb: Function) => cb({
        '//*[@id="item-1"]': { rating: 4, note: 'Really good', text: 'Chicken Parm' }
    }));

    await act(async () => { render(<Popup />); });

    expect(screen.getByText('Chicken Parm')).toBeInTheDocument();
    expect(screen.getByText('Really good')).toBeInTheDocument();
    expect(screen.getByText('★★★★☆')).toBeInTheDocument();
});
