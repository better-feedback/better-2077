import React, { useEffect, useLayoutEffect } from "react";

import FormInput from "features/common/components/form-input";
import LabeledInput from "features/common/components/labeled-input";
import ChainIcon from "features/common/components/chain-icon";
import TokenAmountInput from "features/tokens/components/token-amount-input";
import Button from "features/common/components/button";

import { useIssueDetailsQuery } from "features/issues/hooks/useIssuesQueries";
import { useWalletChainQuery } from "features/common/hooks/useWalletQueries";
import useAddBountyMutation from "../hooks/useAddBountyMutation";
import { viewFunction } from "features/near/api";
import { useRouter } from "next/router";

import type { Token } from "features/tokens/types";
import { ethers } from "ethers";
import { useWriteContract, useAccount, useReadContract } from "wagmi";
import * as betterBounty from "../../../utils/solidity/BetterBountyV2.json";

import { contractConfig } from "utils/solidity/defaultConfig";

import { parseDate } from "utils/helpers";


export default function AddBounty(props: { issueNumber: number }) {
  const [token, setToken] = React.useState<Token | null>(null);
  const [amount, setAmount] = React.useState("");
  const [maxDeadline, setMaxDeadline] = React.useState("");
  const [areInputsValid, setAreInputsValid] = React.useState(false);
  const [doesBountyExist, setDoesBountyExist] = React.useState(false);

  const [isCreationLoading, setIsCreationLoading] = React.useState(false);
  const [isLoadingSigner, setIsLoadingSigner] = React.useState(false);
  const [minimumDeadline, setMinimumDeadline] = React.useState("");

  const { data: issue, isLoading } = useIssueDetailsQuery(props.issueNumber);
  const { data: walletChain = "" } = useWalletChainQuery();
  const addBountyMutation = useAddBountyMutation();
  const router = useRouter();
  const account = useAccount();


  const { writeContract } = useWriteContract();

  const fundBounty = async () => {
    setIsCreationLoading(true);
    try {
      await writeContract({
        abi: betterBounty.abi,
        address: `0x${process.env.NEXT_PUBLIC_POLYGON_CONTRACT_ADDRESS?.slice(2)}` as `0x${string}`,
        functionName: 'fundBounty',
        args: [
          issue?.url,
          maxDeadline
            ? Math.floor(new Date(new Date(maxDeadline).setUTCHours(23, 59, 59)).getTime() / 1000).toString()
            : '0',
          Math.floor(Date.now() / 1000).toString(),
          (process.env.NEXT_PUBLIC_PROJECT as string).toLowerCase(),
          ethers.parseEther(amount ? amount : '0'),
        ],
      });
      router.replace(`/issues/${issue?.number}`);
    } catch (error) {
      alert(error);
    } finally {
      setIsCreationLoading(false);
    }
  };

  const bountyPolygon = useReadContract({
    ...contractConfig,
    functionName: "getBountyById",
    args: [issue?.url],
    // watch: true,
  });

  function handleChangeMaxDeadline(event: React.ChangeEvent<HTMLInputElement>) {
    setMaxDeadline(event.target.value);
  }

  function handleClickAddBounty(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    event.preventDefault();

    if (!issue || !walletChain || !token || !amount) {
      return setAreInputsValid(false);
    }

    if (walletChain === "near") {
      localStorage.setItem("isBountyAdded", issue?.number.toString());

      addBountyMutation.mutate({
        issueNumber: issue.url,
        issueDescription: "byebye",
        chain: walletChain,
        token: token.address,
        startedAt: Math.floor(Date.now() / 1000),
        project: (process.env.NEXT_PUBLIC_PROJECT as string).toLowerCase(),
        maxDeadline: maxDeadline
          ? new Date(new Date(maxDeadline).setUTCHours(23, 59, 59, 59)).getTime() / 1000
          : 0,
        amount,
      });
    } else {
      writeContract({
        abi: betterBounty.abi,
        address: `0x${process.env.NEXT_PUBLIC_POLYGON_CONTRACT_ADDRESS?.slice(2)}` as `0x${string}`,
        functionName: 'fundBounty',
        args: [
          issue?.url,
          maxDeadline
            ? Math.floor(new Date(new Date(maxDeadline).setUTCHours(23, 59, 59)).getTime() / 1000).toString()
            : '0',
          Math.floor(Date.now() / 1000).toString(),
          (process.env.NEXT_PUBLIC_PROJECT as string).toLowerCase(),
          ethers.parseEther(amount ? amount : '0'),
        ],
      });
    }
  }
  
  

  useEffect(() => {
    const walletChainFromLocalStorage = localStorage.getItem("wallet-chain");
    if (walletChainFromLocalStorage == null) {
      const redirectUrl = window.location.href;
      location.assign(redirectUrl.replace("/add-bounty", ""))
    }
  }, [walletChain]);

  useEffect(() => {
    const isBountyAdded = localStorage.getItem("isBountyAdded");
    if (isBountyAdded !== null) {
      localStorage.removeItem("isBountyAdded");
      router.replace(`/issues/${isBountyAdded}`);
    }
  }, []);

  useEffect(() => {
    /* Checking if the issue exists. */
    if (!issue) return;

    /* Getting bounty details for the issue */
    viewFunction("getBountyByIssue", { issueId: issue?.url })
      .then((res) => {
        setDoesBountyExist(res);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [issue]);

  useEffect(() => {
    const walletChainFromLocalStorage = localStorage.getItem("wallet-chain");
    if (!walletChainFromLocalStorage) {
      const issueNumber = router.pathname.split("/")[2];
      router.replace(`/issues/${issueNumber}`);
    }
  }, [walletChain]);

  useLayoutEffect(() => {
    let today = new Date();
    let dd = today.getDate() + 1;
    let mm = today.getMonth() + 1; //January is 0 so need to add 1 to make it 1!
    let yyyy = today.getFullYear();
    if (dd < 10) {
      // @ts-ignore
      dd = "0" + dd;
    }
    if (mm < 10) {
      // @ts-ignore
      mm = "0" + mm;
    }

    let tomorrow = yyyy + "-" + mm + "-" + dd;
    setMinimumDeadline(tomorrow);
  }, [])

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!issue) {
    return <div>Not found</div>;
  }



  const isExpired = () => {
    const localStorageChain = localStorage.getItem("wallet-chain")

    if (!localStorageChain) {
      return false
    }

    if (localStorageChain === "near") {
      // @ts-ignore
      return !doesBountyExist ? false : Math.floor(Date.now() / 1000) > parseInt(doesBountyExist?.deadline);
    } else {
      // @ts-ignore
      if (bountyPolygon?.data?.id !== "") {
        // @ts-ignore
        return Math.floor(Date.now() / 1000) > parseInt(bountyPolygon?.data?.deadline);
      } else {
        return false
      }
    }
  }

  const showDatePicker = () => {
    // @ts-ignore
    return walletChain === "near" ? !doesBountyExist : bountyPolygon?.data?.id === ""
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold">Add bounty</h1>
      <form className="grid grid-cols-4 gap-2 mt-4">
        <LabeledInput label="Chain">
          <div className="flex flex-row items-center">
            <ChainIcon
              chainName={walletChain || ""}
              size={18}
              className="dark:fill-current dark:text-white mr-2"
            />
            {walletChain?.toUpperCase()}
          </div>
        </LabeledInput>
        <LabeledInput label="GitHub issue">
          <div>#{issue.number}</div>
        </LabeledInput>
        <LabeledInput label="Status">
          {/* @ts-ignore */}
          <div>{walletChain === "near" ? isExpired() ? "EXPIRED" : (!doesBountyExist ? "NOBOUNTY" : "OPEN") : (bountyPolygon?.data?.id === "" ? "NOBOUNTY" : "OPEN")}</div>
        </LabeledInput>
        <LabeledInput label="Started At">
          {/* @ts-ignore */}
          <div>{walletChain === "near" ? (!doesBountyExist ? "-" : parseDate(doesBountyExist?.startedAt)) : (bountyPolygon?.data?.id === "" ? "-" : parseDate(bountyPolygon?.data?.startedAt))}</div>
        </LabeledInput>
        {showDatePicker() && (
          <LabeledInput label="Max. deadline" className="col-span-4">
            <FormInput
              type="date"
              value={maxDeadline}
              min={minimumDeadline}
              onChange={handleChangeMaxDeadline}
              className="w-full"
              required
            />
          </LabeledInput>
        )}

        <TokenAmountInput
          inputClassName="col-span-4"
          onChangeToken={setToken}
          tokenValue={token}
          onChangeAmount={setAmount}
          amountValue={amount}
        />
        <Button
          className="w-full col-span-4 mt-4"
          onClick={handleClickAddBounty}
          disabled={addBountyMutation.isLoading || isExpired()}
        >
          {addBountyMutation.isLoading
            ? "Creating bounty..."
            // @ts-ignore
            : doesBountyExist || bountyPolygon?.data?.id !== ""
              ? "Fund Bounty"
              : "Create bounty"}
        </Button>
      </form>
    </div>
  );
}
