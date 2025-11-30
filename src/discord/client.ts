import { REST } from '@discordjs/rest';
import {
  APIGuildChannel,
  RESTDeleteAPIChannelResult,
  RESTPatchAPIChannelJSONBody,
  RESTPostAPIGuildChannelJSONBody,
  Routes,
} from 'discord-api-types/v10';

export class DiscordClient {
  private rest: REST;

  constructor(token: string) {
    this.rest = new REST({ version: '10' }).setToken(token);
  }

  async listChannels(guildId: string): Promise<APIGuildChannel[]> {
    const channels = (await this.rest.get(
      Routes.guildChannels(guildId)
    )) as APIGuildChannel[];
    return channels;
  }

  async createChannel(
    guildId: string,
    payload: RESTPostAPIGuildChannelJSONBody
  ): Promise<APIGuildChannel> {
    const channel = (await this.rest.post(Routes.guildChannels(guildId), {
      body: payload,
    })) as APIGuildChannel;
    return channel;
  }

  async updateChannel(
    channelId: string,
    payload: RESTPatchAPIChannelJSONBody
  ): Promise<APIGuildChannel> {
    const channel = (await this.rest.patch(Routes.channel(channelId), {
      body: payload,
    })) as APIGuildChannel;
    return channel;
  }

  async deleteChannel(channelId: string): Promise<RESTDeleteAPIChannelResult> {
    return (await this.rest.delete(
      Routes.channel(channelId)
    )) as RESTDeleteAPIChannelResult;
  }
}
