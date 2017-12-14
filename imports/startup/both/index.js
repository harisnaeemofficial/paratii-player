// Import modules used by both client and server through a single index entry point
// e.g. useraccounts configuration file.

// import { Paratii } from 'paratii-lib'

global.regeneratorRuntime = require('babel-runtime/regenerator')
console.log('settings.public.http_provider: ', Meteor.settings.public.http_provider)

if (!Meteor.settings.public.http_provider) {
  let msg = `It seems that there is no http_provider set for blockchain access: please define Meteor.settings.public.http_provider`
  throw Error(msg)
}

// global.paratii = Paratii({
//   provider: Meteor.settings.public.http_provider,
//   registryAddress: Meteor.settings.public.ParatiiRegistry
// })

// web3.setProvider(new web3.providers.HttpProvider(Meteor.settings.public.http_provider))
