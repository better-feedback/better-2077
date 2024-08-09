// import { ethers } from "ethers";
// import { useQuery } from "react-query";
import { useReadContract } from "wagmi";
import * as betterBounty from "../../../utils/solidity/BetterBountyV2.json";

export function useGetBountyQuery() {
  return useReadContract({
    address: `0x${process.env.NEXT_PUBLIC_POLYGON_CONTRACT_ADDRESS?.slice(2)}` as `0x${string}`,
    abi: betterBounty.abi,
    functionName: "bountyCount",
  });
}

// const { data, isError, isLoading } = useContractRead({
//   addressOrName: process.env.NEXT_PUBLIC_POLYGON_CONTRACT_ADDRESS as string,
//   contractInterface: betterBounty.abi,
//   functionName: "bountyCount",
// });
