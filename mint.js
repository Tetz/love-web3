import "dotenv/config";
import { ethers } from "ethers";
import { createRequire } from 'module'; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const contractAbi = require('./abi.json'); // Use the constructed 'require' method


const { QUICKNODE_HTTP_ENDPOINT, PRIVATE_KEY } = process.env;
const contractAddress = "0xB0C35A41994b75B98fA148b24Fcf0a84db21751D";

const provider = new ethers.providers.JsonRpcProvider(QUICKNODE_HTTP_ENDPOINT);
const a = provider.detectNetwork().then((x) => console.log(x));

const contractInstance = new ethers.Contract(
  contractAddress,
  contractAbi,
  provider
);

async function getGasPrice() {
  let feeData = await provider.getFeeData();
  return feeData.gasPrice;
}

async function getWallet(PRIVATE_KEY) {
  const wallet = await new ethers.Wallet(PRIVATE_KEY, provider);
  return wallet;
}

async function getChain(_provider) {
  let chainId = await _provider.getNetwork();
  return chainId.chainId;
}

async function getNonce(signer) {
  return (await signer).getTransactionCount();
}

async function mintERC1155(index, name, amount) {
  try {
    if (await getChain(provider) === 80001) {
      const wallet = getWallet(PRIVATE_KEY);
      const nonce = await getNonce(wallet);
      const gasFee = await getGasPrice();
      let rawTxn = await contractInstance.populateTransaction.mintERC1155(
        index,
        name,
        amount,
        {
          gasPrice: gasFee,
          nonce: nonce,
        }
      );
      console.log(
        "Submitting transaction with gas price:",
        ethers.utils.formatUnits(gasFee, "gwei")
      );
      console.log("Nonce:", nonce);

      let signedTxn = (await wallet).sendTransaction(rawTxn);
      let receipt = (await signedTxn).wait();
      if (receipt) {
        console.log(
          "\nTransaction successful!!!\nTransaction Hash:",
          (await signedTxn).hash
        );
        console.log("Block Number:", (await receipt).blockNumber);
        console.log(
          "\nTo see your transaction, navigate to:\nhttps://polygonscan.com/tx/" +
            (await signedTxn).hash
        );
      } else {
        console.log("Error submitting transaction");
      }
    } else {
      console.log("Wrong network - Connect to configured chain ID first!");
    }
  } catch (error) {
    console.log("Error Caught in Catch Statement: ", error);
  }
}

mintERC1155(0, "Saturn", 1);
