const AWS = require('aws-sdk');

const local_config = {
  db: {
    apiVersion: '2012-08-10',
    endpoint: new AWS.Endpoint('http://localhost:8000'),
    region: 'us-west-2',
    accessKeyId: 'fakeKeyId',
    secretAccessKey: 'fakeSecretAccessKey',
  },
  tableName: 'SchoolStudents',
};

module.exports = local_config;
