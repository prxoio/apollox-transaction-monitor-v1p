import Web3 from 'web3'

const web3 = new Web3('https://bsc-dataseed.binance.org/')

const minABI = [
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    type: 'function',
  },
]

//  get the token symbol
export const getTokenSymbol = async (address: string) => {
  // check if the address is zero
  if (address === '0x0000000000000000000000000000000000000000') {
    console.log('Zero address')
    return 'BNB'
  }
  const contract = new web3.eth.Contract(minABI, address)

  try {
    // fetch token symbol
    const symbol = await contract.methods.symbol().call()
    console.log('Token Symbol:', symbol)
    return symbol
  } catch (error) {
    console.error('Error fetching token symbol:', error)
    return 'not found'
  }
}

// get token symbol
//getTokenSymbol('0x0000000000000000000000000000000000000000')
