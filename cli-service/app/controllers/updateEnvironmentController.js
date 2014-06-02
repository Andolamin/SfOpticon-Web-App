/**
 * Update environment information in SfOpticon and the service database
 *
 * Created by Alan on 5/27/2014.
 */
function UpdateEnvironmentController() {
    this.paramDefinition = {
        org: {
            required: true,
            type: 'string',
            description: 'The organization to update'
        },
        name: {
            required: false,
            type: 'string',
            description: 'The friendly name for the organization.'
        },
        username: {
            required: false,
            type: 'string',
            description: 'The username for accessing the org.'
        },
        password: {
            required: false,
            type: 'string',
            description: 'The password for accessing the org.'
        },
        production: {
            required: false,
            type: 'boolean',
            description: 'Flag for if the org is the production org.'
        }
    }
}

module.exports = UpdateEnvironmentController;