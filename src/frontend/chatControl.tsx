import React = require("react");
import ConversationList from "./conversationList";
import MessageList from "./messageList";
import NewMessage from "./newMessage";
import { IConversation, IMessage } from "./../communicationModels/schemas";

export default class ChatControl extends React.Component<
    { admin?: boolean },
    {
        conversations: IConversation[];
        activeConversation: string;
        socketId: string;
    }
> {
    constructor(props: any) {
        super(props);
        this.state = {
            // activeConversation: "",
            // conversations: [],
            // socketId: ""
            activeConversation: "asd",
            conversations: [
                {
                    channelId: "asd",
                    messages: [
                        {
                            author: "asd",
                            value: "message 1"
                        },
                        {
                            author: "dsa",
                            value: "message 2"
                        }
                    ]
                },
                {
                    channelId: "qwe",
                    messages: [
                        {
                            author: "qwe",
                            value: "message 3"
                        },
                        {
                            author: "asd",
                            value: "message 4"
                        }
                    ]
                }
            ],
            socketId: "asd"
        };
    }

    changeActiveConversation = (id: string) => {
        this.setState({ activeConversation: id });
    };
    sendMessage = (content: string) => {
        this.addNewMessage(
            { author: this.state.socketId, value: content },
            this.state.activeConversation
        );
    };

    addNewMessage = (message: IMessage, channelId: string) => {
        this.setState(state => {
            let oldConversation = this.state.conversations.find(
                v => v.channelId === channelId
            );
            if (!oldConversation) {
                oldConversation = { channelId, messages: [message] };
            }
            const newConversation: IConversation = {
                ...oldConversation,
                messages: [...oldConversation.messages, message]
            };
            return {
                conversations: [
                    newConversation,
                    ...state.conversations.filter(
                        v => v.channelId !== channelId
                    )
                ]
            };
        });
    };

    render() {
        const conversation = this.state.conversations.find(
            v => v.channelId == this.state.activeConversation
        );
        const messages = conversation ? conversation.messages : [];
        return (
            <div className="chatContainer">
                <ConversationList
                    conversations={this.state.conversations}
                    activeConversation={this.state.activeConversation}
                    onActiveChange={this.changeActiveConversation}
                />
                <MessageList messages={messages} user={this.state.socketId} />
                <NewMessage onNewMessage={this.sendMessage} />
            </div>
        );
    }
}
