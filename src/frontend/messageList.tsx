import React = require("react");
import { IMessage } from "../communicationModels/schemas";

export default class MessageList extends React.Component<{
    messages: IMessage[];
    user: string;
}> {
    render() {
        const messages = this.props.messages.map((v, i) => {
            if (v.author === this.props.user) {
                return (
                    <div className="message" key={i}>
                        {v.value}
                    </div>
                );
            } else {
                return (
                    <div className="response" key={i}>
                        {v.value}
                    </div>
                );
            }
        });
        return <div className="messageList">{messages}</div>;
    }
}
