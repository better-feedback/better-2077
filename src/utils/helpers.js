export const parseDate = (date) => {
  let newDate = date + "000";
  const input = !isNaN(newDate) ? parseInt(newDate) : newDate;
  let tempDate = new Date(input);

  const splitDate = tempDate.toString().split(" ");
  return `${splitDate[2]} ${splitDate[1]}, ${splitDate[3]}`;
};

export const nearAccountToHex = (accountsArray) => {
  const resultArray = [];

  accountsArray.forEach((account) => {
    var result = "";
    for (var i = 0; i < account.length; i++) {
      result += account.charCodeAt(i).toString(16);
    }
    let length = result.length / 2;
    let padding = "00";

    if (length < 20) {
      let iterations = 20 - length;
      for (i = 0; i < iterations; i++) {
        result = padding + result;
      }
    } else {
      result = result.substring(0, 40);
    }
    resultArray.push("0x" + result);
  });

  return resultArray;
};

export const isExpired = (bounty, bountySolidity) => {
  const localStorageChain = localStorage.getItem("wallet-chain");

  if (!localStorageChain) {
    return false;
  }

  if (localStorageChain === "near") {
    return !bounty
      ? false
      : Math.floor(Date.now() / 1000) > parseInt(bounty?.deadline);
  } else {
    if (bountySolidity?.data?.id !== "") {
      return (
        Math.floor(Date.now() / 1000) > parseInt(bountySolidity?.data?.deadline)
      );
    } else {
      return false;
    }
  }
};


// const { createGuildClient } = require("@guildxyz/sdk");

// // Get guild members for guild with ID 7487
// async function getMembersFromGuild(guildId) {
//   try {
//     const guildClient = createGuildClient("2077 Idea Board"); // Replace with your project name
//     const members = await guildClient.guild.getMembers(guildId);
//     console.log("Members response:", members);
//   } catch (error) {
//     console.error("Error fetching guild members:", error);
//   }
// }
// getMembersFromGuild(7487);


// // Get guild id and role id for guild with name "2077 Idea Board"
// async function getGuildAndRoleIds(guildName, roleName) {
//   try {
//     const guildClient = createGuildClient("2077 Idea Board"); // 2077_Idea_Board  2077-idea-board

//     const limit = 10; // Adjust this as needed
//     const offset = 0; // Start from the first result

//     const searchResults = await guildClient.guild.search({
//       search: guildName,
//       limit,
//       offset
//     });

//     if (searchResults.length === 0) {
//       console.error(`No guild found with the name "${guildName}".`);
//       return;
//     }

//     const myGuild = searchResults[0];
//     const NEXT_PUBLIC_GUILD_ID = myGuild.id;
//     console.log(`NEXT_PUBLIC_GUILD_ID for "${guildName}": ${NEXT_PUBLIC_GUILD_ID}`);

//     const roles = await guildClient.guild.role.getAll(NEXT_PUBLIC_GUILD_ID);
//     const myRole = roles.find(role => role.name === roleName);

//     if (!myRole) {
//       console.error(`No role found with the name "${roleName}" in the "${guildName}" guild.`);
//       return;
//     }

//     const NEXT_PUBLIC_ROLE_ID = myRole.id;
//     console.log(`NEXT_PUBLIC_ROLE_ID for "${roleName}" role: ${NEXT_PUBLIC_ROLE_ID}`);
//     } catch (error) {
//     console.error("Error fetching guild and role IDs:", error);
//   }
// }
// getGuildAndRoleIds("2077 Idea Board", "Whitelist (Should later become 2077 Discord role)");


// // Get guild name by id
// async function getGuildNameById(guildId) {
//   try {
//     const guildClient = createGuildClient("Your Project Name"); // Replace with your project name

//     // Fetch the guild details using the provided ID
//     const guildDetails = await guildClient.guild.get(guildId);

//     // Check if the guild details were retrieved successfully
//     if (!guildDetails) {
//       console.error(`No guild found with the ID "${guildId}".`);
//       return;
//     }

//     // Extract roles or use an empty array if roles is undefined
//     const roles = guildDetails.roles ? guildDetails.roles : [];

//     // Log the guild name and other details
//     console.log(`Guild ID: ${guildDetails.id}`);
//     console.log(`Guild Name: ${guildDetails.name}`);
//     console.log(`Roles: ${roles.join(", ")}`);
//     console.log(`Image URL: ${guildDetails.imageUrl}`);
//     console.log(`URL Name: ${guildDetails.urlName}`);
//     console.log(`Member Count: ${guildDetails.memberCount}`);
//   } catch (error) {
//     console.error("Error fetching guild details:", error);
//   }
// }
// getGuildNameById(7487);