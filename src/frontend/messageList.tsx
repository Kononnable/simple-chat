import React = require("react");
import { IMessage } from "../communicationModels/schemas";

export default class MessageList extends React.Component<{
    messages: IMessage[];
    user: string;
}> {
    messagesEnd: any;

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    };

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    render() {
        const messages = this.props.messages.map((v, i) => {
            if (v.author === this.props.user) {
                return (
                    <div className="message card" key={i}>
                        {v.value}
                    </div>
                );
            } else {
                return (
                    <div className="response card" key={i}>
                        {v.value}
                    </div>
                );
            }
        });
        return (
            <div className="messageList">
                {messages}
                <div
                    style={{ float: "left", clear: "both" }}
                    ref={el => {
                        this.messagesEnd = el;
                    }}
                />
            </div>
        );
    }
}
