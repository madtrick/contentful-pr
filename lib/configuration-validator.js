'use strict';

var revalidator = require('revalidator');

module.exports = configurationValidator;
function configurationValidator (configuration) {
  var validationResult = revalidator.validate(configuration, {
    properties: {
      credentials : {
        type: 'object',
        required: true,
        properties : {
          github: {
            type: 'object',
            require: true,
            properties: {
              type: {
                type: 'string',
                required: true
              },
              token : {
                type: 'string',
                required: true
              }
            }
          },
          targetprocess: {
            type: 'object',
            required: 'true',
            properties: {
              domain: {
                type: 'string',
                required: true
              },
              username: {
                type: 'string',
                required: true
              },
              password: {
                type: 'string',
                required: true
              }
            }
          }
        }
      }
    }
  });

  return validationResult.valid;
}
