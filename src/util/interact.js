// const API_KEY = process.env.API_KEY
// const API_KEY = "RLC8aBq-Dcn27hzH2sNcfUrUncBperMb"
// const alchemyKey = `wss://eth-sepolia.g.alchemy.com/v2/${API_KEY}`

const alchemyKey =
	"wss://eth-sepolia.g.alchemy.com/v2/RLC8aBq-Dcn27hzH2sNcfUrUncBperMb"
const { createAlchemyWeb3 } = require("@alch/alchemy-web3")
const web3 = createAlchemyWeb3(alchemyKey) // Alchemy Web3 endpoint
const contractABI = require("../contract-abi.json")
const contractAddress = "0xBdbcBd678EaB4cD8e4e3c3BF943D5faa269Bd9E1"

export const helloWorldContract = new web3.eth.Contract(
	contractABI,
	contractAddress
)

// we will make a simple async web3 call to read from our contract. Our function will return the message stored in the smart contract:
export const loadCurrentMessage = async () => {
	const message = await helloWorldContract.methods.message().call()
	console.log("message: ", message)
	console.log("contract_address", contractAddress)
	return message
}

export const connectWallet = async () => {
	if (window.ethereum) {
		try {
			const addressArray = await window.ethereum.request({
				method: "eth_requestAccounts"
			})
			const obj = {
				status: "👆🏽 Write a message in the text-field above.",
				address: addressArray[0]
			}
			return obj
		} catch (err) {
			return {
				address: "",
				status: "😥 " + err.message
			}
		}
	} else {
		return {
			address: "",
			status: (
				<span>
					<p>
						{" "}
						🦊{" "}
						<a
							target='_blank'
							href={`https://metamask.io/download`}
							rel='noreferrer'
						>
							You must install Metamask, a virtual Ethereum wallet, in your
							browser.
						</a>
					</p>
				</span>
			)
		}
	}
}

export const getCurrentWalletConnected = async () => {
	if (window.ethereum) {
		try {
			const addressArray = await window.ethereum.request({
				method: "eth_accounts"
			})
			if (addressArray.length > 0) {
				return {
					address: addressArray[0],
					status: "👆🏽 Write a message in the text-field above."
				}
			} else {
				return {
					address: "",
					status: "🦊 Connect to Metamask using the top right button."
				}
			}
		} catch (err) {
			return {
				address: "",
				status: "😥 " + err.message
			}
		}
	} else {
		return {
			address: "",
			status: (
				<span>
					<p>
						{" "}
						🦊{" "}
						<a
							target='_blank'
							href={`https://metamask.io/download`}
							rel='noreferrer'
						>
							You must install Metamask, a virtual Ethereum wallet, in your
							browser.
						</a>
					</p>
				</span>
			)
		}
	}
}

export const updateMessage = async (address, message) => {
	if (!window.ethereum || address === null) {
		return {
			status:
				"💡 Connect your Metamask wallet to update the message on the blockchain."
		}
	}

	if (message.trim() === "") {
		return {
			status: "❌ Your message cannot be an empty string."
		}
	}

	//set up transaction parameters
	const transactionParameters = {
		to: contractAddress, // Required except during contract publications.
		from: address, // must match user's active address.
		data: helloWorldContract.methods.update(message).encodeABI()
	}

	//sign the transaction
	try {
		const txHash = await window.ethereum.request({
			method: "eth_sendTransaction",
			params: [transactionParameters]
		})
		return {
			status: (
				<span>
					✅{" "}
					<a
						target='_blank'
						href={`https://sepolia.etherscan.io/tx/${txHash}`}
						rel='noreferrer'
					>
						View the status of your transaction on Etherscan!
					</a>
					<br />
					ℹ️ Once the transaction is verified by the network, the message will
					be updated automatically.
				</span>
			)
		}
	} catch (error) {
		return {
			status: "😥 " + error.message
		}
	}
}
