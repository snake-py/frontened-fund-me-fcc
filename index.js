import { ethers } from './ethers-5.1.esm.min.js';
import { abi, contractAddress } from './constants.js';

const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton');
const balanceButton = document.getElementById('balanceButton');
const withdrawButton = document.getElementById('withdrawButton');
connectButton.addEventListener('click', connect);
fundButton.addEventListener('click', fund);
balanceButton.addEventListener('click', getBalance);
withdrawButton.addEventListener('click', withdraw);

// complete ether js object
// console.log(ethers);

async function connect() {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
        await ethereum.request({ method: 'eth_requestAccounts' });
        connectButton.innerHTML = 'Connected!';
    } else {
        connectButton.innerHTML = 'Please install MetaMask';
        console.log('MetaMask is not installed!');
    }
}

async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log('Balance: ', ethers.utils.formatEther(balance));
    }
}

async function fund(e) {
    const ethAmount = document.getElementById('ethAmount').value;
    console.log('Funding ' + ethAmount + ' ETH');
    if (typeof window.ethereum !== 'undefined') {
        // provider - connection to the blockchain
        // signer / wallet / someone with some gas
        // contract that are interacting with ^ ABI and address

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(); // will return the first account connected account from metamask (basically the connected account)
        const contract = new ethers.Contract(contractAddress, abi, signer); // contract address and ABI
        try {
            const transaction = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransactionMine(transaction, provider);
            // await transaction.wait(1); // why not just use this?
            console.log('Funded!');
        } catch (error) {
            console.log(error);
        }
    } else {
        connectButton.innerHTML = 'Please install MetaMask';
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log('Mined! => Confirmations: ', transactionReceipt.confirmations);
                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });
}

async function withdraw() {
    if (typeof window.ethereum !== 'undefined') {
        console.log('Withdrawing...');
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transaction = await contract.withdraw();
            await listenForTransactionMine(transaction, provider);
            console.log('Withdrew!');
        } catch (error) {
            console.log(error);
        }
    } else {
        connectButton.innerHTML = 'Please install MetaMask';
    }
}
