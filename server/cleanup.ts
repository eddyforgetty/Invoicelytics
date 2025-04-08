/**
 * Telegram Bot Emergency Cleanup Utility
 * 
 * This script is designed to be run on application start to forcefully 
 * clean up any stale Telegram bot instances that might be causing the
 * "409: Conflict" error.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TEMP_DIR = path.join(process.cwd(), "tmp");
const LOCK_FILE_PATH = path.join(TEMP_DIR, "telegram_bot.lock");

export async function runEmergencyCleanup() {
  console.log("🧹 Running emergency Telegram bot cleanup...");
  
  try {
    // 1. Remove any lock files
    if (fs.existsSync(LOCK_FILE_PATH)) {
      fs.unlinkSync(LOCK_FILE_PATH);
      console.log("✓ Removed stale lock file");
    }
    
    // 2. Try to kill any running Telegram bot processes
    try {
      if (process.platform === 'linux' || process.platform === 'darwin') {
        const killCommands = [
          "pkill -f 'node.*telegraf' || true",
          "pkill -f 'node.*telegram' || true",
          "ps aux | grep '[t]elegraf' | awk '{print $2}' | xargs kill -9 2>/dev/null || true",
          "ps aux | grep '[t]elegram' | awk '{print $2}' | xargs kill -9 2>/dev/null || true"
        ];
        
        for (const cmd of killCommands) {
          try {
            execSync(cmd, { stdio: 'ignore' });
          } catch (e) {
            // Ignore errors from kill commands
          }
        }
        
        console.log("✓ Attempted to kill any running Telegram processes");
      } else {
        console.log("⚠ Skipping process killing on non-Unix platform");
      }
    } catch (e) {
      console.log("⚠ Error killing processes:", e);
    }
    
    // 3. Wait a bit to make sure everything is settled
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log("✓ Emergency cleanup completed");
    return true;
  } catch (error) {
    console.error("❌ Error during emergency cleanup:", error);
    return false;
  }
}