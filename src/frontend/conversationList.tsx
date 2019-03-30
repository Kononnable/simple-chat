import React = require("react");
import { IConversation } from "../communicationModels/schemas";

export default class ConversationList extends React.Component<{
    conversations: IConversation[];
    activeConversation: string;
    onActiveChange: (id: string) => void;
}> {
    handleClick = (e: any) => {
        e.preventDefault();
        const selectedConversation = this.props.conversations.find(
            v => v.channelId === e.target.textContent
        )!;
        this.props.onActiveChange(selectedConversation.channelId);
    };

    render() {
        const conversations = this.props.conversations.map((v, i) => {
            if (v.channelId === this.props.activeConversation) {
                return (
                    <div className="conversation card bg-primary" key={i}>
                        {v.channelId}
                    </div>
                );
            } else {
                return (
                    <div className="conversation card bg-secondary" key={i}>
                        <a href="#" onClick={this.handleClick}>
                            {v.channelId}
                        </a>
                    </div>
                );
            }
        });
        return (
            <div className="conversationList list-group">{conversations}</div>
        );
    }
}
