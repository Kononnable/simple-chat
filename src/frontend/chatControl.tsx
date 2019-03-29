import React = require("react");
import ConversationList from "./conversationList";
import MessageList from "./messageList";
import NewMessage from "./newMessage";

export default class ChatControl extends React.Component<{ admin?: boolean }> {
    render() {
        return (
            <div className="chatContainer">
                <ConversationList />
                <MessageList />
                <NewMessage />
            </div>
        );
    }
}
