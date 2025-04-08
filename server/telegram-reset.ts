/**
 * Telegram Bot External Reset Utility
 * 
 * This utility script performs a direct API call to Telegram to reset the bot's webhook
 * and terminate any existing getUpdates connections before we try to start our own.
 */

import fetch from 'node-fetch';
import { log } from './vite';

/**
 * Reset the Telegram bot webhook and connections using direct API calls
 * @param token - Telegram bot token
 */
export async function resetTelegramBot(token: string): Promise<boolean> {
  try {
    log('Performing external Telegram bot reset...');
    
    // Step 1: Delete any existing webhook
    const deleteWebhookUrl = `https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`;
    const deleteResponse = await fetch(deleteWebhookUrl);
    const deleteResult = await deleteResponse.json() as any;
    
    log(`Webhook deletion response: ${JSON.stringify(deleteResult)}`);
    
    if (!deleteResult.ok) {
      throw new Error(`Failed to delete webhook: ${deleteResult.description}`);
    }
    
    // Step 2: Get bot info to confirm we have API access
    const getMeUrl = `https://api.telegram.org/bot${token}/getMe`;
    const getMeResponse = await fetch(getMeUrl);
    const getMeResult = await getMeResponse.json() as any;
    
    if (!getMeResult.ok) {
      throw new Error(`Failed to get bot info: ${getMeResult.description}`);
    }
    
    const botUsername = getMeResult.result.username;
    log(`Successfully reset Telegram bot: @${botUsername}`);
    
    // Wait a bit to let Telegram clean up any pending sessions
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return true;
  } catch (error) {
    console.error('Error resetting Telegram bot:', error);
    return false;
  }
}