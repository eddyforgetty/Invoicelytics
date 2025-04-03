import Database from '@replit/database';

const db = new Database();

async function getAllUsers() {
  try {
    // Get usersList - handle the complex nested structure or empty case
    const usersListResponse = await db.get("usersList");
    console.log("Users list raw response:", usersListResponse);
    
    let usersList = [];
    
    // Handle different possible structures
    if (!usersListResponse) {
      console.log("No users list found in database");
      return [];
    } else if (Array.isArray(usersListResponse)) {
      usersList = usersListResponse;
    } else if (usersListResponse.value && Array.isArray(usersListResponse.value)) {
      usersList = usersListResponse.value;
    } else if (usersListResponse.value && usersListResponse.value[0] && usersListResponse.value[0].value) {
      // Handle nested structure
      usersList = usersListResponse.value[0].value;
    }
    
    console.log("Extracted user IDs:", usersList);
    
    // Get each user
    const users = [];
    for (const userId of usersList) {
      const user = await db.get(`user_${userId}`);
      if (user) {
        users.push(user);
      }
    }
    
    console.log("All users:", JSON.stringify(users, null, 2));
    return users;
  } catch (error) {
    console.error("Error retrieving users:", error);
    return [];
  }
}

async function getUserByEmail(email) {
  try {
    // Get all users first
    const users = await getAllUsers();
    
    // Find user with matching email - handle nested structure with ok/value
    for (const userObj of users) {
      // Extract actual user data from the nested structure
      const user = userObj.ok && userObj.value ? userObj.value : userObj;
      
      if (user && user.email?.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    
    console.log(`No user found with email: ${email}`);
    return null;
  } catch (error) {
    console.error(`Error retrieving user by email ${email}:`, error);
    return null;
  }
}

async function main() {
  // Get all users
  await getAllUsers();
  
  // Check for specific user if email is provided
  const targetEmail = process.argv[2];
  if (targetEmail) {
    console.log(`\nLooking for user with email: ${targetEmail}`);
    const user = await getUserByEmail(targetEmail);
    if (user) {
      console.log("Found user:", JSON.stringify(user, null, 2));
      
      // Analyze password format
      if (user.password) {
        console.log("\nPassword analysis:");
        console.log(`- Full password hash: ${user.password}`);
        console.log(`- Length: ${user.password.length} characters`);
        
        if (user.password.includes(':')) {
          const [salt, hash] = user.password.split(':');
          console.log(`- Format: salt:hash`);
          console.log(`- Salt: ${salt} (${salt.length} characters)`);
          console.log(`- Hash: ${hash} (${hash.length} characters)`);
        } else {
          console.log(`- Format: unknown (no ':' separator found)`);
        }
      } else {
        console.log("\nNo password set for this user.");
      }
    }
  }
}

main();