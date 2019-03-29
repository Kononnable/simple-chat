import React = require("react");

export default class NewMessage extends React.Component {
    render() {
        return (
            <div className="newMessage">
                <textarea className="messageInput" rows={3} />
                <button type="button" className="sendButton">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        <path d="M0 0h24v24H0z" fill="none" />
                    </svg>
                </button>
            </div>
        );
    }
}