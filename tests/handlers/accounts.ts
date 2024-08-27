// import request from 'supertest';
// import { APIGatewayProxyEvent } from 'aws-lambda';
// import { handler as createAccountHandler } from 'src/';
// import { handler as getAccountHandler } from '../handlers/getAccount';

// beforeAll(async () => {
//   await connectTo();
// });

// describe('Account Handlers', () => {
//   it('should create an account and return 201 status', async () => {
//     const event: APIGatewayProxyEvent = {
//       body: JSON.stringify({
//         customerId: 'test-customer',
//         accountNumber: '12345',
//         currencies: ['USD', 'EUR'],
//       }),
//     } as any;

//     const response = await createAccountHandler(event);
//     expect(response.statusCode).toBe(201);
//     const body = JSON.parse(response.body);
//     expect(body.customerId).toBe('test-customer');
//   });

//   it('should retrieve an account by ID and return 200 status', async () => {
//     const createEvent: APIGatewayProxyEvent = {
//       body: JSON.stringify({
//         customerId: 'test-customer',
//         accountNumber: '12345',
//         currencies: ['USD', 'EUR'],
//       }),
//     } as any;

//     const createResponse = await createAccountHandler(createEvent);
//     const createdAccount = JSON.parse(createResponse.body);

//     const getEvent: APIGatewayProxyEvent = {
//       pathParameters: { accountId: createdAccount._id },
//     } as any;

//     const getResponse = await getAccountHandler(getEvent);
//     expect(getResponse.statusCode).toBe(200);
//     const retrievedAccount = JSON.parse(getResponse.body);
//     expect(retrievedAccount.customerId).toBe('test-customer');
//   });

//   // Add more tests for update and edge cases
// });
