require('dotenv').config();
const connect = require('../lib/utils/connect');
const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../lib/models/User');
const app = require('../lib/app');

describe('auth app', () => {
    beforeAll(() => {
        connect();
    });

    beforeEach(done => {
        mongoose.connection.dropDatabase(done);
    });

    afterAll(done => {
        mongoose.connection.close(done);
    });
    afterAll(() => {
        return mongoose.disconnect();
    });
    
    it('can sign up a new user', () => {
        return request(app)
            .post('/auth/signup')
            .send({ email: 'someone@email.com', password: 'pa55word' })
            .then(res => {
                expect(res.body).toEqual({
                    user: {
                        _id: expect.any(String),
                        email: 'someone@email.com',
                    },
                    token: expect.any(String),
                });
            });
    });

    it('user can signin', () => {
        return User.create ({ email:'hey@gmail.com', password: 'password' })
            .then(() => {
                // const id = createdUser._id;
                return request(app)
                    .post('/auth/signin')
                    .send({ email: 'hey@gmail.com', password: 'password' });
            })
            .then(res => {
                expect(res.body).toEqual({
                    user: {
                        _id: expect.any(String),
                        email: 'hey@gmail.com',
                    },
                    token: expect.any(String)
                });
            });
    });
    it('has a /verify route', () => {
        return User.create({ email: 'hey@gmail.com', password: 'password' })
            .then(() => {
                return request(app)
                    .post('/auth/signin')
                    .send({ email: 'hey@gmail.com', password: 'password' })
                    .then(res => res.body.token);
            })
            .then(token => {
                return request(app)
                    .get('/auth/verify')
                    .set('Authorization', `Bearer ${token}`);
            })
            .then(res => {
                expect(res.body).toEqual({
                    email: 'hey@gmail.com',
                    _id: expect.any(String)
                });
            });
    });
});
