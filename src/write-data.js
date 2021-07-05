const AWS = require('aws-sdk');
const config = require('../config/local-config');
const chai = require('chai');
const assert = chai.assert;

const doc_client = new AWS.DynamoDB.DocumentClient(config.db);

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
const validate = (event) =>{
  assert.exists(event, 'event is undefined!');
  assert.exists(event.schoolId, 'school ID is required!');
  assert.exists(event.studentId, 'studentId is required!');
  assert.exists(event.studentFirstName, 'studentFirstName is required!');
  assert.exists(event.studentLastName, 'studentLastName is required!');
  assert.exists(event.studentGrade, 'studentGrade is required!');
}

exports.handler = (event) => {
  validate(event);

  var record = {
    TableName: config.tableName,
    Item: event,
  };

  // let fetch = async () => {
  //   let req = await doc_client.put(record, (err, data) => {
  //     if (err) {
  //       console.error("error");
  //       console.error(err)
  //     } else {
  //       // console.log("Succeeded");
  //     }
  //   });
  //   return req;
  // };
  //
  // let response = fetch().then((req)=>{
  //   // console.log(req);
  // });
  //
  // return new Promise((resolve, reject) => {
  //   setTimeout(()=>{resolve("OK")}, 30)
  // });
  const promise =  new Promise((resolve, reject) => {
    let req = doc_client.put(record, (err, data) => {
      if (err) {
        console.error("error");
        console.error(err)
        reject(err);
      } else {
        console.log("Succeeded");
        resolve(data);
      }
    });
  });
  return promise;
};

exports.async_handler = async (event) => {
  validate(event);

  var record = {
    TableName: config.tableName,
    Item: event,
  };

  const promise =  new Promise(async (resolve, reject) => {
    let req = await doc_client.put(record, (err, data) => {
      if (err) {
        console.error("error");
        console.error(err)
        reject(err);
      } else {
        console.log("Succeeded");
        resolve(data);
      }
    });
  });
  return promise;
};
