import React = require("react");

export default class MessageList extends React.Component {
    render() {
        return (
            <div className="messageList">
                <div className="message">msg1</div>
                <div className="response">msg2</div>
            </div>
        );
    }
}
