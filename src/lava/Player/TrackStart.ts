import Lava from "../../structures/Lava";
import DiscordClient from "../../structures/Client";
import { Player, Track, TrackExceptionEvent } from "erela.js";
import { Message, MessageEmbed, TextBasedChannels, TextChannel } from "discord.js";
import { button, convertTime, generateEmbed } from "../../utils/lavalink-function";
import { getModel } from "../../utils/client-functions";
import { IMusicInterface } from "../../Models";
import Logger from "../../class/Logger";

export default class TrackStart extends Lava {
    lastControlMessage: Message | undefined
    constructor(client: DiscordClient) {
        super(client, {
            name: 'trackStart'
        });
    }

    async run(player: Player, track: Track, payload: TrackExceptionEvent) {
            const currentText = player.get("currentText") as boolean;
            if (currentText) {
                const data = await getModel("IMusic", { guildId: player.guild as string }) as IMusicInterface | void;
                if (!data) return;

                const messageId = data.musicId;
                let guild = this.client.guilds.cache.get(player.guild);
                if (!guild) return;

                let channel = guild.channels.cache.get(data.channelId) as any;
                if (!channel) channel = await guild.channels.fetch(data.channelId).catch(err => Logger.log("ERROR", err)) || false;
                if (!channel) return;
                
                let message = channel.messages.cache.get(messageId);
                if (!message) message = await channel.messages.fetch(messageId).catch((err: any) => Logger.log("ERROR", err)) || false;

                const gdata = generateEmbed(this.client, player.guild, false);
                message.edit(gdata).catch((err: any) => Logger.log("ERROR", err));
            } else {
                const trackErr = player.get("trackErr") as boolean;
                if (trackErr) {
                    setTimeout(async () => {
                        const channel = this.client.channels.cache.get(player.textChannel as string) as TextBasedChannels;
                        const embed = new MessageEmbed()
                        .setDescription(`**Playing**\n [${track.title}](${track.uri}) - \`[${convertTime(track.duration)}]\` [${track.requester}]\nVolume: \`${player.volume}\`%\nQueue size: \`${player.queue.size}\``)
                        .setTimestamp()
                        .setImage(track.displayThumbnail("hqdefault") || "https://cdn.discordapp.com/attachments/891235330735366164/891387071376269342/amelia_corp.png")
                        .setColor('GREEN')
                        const msg = {
                            embeds: [embed],
                            components: [...await button(this.client, player.guild)]
                        }
                        const m = await channel.send(msg);
                        player.set("currentMessageId", m.id);
                        player.set("trackErr", false);
                    }, 2e3);
                    return;
                }
    
                const channel = this.client.channels.cache.get(player.textChannel as string) as TextBasedChannels;
                const embed = new MessageEmbed()
                .setDescription(`**Playing**\n [${track.title}](${track.uri}) - \`[${convertTime(track.duration)}]\` [${track.requester}]\nVolume: \`${player.volume}\`%\nQueue size: \`${player.queue.size}\``)
                .setTimestamp()
                .setImage(track.displayThumbnail("hqdefault") || "https://cdn.discordapp.com/attachments/891235330735366164/891387071376269342/amelia_corp.png")
                .setColor('GREEN')
                const msg = {
                    embeds: [embed],
                    components: [...await button(this.client, player.guild)]
                }
    
                const m = await channel.send(msg);
                player.set("currentMessageId", m.id);
            }
    }
}