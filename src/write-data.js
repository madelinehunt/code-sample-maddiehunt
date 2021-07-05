const AWS = require('aws-sdk');
const config = require('../config/local-config');
const chai = require('chai');
const assert = chai.assert;

const doc_client = new AWS.DynamoDB.DocumentClient(config.db);

/**
 * Validation function for event--i.e. the student object to be saved to the DB.
 * Right now only checks for existence of each attribute, as well as  checking
 * each one's type. Performs no further validation.
 */
const validate = (event) => {
  assert.exists(event, 'event is required!');
  assert.exists(event.schoolId, 'school ID is required!');
  assert.exists(event.studentId, 'studentId is required!');
  assert.exists(event.studentFirstName, 'studentFirstName is required!');
  assert.exists(event.studentLastName, 'studentLastName is required!');
  assert.exists(event.studentGrade, 'studentGrade is required!');

  assert.typeOf(event, 'object', 'Event must be an object!');
  assert.typeOf(event.schoolId, 'string', 'school ID must be a string!');
  assert.typeOf(event.studentId, 'string', 'studentId must be a string!');
  assert.typeOf(event.studentFirstName, 'string', 'studentFirstName must be a string!');
  assert.typeOf(event.studentLastName, 'string', 'studentLastName must be a string!');
  assert.typeOf(event.studentGrade, 'string', 'studentGrade must be a string!');
}

/**
 * The entry point into the lambda. Validates the event, then writes it to the
 * DB asynchronously.
 * Returns a Promise to fulfill the `await` keywords in the tests.
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.schoolName
 * @param {string} event.studentId
 * @param {string} event.studentFirstName
 * @param {string} event.studentLastName
 * @param {string} event.studentGrade
 */
exports.handler = (event) => {
  validate(event);

  let record = {
    TableName: config.tableName,
    Item: event,
  };

  return new Promise((resolve, reject) => {
    let req = doc_client.put(record, (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        // console.log("Succeeded writing");
        resolve(data);
      }
    });
  });
};
