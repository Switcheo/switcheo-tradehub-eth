const CCMMock = artifacts.require('CCMMock')
const CCMProxyMock = artifacts.require('CCMProxyMock')
const LockProxy = artifacts.require('LockProxy')
const SwitcheoToken = artifacts.require('SwitcheoTokenBSC')
const { LOCAL_COUNTERPART_CHAIN_ID } = require('../test/constants')

module.exports = function(deployer, network) {
    deployer.then(async () => {
        // let counterpartChainId = 192
        // let ccmProxyAddress = '0x7087E66D6874899A331b926C261fa5059328d95F'
        let counterpartChainId
        let ccmProxyAddress

        if (network === 'bscmainnet') {
            console.log('===== deploying for mainnet =====')
            counterpartChainId = 5
            ccmProxyAddress = '0xABD7f7B89c5fD5D0AEf06165f8173b1b83d7D5c9'
        } else {
            counterpartChainId = 197
            ccmProxyAddress = '0x441C035446c947a97bD36b425B67907244576990'
        }

        if (network === 'development') {
            await deployer.deploy(CCMMock)
            const ccm = await CCMMock.deployed()
            await deployer.deploy(CCMProxyMock, ccm.address)
            const ccmProxy = await CCMProxyMock.deployed()
            ccmProxyAddress = ccmProxy.address
            counterpartChainId = LOCAL_COUNTERPART_CHAIN_ID
        }

        //  deploy SwitcheoToken
        await deployer.deploy(SwitcheoToken)
        const swithcheoTokenAddress = SwitcheoToken.address
        const swithcheoTokenInstance = await SwitcheoToken.deployed()

        //  deploy LockProxy
        await deployer.deploy(LockProxy, swithcheoTokenAddress, ccmProxyAddress, counterpartChainId)
        const lockProxyAddress = LockProxy.address

        // initialise LockProxy address for SwitcheoToken
        await swithcheoTokenInstance.initalize(lockProxyAddress)
    })
}
