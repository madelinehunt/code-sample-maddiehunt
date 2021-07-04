const AWS = require('aws-sdk');
const config = require('../config/local-config');
const chai = require('chai');
const assert = chai.assert;
//
// AWS.config.update(config.db);
const doc_client = new AWS.DynamoDB.DocumentClient(config.db);
//
// const dynamodb = new AWS.DynamoDB.DocumentClient({
//   apiVersion: '2012-08-10',
//   endpoint: new AWS.Endpoint('http://localhost:8000'),
//   region: 'us-west-2',
//   // what could you do to improve performance?
// });

const tableName = config.tableName;

/**
 * The entry point into the lambda
 *
 * @param {Object} event
 * @param {string} event.schoolId
 * @param {string} event.schoolName
 * @param {string} event.studentId
 * @param {string} event.studentFirstName
 * @param {string} event.studentLastName
 * @param {string} event.studentGrade
 */
exports.handler = async (event, db) => {
  // TODO use the AWS.DynamoDB.DocumentClient to save the 'SchoolStudent' record
  // The 'SchoolStudents' table key is composed of schoolId (partition key) and studentId (range key).
  assert.exists(event, 'event is undefined!');
  assert.exists(event.schoolId, 'school ID is required!');
  assert.exists(event.studentId, 'studentId is required!');
  assert.exists(event.studentFirstName, 'studentFirstName is required!');
  assert.exists(event.studentLastName, 'studentLastName is required!');
  assert.exists(event.studentGrade, 'studentGrade is required!');

  // var record = {
  //   TableName: config.tableName,
  //   Item: {
  //     'schoolId': event.schoolId,
  //     'studentId': event.studentId,
  //     'studentFirstName': event.studentFirstName,
  //     'studentLastName': event.studentLastName,
  //     'studentGrade': event.studentGrade,
  //   },
  // };
  var record = {
    TableName: config.tableName,
    Item: event,
  };

  let req = await doc_client.put(record, function(err, data){
    if (err) {
      console.error("error");
      console.error(err)
      console.error(JSON.stringify(err, null, 2));
      return false;
    } else {
      console.log("Succeeded");
    }
  }).promise().then(()=>{
    return new Promise(function(resolve, reject) {
      resolve("OK");
    });
  });
};
