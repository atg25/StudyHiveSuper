/**
 * Audio File Cleanup Utility
 * Automatically removes podcast files older than 24 hours
 */

const fs = require("fs").promises;
const path = require("path");

const AUDIO_DIR = path.join(__dirname, "..", "audio");
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_STORAGE_MB = 100; // Max 100MB total storage

async function cleanupOldFiles() {
  try {
    const files = await fs.readdir(AUDIO_DIR);
    const now = Date.now();
    let deletedCount = 0;
    let totalSize = 0;

    const fileStats = await Promise.all(
      files.map(async (file) => {
        const filepath = path.join(AUDIO_DIR, file);
        const stats = await fs.stat(filepath);
        return { file, filepath, stats };
      })
    );

    // Calculate total storage
    fileStats.forEach(({ stats }) => {
      totalSize += stats.size;
    });

    console.log(
      `📊 Current storage: ${(totalSize / 1024 / 1024).toFixed(2)}MB`
    );

    // Delete old files
    for (const { file, filepath, stats } of fileStats) {
      const age = now - stats.mtimeMs;

      if (age > MAX_AGE_MS) {
        await fs.unlink(filepath);
        deletedCount++;
        console.log(
          `🗑️  Deleted old file: ${file} (${(age / 1000 / 3600).toFixed(
            1
          )}h old)`
        );
      }
    }

    // If still over limit, delete oldest files
    if (totalSize > MAX_STORAGE_MB * 1024 * 1024) {
      const sortedFiles = fileStats
        .filter(({ stats }) => now - stats.mtimeMs <= MAX_AGE_MS)
        .sort((a, b) => a.stats.mtimeMs - b.stats.mtimeMs);

      let currentSize = totalSize;
      for (const { file, filepath, stats } of sortedFiles) {
        if (currentSize <= MAX_STORAGE_MB * 1024 * 1024) break;

        await fs.unlink(filepath);
        currentSize -= stats.size;
        deletedCount++;
        console.log(`🗑️  Deleted to save space: ${file}`);
      }
    }

    if (deletedCount > 0) {
      console.log(`✅ Cleanup complete: ${deletedCount} files deleted`);
    } else {
      console.log(`✅ No files to clean up`);
    }

    return { deletedCount, totalSizeMB: totalSize / 1024 / 1024 };
  } catch (error) {
    console.error("❌ Cleanup error:", error.message);
    throw error;
  }
}

// Run cleanup if executed directly
if (require.main === module) {
  cleanupOldFiles()
    .then(({ deletedCount, totalSizeMB }) => {
      console.log(`\n📈 Final stats:`);
      console.log(`   Deleted: ${deletedCount} files`);
      console.log(`   Storage: ${totalSizeMB.toFixed(2)}MB`);
    })
    .catch((err) => {
      console.error("Failed:", err);
      process.exit(1);
    });
}

module.exports = { cleanupOldFiles };
