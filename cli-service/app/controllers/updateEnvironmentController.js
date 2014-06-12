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
            required: true,
            type: 'string',
            description: 'The new name for the organization.'
        }
    }
}

module.exports = UpdateEnvironmentController;