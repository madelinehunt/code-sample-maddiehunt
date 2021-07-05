const AWS = require('aws-sdk');
const config = require('../config/local-config');
const chai = require('chai');
const assert = chai.assert;

const doc_client = new AWS.DynamoDB.DocumentClient(config.db);

const studentLastNameGsiName = 'studentLastNameGsi';

/**
 * Validation function for event--i.e. the student object to be used to
 * construct a query on the DB. Right now only checks for existence of each
 * attribute, as well as checking each one's type. Performs no further
 * validation.
 */
const validate = (event, validation_criteria) => {
  assert.exists(event, 'event is required!');
  assert.typeOf(event, 'object', 'Event must be an object!');

  Object.entries(validation_criteria).forEach(entry => {
    let [key, value] = entry;
    assert.exists(event[key], `${key} is required!`);
    assert.typeOf(event[key], value, `${key} must be of type: ${value}!`);
  });
};

/**
 * The entry point into the lambda. Validates the event, then uses it to query
 * the DB asynchronously. The different tests require different query
 * parameters, which are crudely delineated with if/else branches.
 * Returns a Promise to fulfill the `await` keywords in the tests.
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.studentId
 * @param {string} [event.studentLastName]
 */
exports.handler = (event) => {

  let query_params;

  if (event.schoolId !== undefined && event.studentId !== undefined) {
    // 'saves data to DynamoDB and then it can be read'
    validate(event, {
      'schoolId': 'string',
      'studentId': 'string',
    });
    query_params = {
      TableName: config.tableName,
      KeyConditionExpression: 'schoolId = :pkey and studentId = :rkey',
      ExpressionAttributeValues: {
        ':pkey': event.schoolId,
        ':rkey': event.studentId
      }
    };
  } else if (event.studentLastName !== undefined && event.schoolId === undefined) {
    // '(extra credit) can query for SchoolStudent records by studentLastName'
    validate(event, {
      'studentLastName': 'string'
    });
    query_params = {
      TableName: config.tableName,
      IndexName: studentLastNameGsiName,
      KeyConditionExpression: 'studentLastName = :pkey_gsi',
      ExpressionAttributeValues: {
        ':pkey_gsi': event.studentLastName
      }
    };
  } else if (event.schoolId !== undefined && event.studentId === undefined) {
    // 'returns all pages of data'
    validate(event, {
      'schoolId': 'string'
    });
    query_params = {
      TableName: config.tableName,
      KeyConditionExpression: 'schoolId = :pkey',
      ExpressionAttributeValues: {
        ':pkey': event.schoolId
      },
      Limit: '5',
    };
  } else {
    console.error('The query is missing parameters expected in this scenario');
  }

  return new Promise((resolve, reject) => {

    // defining results array to resolve with. This will be in-scope for all
    // function calls within this Promise.
    let results = [];

    let req = doc_client.query(query_params, function query_callback(err, data)  {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        // the presence of LastEvaluatedKey signifies an incomplete (paginated) result
        if (data.LastEvaluatedKey !== undefined) {
          results = results.concat(data.Items);
          query_params.ExclusiveStartKey = data.LastEvaluatedKey;
          // collate paginated results by calling query_callback recursively
          doc_client.query(query_params, query_callback)
        } else {
          results = results.concat(data.Items);
          resolve(results);
        }
      }
    });
  });

};
