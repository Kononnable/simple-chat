import React = require("react");

export default class ConversationList extends React.Component {
    render() {
        return (
            <div className="conversationList">
                <div className="conversation">
                    <a href="#">Con1</a>
                </div>
                <div className="conversation">
                    <a href="#">Con2</a>
                </div>
            </div>
        );
    }
}
