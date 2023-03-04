//import
//main
//calling the main function

// function deployFunc() {
//     console.log("Hi")
// }
// module.exports.default = deployFunc

//hre = hardhat runtime environment
// module.exports = async (hre) => {
//     const { getNamedAcoounts, deployments } = hre
//     hre.getNamedAccounts
//     hre.deployments
// }

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //if chainId is X use address Y
    //if chainId is Z use adress A

    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // if the pricefeed contract does not exist we deploy a minimal version
    //of our local testing

    //well what happens when we want to change chains?
    //when going for localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put pricefeed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        //VERIFY
        await verify(fundMe.address, args)
    }

    log("------------------------------------")
}
module.exports.tags = ["all", "fundMe"]
