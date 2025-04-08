/**
 * Telegram Bot Reset Utility
 * 
 * This is a standalone script to forcefully reset a Telegram bot's webhook
 * and clear any active getUpdates sessions.
 * 
 * Usage: 
 * 1. Make sure the TELEGRAM_TOKEN environment variable is set
 * 2. Run this script once: node telegram-reset.js
 * 3. After successful reset, start your application normally
 */

const fetch = require('node-fetch');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get telegram token from environment or prompt for it
async function getToken() {
  const envToken = process.env.TELEGRAM_TOKEN;
  
  if (envToken) {
    console.log('Using TELEGRAM_TOKEN from environment variables');
    return envToken;
  }
  
  return new Promise((resolve) => {
    rl.question('Please enter your Telegram bot token: ', (token) => {
      resolve(token);
    });
  });
}

// Reset webhook with extreme prejudice
async function resetWebhook(token) {
  try {
    console.log('Attempting to delete webhook with drop_pending_updates=true...');
    const deleteWebhookUrl = `https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`;
    const deleteResponse = await fetch(deleteWebhookUrl);
    const deleteResult = await deleteResponse.json();
    
    console.log(`Webhook deletion response: ${JSON.stringify(deleteResult, null, 2)}`);
    
    if (!deleteResult.ok) {
      throw new Error(`Failed to delete webhook: ${deleteResult.description}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error resetting webhook:', error);
    return false;
  }
}

// Verify the bot is accessible
async function verifyBotAccess(token) {
  try {
    console.log('Verifying bot access...');
    const getMeUrl = `https://api.telegram.org/bot${token}/getMe`;
    const getMeResponse = await fetch(getMeUrl);
    const getMeResult = await getMeResponse.json();
    
    if (!getMeResult.ok) {
      throw new Error(`Failed to get bot info: ${getMeResult.description}`);
    }
    
    const botUsername = getMeResult.result.username;
    console.log(`✅ Successfully verified bot access: @${botUsername}`);
    
    return true;
  } catch (error) {
    console.error('Error verifying bot access:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('\n🤖 TELEGRAM BOT RESET UTILITY 🤖\n');
    console.log('This utility will reset your Telegram bot\'s webhook and clear any active sessions.');
    console.log('This should help resolve 409 Conflict errors.\n');
    
    const token = await getToken();
    
    if (!token) {
      console.error('❌ No token provided. Exiting.');
      process.exit(1);
    }
    
    // Verify we can access the bot
    const canAccess = await verifyBotAccess(token);
    if (!canAccess) {
      console.error('❌ Cannot access bot. Please check your token and try again.');
      process.exit(1);
    }
    
    // Reset the webhook
    const webhookReset = await resetWebhook(token);
    if (!webhookReset) {
      console.error('❌ Failed to reset webhook. Please try again later.');
      process.exit(1);
    }
    
    console.log('\n✅ RESET SUCCESSFUL');
    console.log('The bot\'s webhook has been deleted and pending updates cleared.');
    console.log('Please wait at least 2 minutes before starting your application.');
    
    rl.close();
  } catch (error) {
    console.error('Error in reset utility:', error);
    process.exit(1);
  }
}

// Run the script
main();