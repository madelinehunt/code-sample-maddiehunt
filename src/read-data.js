const AWS = require('aws-sdk');
const config = require('../config/local-config');
const chai = require('chai');
const assert = chai.assert;

const doc_client = new AWS.DynamoDB.DocumentClient(config.db);

const studentLastNameGsiName = 'studentLastNameGsi';

/**
 * Validation function for event--i.e. the student object to be saved to the DB.
 * Right now only checks for existence of each attribute, as well as  checking
 * each one's type. Performs no further validation.
 */
const validate = (event) => {
  assert.exists(event, 'event is undefined!');
  assert.exists(event.schoolId, 'school ID is required!');
  assert.exists(event.studentId, 'studentId is required!');

  assert.typeOf(event, 'object', 'Event is an object!');
  assert.typeOf(event.schoolId, 'string', 'school ID must be a string!');
  assert.typeOf(event.studentId, 'string', 'studentId must be a string!');
}

/**
 * The entry point into the lambda
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.studentId
 * @param {string} [event.studentLastName]
 */
exports.handler = (event) => {
  // TODO use the AWS.DynamoDB.DocumentClient to write a query against the 'SchoolStudents' table and return the results.
  // The 'SchoolStudents' table key is composed of schoolId (partition key) and studentId (range key).

  // TODO (extra credit) if event.studentLastName exists then query using the 'studentLastNameGsi' GSI and return the results.

  // TODO (extra credit) limit the amount of records returned in the query to 5 and then implement the logic to return all
  //  pages of records found by the query (uncomment the test which exercises this functionality)
  validate(event);

  let query_params = {
    TableName: config.tableName,
    KeyConditionExpression: 'schoolId = :pkey and studentId = :rkey',
    ExpressionAttributeValues: {
      ':pkey': event.schoolId,
      ':rkey': event.studentId
    }
  };

  return new Promise((resolve, reject) => {
    let req = doc_client.query(query_params, (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        // console.log("Succeeded querying");
        resolve(data.Items);
      }
    });
  });

};
