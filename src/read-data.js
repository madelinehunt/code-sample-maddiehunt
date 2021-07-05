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
  assert.exists(event, 'event is undefined!');
  assert.typeOf(event, 'object', 'Event is an object!');

  Object.entries(validation_criteria).forEach(entry => {
    let [key, value] = entry;
    assert.exists(event[key], `${key} is required!`);
    assert.typeOf(event[key], value, `${key} must be a ${value}!`);
  });
};

const paginator = async (query_result, query_params) => {
  const results = {};
  results['Items'] = [];
  results.Items = results.Items.concat(query_result.Items);

  query_params.ExclusiveStartKey = query_result.LastEvaluatedKey;

  return new Promise((resolve, reject) => {
    let req = doc_client.query(query_params, (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        if (data.LastEvaluatedKey !== undefined) {
          // if there are more pages to query for, recursively call paginator()
          let new_page = paginator(data, query_params)
            .then((new_page) => {
              results.Items = results.Items.concat(new_page.Items);
              resolve(results);
            });
        } else {
          results.Items = results.Items.concat(data.Items);
          resolve(results);
        }
      }
    });
  });


};

/**
 * The entry point into the lambda. Validates the event, then uses it to query
 * the DB asynchronously. Returns a Promise to fulfill the `await` keyword in
 * the 'saves data to DynamoDB and then it can be read' test.
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.studentId
 * @param {string} [event.studentLastName]
 */
exports.handler = (event) => {

  let query_params;

  if (event.schoolId !== undefined && event.studentId !== undefined) {
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
    validate(event, {
      'studentLastName': 'string'
    });
    query_params = {
      TableName: config.tableName,
      IndexName: 'studentLastNameGsi',
      KeyConditionExpression: 'studentLastName = :pkey_gsi',
      ExpressionAttributeValues: {
        ':pkey_gsi': event.studentLastName
      }
    };
  } else if (event.schoolId !== undefined && event.studentId === undefined) {
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
    console.error('Query missing parameters expected in this scenario');
  }

  return new Promise((resolve, reject) => {
    let req = doc_client.query(query_params, (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        if (data.LastEvaluatedKey !== undefined) {
          data = paginator(data, query_params)
            .then((all_pages) => resolve(all_pages.Items));
        } else {
          resolve(data.Items);
        }
      }
    });
  });

  return promise;
};
