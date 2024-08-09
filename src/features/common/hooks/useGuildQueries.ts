// import { createGuildClient } from "@guildxyz/sdk";
import axios from "axios";
import { Issue } from "features/issues/types";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { nearAccountToHex } from "utils/helpers";
// import { useAccount } from "wagmi";
// import { chainsToApi } from "../constants";

import { createGuildClient, createSigner } from "@guildxyz/sdk";
// import { useQuery } from "react-query";
// import { useAccount } from "wagmi";
import { chainsToApi } from "../constants";

import { useAccount, useSignMessage } from "wagmi";






export function useVotingAccessQuery() {
  const walletChain = window.localStorage.getItem("wallet-chain");
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  return useQuery("hasVotingAccess", async () => {
    if (!walletChain) {
      return null;
    }

    let canVote: boolean = false;
    const guildClient = createGuildClient("2077 Idea Board"); // Replace with env var

    // Ensure address is defined before using it
    if (!address) {
      throw new Error("User address is undefined. Please connect your wallet.");
    }

    // Create a signer function using wagmi's signMessageAsync
    const signerFunction = createSigner.custom(
      (message) => signMessageAsync({ message }),
      address as `0x${string}`
    );

    if (walletChain === "near") {
      const { getAccountId } = chainsToApi[walletChain];

      return getAccountId().then(async (accountId) => {
        const account = nearAccountToHex([accountId]);

        // Check access to the guild for the NEAR account
        const access = await guildClient.guild.accessCheck(
          parseInt(process.env.NEXT_PUBLIC_GUILD_ID as string),
          signerFunction // Pass the signer function if needed
        );

        // Assuming accessResponse is an array and you want to check the first item's access
        const canVote = access[0]?.access ?? false; // Extract access or default to false
        return canVote;
      });
    } else {
      // Check access to the guild for the Ethereum address
      const access = await guildClient.guild.accessCheck(
        parseInt(process.env.NEXT_PUBLIC_GUILD_ID as string),
        signerFunction // Pass the signer function if needed
      );

      // canVote = access;
      const canVote = access[0]?.access ?? false;
      return canVote;
    }
  });
}




// export function useVotingAccessQuery() {
//   const walletChain = window.localStorage.getItem("wallet-chain");
//   const { address } = useAccount();
//   return useQuery("hasVotingAccess", async () => {
//     if (!walletChain) {
//       return null;
//     }

//     let canVote: boolean = false;

//     if (walletChain === "near") {
//       const { getAccountId } = chainsToApi[walletChain];

//       return getAccountId().then(async (accountId) => {
//         const account = nearAccountToHex([accountId]);

//         //Getting guild roles data
//         const guildData = await guild.getUserAccess(
//           parseInt(process.env.NEXT_PUBLIC_GUILD_ID as string),
//           account[0]
//         );

//         //Getting role id by chain
//         const roleId: string = process.env.NEXT_PUBLIC_NEAR_ROLE_ID as string;

//         //Checking if user has access to vote or not
//         guildData.forEach((access) => {
//           if (access.roleId === parseInt(roleId)) {
//             canVote = access.access;
//           }
//         });
//         return canVote;
//       });
//     } else {
//       const guildData = await guild.getUserAccess(
//         parseInt(process.env.NEXT_PUBLIC_GUILD_ID as string),
//         address as string
//       );

//       //Getting role id by chain
//       const roleId: string = process.env.NEXT_PUBLIC_ROLE_ID as string;

//       //Checking if user has access to vote or not
//       guildData.forEach((access) => {
//         if (access.roleId === parseInt(roleId)) {
//           canVote = access.access;
//         }
//       });

//       return canVote;
//     }
//   });
// }

export const getVoteCount = async (issueNumber: number) => {
  const result = await axios.get(
    `/api/comment/getVoteCount?issueNumber=${issueNumber}`
  );
  return result.data;
};

/*
 * It returns the number of votes for a given issue
 * @param {number} issueNumber - The issue number of the issue we want to get the vote count for.
 * @returns The result of the query.
 */
export function useIssueVoteCount(issueNumber: number) {
  return useQuery(["issueVoteCount", issueNumber], async () => {
    /* Making a request to the backend to get the vote count for a given issue. */
    return getVoteCount(issueNumber);
  });
}

export function useVote() {
  const queryClient = useQueryClient();

  const addVoteMutation = useMutation(
    async (params: {
      issueNumber: number;
      isUpVote: boolean;
      walletId: string;
    }) => {
      const result = await axios.post("/api/comment/addComment", {
        issueNumber: params.issueNumber,
        isUpVote: params.isUpVote,
        walletId: params.walletId,
      });
      return result.data;
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "issueVoteCount",
          variables.issueNumber,
        ]);
      },
    }
  );

  return addVoteMutation;
}
