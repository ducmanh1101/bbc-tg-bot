import { Injectable, OnModuleInit } from '@nestjs/common'
import { Bot, Context, GrammyError, HttpError, InlineKeyboard } from 'grammy'

import configuration from 'src/config/configuration'

@Injectable()
export class TelegramService implements OnModuleInit {
  private TOKEN = configuration().telegram.tokenBot

  onModuleInit() {
    const bot = new Bot(this.TOKEN)
    const messageTimestamps: { [key: number]: number[] } = {}
    const chatIds = [-1002232622633]
    const timeLimitOnMessage = 10000 // 10s
    const startMenu =
      "🐻To all the bears: collect BEE and hoard as much SUGAR as you can! \n\nBecome a bee-autiful beekeeper in Bera Bee Catcher: play, steal, boost & earn with friends! \n\nIt's time for Bee-dropping 🎉\n\nBee the best 🐾"

    const startMarkup = new InlineKeyboard()
      .url(
        'Play to Bee-drop 🐻',
        'https://t.me/BerasigWallet_bot/BeraBeeCatcher',
      )
      .row()
      .url('Follow X 🚀', 'https://x.com/BeraSigHub')
      .row()
      .url('Join our Swarms 🐝', 'https://t.me/BeraBeeCatcher_ANN')

    bot.command('start', async (ctx) => {
      await ctx.replyWithAnimation('https://i.imgur.com/LbuuCIc.mp4', {
        caption: startMenu,
        parse_mode: 'HTML',
        reply_markup: startMarkup,
      })
    })

    // const isAdmin = async (ctx: Context): Promise<boolean> => {
    //   if (!ctx.chat) return false
    //   const userId = ctx.callbackQuery.from.id
    //   const chatId = ctx.chat.id

    //   try {
    //     const member = await bot.api.getChatMember(chatId, userId)
    //     return ['administrator', 'creator'].includes(member.status)
    //   } catch (error) {
    //     console.error('Failed to fetch chat member:', error)
    //     return false
    //   }
    // }

    // const unBanUser = async (ctx: Context, userId: number) => {
    //   await ctx.api.restrictChatMember(ctx.chatId, userId, {
    //     can_send_messages: true,
    //   })
    // }

    // const banUser = async (ctx: Context) => {
    //   const userId = ctx.message?.from?.id
    //   const chatId = ctx.message?.chat.id

    //   if (userId && chatId) {
    //     await ctx.api.restrictChatMember(chatId, userId, {
    //       can_send_messages: false,
    //     })
    //     const keyboard = new InlineKeyboard().text('Unban', `unban_${userId}`)
    //     await ctx.reply(
    //       `User ${ctx.message?.from?.username || 'unknown'} has been banned ⛔️⛔️⛔️`,
    //       { reply_markup: keyboard },
    //     )
    //   }
    // }

    const checkAndDeleteLink = async (ctx: Context) => {
      const text = ctx.message?.text
      if (text && /https?:\/\/[^\s]+/.test(text)) {
        await ctx.deleteMessage()
      }
    }

    const limitMessages = async (ctx: Context) => {
      const userId = ctx.message?.from?.id
      const currentTime = Date.now()
      if (!userId) return

      if (!messageTimestamps[userId]) {
        messageTimestamps[userId] = []
      }

      messageTimestamps[userId] = messageTimestamps[userId].filter(
        (timestamp) => currentTime - timestamp < timeLimitOnMessage,
      )

      if (messageTimestamps[userId].length >= 1) {
        await ctx.deleteMessage()
      } else {
        messageTimestamps[userId].push(currentTime)
      }
    }

    bot.on('message', async (ctx) => {
      const message = ctx.message
      if (chatIds.includes(ctx.chatId)) {
        await limitMessages(ctx)
        if (!message?.message_thread_id) await checkAndDeleteLink(ctx)
      }
    })

    // bot.callbackQuery(/unban_(\d+)/, async (ctx) => {
    //   const userIdToUnban = parseInt(ctx.match[1], 10)
    //   const isAdminUser = await isAdmin(ctx)

    //   if (isAdminUser) {
    //     await unBanUser(ctx, userIdToUnban)
    //     await ctx.answerCallbackQuery({ text: 'User has been unbanned!' })
    //     await ctx.editMessageText(`User has been unbanned by admin.`)
    //   } else {
    //     await ctx.answerCallbackQuery({
    //       text: 'Only admin can unban this user.',
    //       show_alert: true,
    //     })
    //   }
    // })

    bot.catch((err) => {
      const ctx = err.ctx
      console.error(`Error while handling update ${ctx.update.update_id}:`)
      const e = err.error
      if (e instanceof GrammyError) {
        console.error('Error in request:', e.description)
      } else if (e instanceof HttpError) {
        console.error('Could not contact Telegram:', e)
      } else {
        console.error('Unknown error:', e)
      }
    })

    //Start the Bot
    bot.start()
  }
}
