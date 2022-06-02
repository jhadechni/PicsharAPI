const usersModel = require('../models/userModel')
const mongoose = require('mongoose')
const app = require('../app')
const supertest = require('supertest')
const auth = require('../utils/auth')
require('dotenv').config();

let token
let user_id

beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
})

afterAll(async () => {
    await usersModel.deleteMany({})
    await mongoose.disconnect()
})

test('Register an user', async () => {
    const info = {
        "username": "jhadechine",
        "email": "tests@tests.com",
        "bio": "I am a test",
        "password": "testPassword",
        "birthdate": new Date(),
    }
    const response = await supertest(app).post('/users/').send(info)
    expect(response.statusCode).toEqual(201)
})

test('Login with username and password', async () => {
    const info = {
        "username": "jhadechine",
        "password": "testPassword",

    }
    const response = await supertest(app).post('/users/login').send(info)
    expect(response.statusCode).toEqual(200)
    expect(response.body.token).toBeDefined()
    token = response.body.token
    user_id = auth.verifyToken(token).user_id
})

test('Login with token', async () => {
    const response = await supertest(app).post('/users/login').send({token})
    expect(response.statusCode).toEqual(200)
    expect(response.body.token).toBeDefined()
})

test('User info', async () => {
    const response = await supertest(app).get('/users/').query({ user_id }).auth(token, { type: 'bearer' })
    expect(response.statusCode).toEqual(200)
    console.log(response.body)
})


