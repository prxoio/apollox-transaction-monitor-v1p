async function convertBNBtoUSD(amountBNB: number, priceBNB: any): Promise<number> {
  try {
    const bnbPriceInUSD = priceBNB.indexPrice
    const amountInUSD = amountBNB * bnbPriceInUSD
    console.log(`${amountBNB} BNB is approximately ${amountInUSD.toFixed(2)} USD.`)
    return amountInUSD
  } catch (error) {
    console.error('Failed to fetch or process BNB price:', error)
    throw error
  }
}

async function calculateTradeMetrics(tradeData: any, price: any) {
  const amountInBN = BigInt(tradeData.amountIn)
  const qtyBN = BigInt(tradeData.qty)
  const priceBN = BigInt(tradeData.price)

  const entryPriceUSD = Number(priceBN) / 1e8

  const initialMarginBNB = Number(amountInBN) / 1e18
  const initialMarginUSD = await convertBNBtoUSD(initialMarginBNB, price.BNBUSD)

  const totalSizeUSD = (Number(qtyBN) / 1e10) * entryPriceUSD
  const leverage = totalSizeUSD / initialMarginUSD
  const totalSizeBNB = leverage * initialMarginBNB

  return {
    initialMargin: `${initialMarginBNB.toFixed(4)} BNB`,
    initialMarginUSD: `${initialMarginUSD.toFixed(2)} USD`,
    leverage: `${leverage.toFixed(2)}x`,
    totalSize: `${totalSizeUSD.toFixed(2)} USD`,
    totalSizeBNB: `${totalSizeBNB.toFixed(2)} BNB`,
    entryPrice: `${entryPriceUSD.toFixed(2)} USD per BNB`,
  }
}

function removeNumericKeys(data: any) {
  const result: { [key: string]: any } = {}
  Object.entries(data).forEach(([key, value]) => {
    if (!/^\d+$/.test(key)) {
      result[key] = value
    }
  })
  return result
}

export const tradeMetrics = async (data: any, price: any): Promise<any> => {
  const transactionData = removeNumericKeys(data)
  const metrics = await calculateTradeMetrics(transactionData, price)
  console.log(metrics)
  return metrics
}
