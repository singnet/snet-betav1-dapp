# snet-dapp

This Dapp allows you to browse the list of services from the SingularityNET Registry and call them.
By default it uses the SingularityNET contracts deployed on the Kovan testnet.

To get Kovan AGI to use the Dapp you can use the official [SingularityNET AGI Faucet](https://faucet.singularitynet.io/).
To get Kovan ETH to pay for gas costs you should refer to [this repo](https://github.com/kovan-testnet/faucet).

# The beta dapp is under active development and will see several changes in the upcoming weeks
## How to call a Service

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


### UI for Services
Currently the UI needed by a service to capture inputs and render the output must be provided by the service developer as a PR. It must be provided in the form of a React component. The component will be contructed with the following properties
* isComplete - Flag indicating if the service call has completed
* serviceSpec - JSON object corresponding to the protobuf service definition
* callApiCallback - Function to be called when the service needs to be called. The signature of this function is `callApiCallback(serviceName,methodName, requestObject)`. The component must invoke this callback with the service name, method name and the request object for the call to succeed.
* response - The response object returned by the service call. This is sent only when isComplete is true. If the service call fails the DApp will display the error

To aid testing of the service before its published to the platform, the DApp has a standalone mode in which the UI can be tested. Here is how you use it
1. Set up the AI service with the snet daemon
2. The snet daemon should have the `blockchain_enabled` flag set to false
3. Update the `src/components/service/ServiceMappings.js` with the mapping for the service
4. Run the DApp `npm run serve-sandbox`
5. Enter the service id, org id, proto file contents and the daemon endpoint to start testing the UI

This approach will change in the future as we support a generic mechanism to declaratively describe a service's API. See [this](https://github.com/singnet/custom-ui-research) for more details



