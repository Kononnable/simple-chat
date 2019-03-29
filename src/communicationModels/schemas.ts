import Joi = require("joi");

export const socketMessageSchema = Joi.object().keys({
    authorId: Joi.string(),
    channelId: Joi.string().required(),
    message: Joi.string()
        .min(1)
        .max(3000)
        .required()
});

export interface ISocketMessage {
    authorId?: string;
    channelId: string;
    message: string;
}

export interface IConversation {
    channelId: string;
    messages: IMessage[];
}

export interface IMessage {
    value: string;
    author: string;
}
