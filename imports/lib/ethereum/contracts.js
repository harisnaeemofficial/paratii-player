import { paratii } from './paratii.js'
// import { paratii } from './connection.js'
// import { paratii } from '/imports/lib/ethereum/paratii.js'
import ParatiiAvatarSpec from './contracts/ParatiiAvatar.json'
import ParatiiRegistrySpec from './contracts/ParatiiRegistry.json'
import ParatiiTokenSpec from './contracts/ParatiiToken.json'
import SendEtherSpec from './contracts/SendEther.json'
import VideoRegistrySpec from './contracts/VideoRegistry.json'
import VideoStoreSpec from './contracts/VideoStore.json'

const CONTRACTS = {
  'ParatiiAvatar': {
    spec: ParatiiAvatarSpec
  },
  'ParatiiRegistry': {
    spec: ParatiiRegistrySpec
  },
  'ParatiiToken': {
    spec: ParatiiTokenSpec
  },
  'SendEther': {
    spec: SendEtherSpec
  },
  'VideoRegistry': {
    spec: VideoRegistrySpec
  },
  'VideoStore': {
    spec: VideoStoreSpec
  }
}

export function setRegistryAddress (address) {
  console.log('set registry address' + address)
  Meteor.settings.public.ParatiiRegistry = address
}

export function getRegistryAddress () {
  console.log('get registry address' + Meteor.settings.public.ParatiiRegistry)
  return Meteor.settings.public.ParatiiRegistry
  // return paratii.config.registryAddress
}

export function getParatiiRegistry () {
  // return paratii.contracts.ParatiiRegistry
  let address = getRegistryAddress()
  if (!address) {
    let msg = `No paratii registry address known!`
    throw Error(msg)
  }
  return paratii.eth.getContract('ParatiiRegistry')
}

// TODO: optimization: do not ask the contract addresses from the registry each time, only on startup/first access
export async function getContractAddress (name) {
  // paratii.eth.getContractAddress(name)
  if (name === 'ParatiiRegistry') {
    return getRegistryAddress()
  }
  try {
    let address = await getParatiiRegistry().getContract(name)
    // console.log(`contract ${name} is located at ${address}`)
    return address
  } catch (err) {
    console.log(err)
  }
}

export async function getContract (name) {
  // paratii.eth.getContract(name)
  let contractInfo = CONTRACTS[name]
  if (!contractInfo) {
    throw Error(`No contract with name "${name}" is known`)
  }
  let address = await paratii.eth.getContractAddress(name)
  if (address) {
    const contract = paratii.eth.web3.eth.contract(contractInfo.spec.abi).at(address)
    return contract
  }
}

export async function getParatiiContracts () {
  // paratii.eth.getContracts()
  let contracts = {}
  let contractNames = [
    'ParatiiAvatar',
    'ParatiiToken',
    'ParatiiRegistry',
    'SendEther',
    'VideoRegistry',
    'VideoStore'
  ]
  for (let i = 0; i < contractNames.length; i++) {
    contracts[contractNames[i]] = await paratii.eth.getContract(contractNames[i])
  }
  return contracts
}
