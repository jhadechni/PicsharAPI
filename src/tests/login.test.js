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

test('Register an user (información completa)', async () => {
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

test('Register an user (información imcompleta)', async () => {
    const info = {
        "username": "jhadechine",
        "email": "tests@tests.com",
        "bio": "I am a test",
        "password": "testPassword",
        "birthdate": new Date(),
    }
    const response = await supertest(app).post('/users/').send(info)
    expect(response.statusCode).toEqual(400)
})

test('Login with username and password (informacion valida)', async () => {
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

test('Login with token (informacion valida)', async () => {
    const response = await supertest(app).post('/users/login').send({token})
    expect(response.statusCode).toEqual(200)
    expect(response.body.token).toBeDefined()
})

test('Login with username and password (user not found)', async () => {
    const info = {
        "username": "jhadechine",
        "password": "testPassword",
    }
    const response = await supertest(app).post('/users/login').send(info)
    expect(response.statusCode).toEqual(404)
    expect(response.body.message).toEqual('Username not found')
})

test('Login with username and password (incorrect password)', async () => {
    const info = {
        "username": "jhadechine",
        "password": "testPassword",
    }
    const response = await supertest(app).post('/users/login').send(info)
    expect(response.statusCode).toEqual(404)
    expect(response.body.message).toEqual('Password incorrect')
})

test('User info', async () => {
    const response = await supertest(app).get('/users/').query({ user_id }).auth(token, { type: 'bearer' })
    expect(response.statusCode).toEqual(200)
})


