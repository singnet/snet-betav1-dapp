# snet-dapp

This Dapp allows you to browse the list of SingularityNET Agents from the SingularityNET Registry and call them to provide a Service.
The Dapp uses the SingularityNET contracts deployed on the Kovan testnet.

To get Kovan AGI to use the Dapp you can use the official [SingularityNET AGI Faucet](https://faucet.singularitynet.io/).
To get Kovan ETH to pay for gas costs you should refer to [this repo](https://github.com/kovan-testnet/faucet).

# The beta dapp is under active development and will see several changes in the upcoming weeks#
## How to call a Service
The DApp can currently only interact with services that match the API of the example service. This will change in the future as we support a generic mechanism to declaratively describe a service's API. 

1. Get [Ether](https://github.com/kovan-testnet/faucet) and [AGI](https://faucet.singularitynet.io/) on the Kovan network
2. Navigate to the SingularityNET beta [dapp](http://beta.singularitynet.io/)
3. Unlock MetaMask
4. Authorize tokens for transfer to the Multi party escrow in the profile page
5. Transfer tokens to the Multi party escrow in the profile page
6. Click the "Details" button on the agent list in the home page. This will bring out a job slide out
7. Click the "Start Job" button to initiate the invocation flow in the slide out
6. To invoke an agent you first need to create a channel by allocating funds from the escrow. You can also set an expiry block number.
7. Click on the Reserve funds button which will open the channel
8. Once the channel has been created you can invoke the agent by selecting the service and method and passing in the expected input.
9. The result from the operation is displayed in the result tab

## Development instructions
* Install [Node.js and npm](https://nodejs.org/)
* `npm install` to get dependencies
* `npm run serve` to serve the application locally and watch source files for modifications

### Deployment instructions
* `npm run build` builds the application distributable files to the `dist` directory
* `npm run deploy`; the target S3 Bucket for the deployment and its region are specified as command line parameters in the package.json file npm script

### Additional commands
* `npm run build-analyze` shows the size of the application's bundle components; the original size, the parsed size (uglified + tree-shaken) and the gzipped size
* `npm run serve-dist` serves the `dist` directory locally
