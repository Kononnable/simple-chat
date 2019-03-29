import React = require("react");
import ConversationList from "./conversationList";
import MessageList from "./messageList";
import NewMessage from "./newMessage";
import {
    IConversation,
    IMessage,
    ISocketMessage
} from "./../communicationModels/schemas";
import io = require("socket.io-client");

export default class ChatControl extends React.Component<
    { admin?: boolean },
    {
        conversations: IConversation[];
        activeConversation: string;
        socketId: string;
    }
> {
    socket: SocketIOClient.Socket;

    constructor(props: any) {
        super(props);
        this.socket = io(window.location.host);

        this.socket.on("connect", () => {
            if (this.props.admin) {
                this.setState({ socketId: this.socket.id });
                this.socket.emit("authenticateAsCS");
                this.socket.once("authenticateAsCS", () => {
                    this.socket.emit("ActiveMessages");
                    this.socket.once(
                        "ActiveMessages",
                        (conversations: IConversation[]) => {
                            if (conversations.length > 0) {
                                this.setState({
                                    conversations,
                                    activeConversation:
                                        conversations[0].channelId
                                });
                            }
                        }
                    );
                });
            } else {
                this.setState({
                    socketId: this.socket.id,
                    activeConversation: this.socket.id,
                    conversations: [
                        {
                            channelId: this.socket.id,
                            messages: []
                        }
                    ]
                });
            }
        });
        this.socket.on("message", (msg: ISocketMessage) => {
            this.addNewMessage(
                { value: msg.message, author: msg.authorId! },
                msg.channelId
            );
        });
        this.socket.on("conversationEnded", (channelId: string) => {
            this.setState(state => {
                return {
                    conversations: [
                        ...state.conversations.filter(
                            v => v.channelId !== channelId
                        )
                    ]
                };
            });
        });

        this.state = {
            activeConversation: "",
            conversations: [],
            socketId: ""
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
        const channelId = this.props.admin
            ? this.state.activeConversation
            : this.state.socketId;
        const message: ISocketMessage = {
            authorId: this.socket.id,
            channelId,
            message: content
        };
        this.socket.send(message);
    };

    addNewMessage = (message: IMessage, channelId: string) => {
        this.setState(state => {
            let oldConversation = this.state.conversations.find(
                v => v.channelId === channelId
            );
            if (!oldConversation) {
                oldConversation = { channelId, messages: [] };
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
                {this.props.admin && (
                    <ConversationList
                        conversations={this.state.conversations}
                        activeConversation={this.state.activeConversation}
                        onActiveChange={this.changeActiveConversation}
                    />
                )}
                <MessageList messages={messages} user={this.state.socketId} />
                <NewMessage onNewMessage={this.sendMessage} />
            </div>
        );
    }
}
