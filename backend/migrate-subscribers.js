import { getCollections } from "./db.js";

async function migrateSubscribers() {
  console.log("Starting subscriber schema migration...");
  
  try {
    const { subscribers } = await getCollections();
    
    // Update existing subscribers to have the new schema fields
    const result = await subscribers.updateMany(
      {
        // Only update documents that don't have the new fields
        $or: [
          { added_by: { $exists: false } },
          { added_at: { $exists: false } },
          { is_locked: { $exists: false } },
          { deleted_by_admin: { $exists: false } },
          { deleted_by_super: { $exists: false } }
        ]
      },
      {
        $set: {
          // Set default values for existing subscribers
          added_by: "system", // Mark as system-added for existing entries
          added_at: new Date(), // Use current date as added_at
          is_locked: false,
          deleted_by_admin: false,
          deleted_by_super: false
        }
      }
    );
    
    console.log(`Migration completed! Updated ${result.modifiedCount} subscribers.`);
    
    // Show current state
    const total = await subscribers.countDocuments({});
    const newSchema = await subscribers.countDocuments({ added_by: { $exists: true } });
    
    console.log(`Total subscribers: ${total}`);
    console.log(`Subscribers with new schema: ${newSchema}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateSubscribers();