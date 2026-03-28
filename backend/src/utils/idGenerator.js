const crypto = require("crypto");

/**
 * Generates a valid UUID for the database that starts with the 
 * first 5 characters of the Project ID for traceability.
 */
exports.generateBidId = (projId) => {
    // Generate a real, version 4 UUID
    const fullUuid = crypto.randomUUID(); 
    
    // Take exactly 5 chars from the project ID (ensure they are lowercase hex)
    const prefix = projId ? projId.toString().slice(0, 5).toLowerCase() : fullUuid.slice(0, 5);
    
    // Combine them (the first 5 chars are replaced, the rest stays as valid UUID)
    // UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // We only replace the first block's start.
    return prefix + fullUuid.slice(5);
};
