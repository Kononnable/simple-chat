import React = require("react");

export default class NewMessage extends React.Component<
    {
        onNewMessage: (content: string) => void;
    },
    { value: string }
> {
    constructor(props: any) {
        super(props);
        this.state = {
            value: ""
        };
    }

    handleChange = (e: any) => {
        this.setState({ value: e.target.value });
    };

    handleClick = () => {
        if (this.state.value !== "") {
            this.props.onNewMessage(this.state.value);
            this.setState({ value: "" });
        }
    };

    render() {
        return (
            <div className="newMessage">
                <textarea
                    className="messageInput"
                    rows={3}
                    value={this.state.value}
                    onChange={this.handleChange}
                />
                <button
                    type="button"
                    className="sendButton"
                    onClick={this.handleClick}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        <path d="M0 0h24v24H0z" fill="none" />
                    </svg>
                </button>
            </div>
        );
    }
}
