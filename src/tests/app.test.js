const usersModel = require('../models/userModel')
const postsModel = require('../models/postModel')
const likeModel = require('../models/likeModel')
const followModel = require('../models/followModel')
const mongoose = require('mongoose')
const app = require('../app')
const supertest = require('supertest')
const auth = require('../utils/auth')
require('dotenv').config();

let token
let user_id
let user_id2
let response_id
let post_id

beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
})

afterAll(async () => {
    await usersModel.deleteMany({})
    await postsModel.deleteMany({})
    await likeModel.deleteMany({})
    await followModel.deleteMany({})
    await mongoose.disconnect()
})

test('Register an user (información completa)', async () => {
    const info = {
        "username": "jhadechine",
        "email": "tests@tests.com",
        "bio": "I am a test",
        "password": "testPassword",
        "birthdate": new Date(),
        "public_likes": true
    }
    const response = await supertest(app).post('/users/').send(info)
    expect(response.statusCode).toEqual(201)
})

test('Register an user (información incompleta)', async () => {
    const info = {
        "email": "tests@tests.com",
        "bio": "I am a test",
        "password": "testPassword"
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
    const response = await supertest(app).post('/users/login').send({ token })
    expect(response.statusCode).toEqual(200)
    expect(response.body.token).toBeDefined()
})

test('Login with username and password (user not found)', async () => {
    const info = {
        "username": "jhadechin",
        "password": "testPassword",
    }
    const response = await supertest(app).post('/users/login').send(info)
    expect(response.statusCode).toEqual(404)
    expect(response.body.message).toEqual('Username not found')
})

test('Login with username and password (incorrect password)', async () => {
    const info = {
        "username": "jhadechine",
        "password": "testPasswor",
    }
    const response = await supertest(app).post('/users/login').send(info)
    expect(response.statusCode).toEqual(404)
    expect(response.body.message).toEqual('Password incorrect')
})

test('User info (Contraseña no incluida en el response)', async () => {
    const response = await supertest(app).get('/users/').query({ user_id }).auth(token, { type: 'bearer' })
    expect(response.body.password).toEqual(undefined)
})

test('User info (Fecha de cumpleaños no incluida en el response)', async () => {
    const response = await supertest(app).get('/users/').query({ user_id }).auth(token, { type: 'bearer' })
    expect(response.body.birthdate).toEqual(undefined)
})

test('Posts, likes, followers and follows creation ', async () => {
    //POSTS
    const post1 = {
        "img_url": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fopensea.io%2Fassets%2F0x495f947276749ce646f68ac8c248420045cb7b5e%2F90386426052901588681616372686492698093957337993435002752835660684791818223617&psig=AOvVaw2IrkSvV949ALb9MVAdVlCf&ust=1654231544576000&source=images&cd=vfe&ved=0CAwQjRxqFwoTCLi3qPD6jfgCFQAAAAAdAAAAABAD",
        "bio": "Meme",
        "author": user_id
    }
    const post2 = {
        "img_url": "https://www.google.com/url?sa=i&url=https%3A%2F%2Fopensea.io%2Fassets%2F0x495f947276749ce646f68ac8c248420045cb7b5e%2F90386426052901588681616372686492698093957337993435002752835660684791818223617&psig=AOvVaw2IrkSvV949ALb9MVAdVlCf&ust=1654231544576000&source=images&cd=vfe&ved=0CAwQjRxqFwoTCLi3qPD6jfgCFQAAAAAdAAAAABAD",
        "bio": "Meme",
        "author": user_id
    }
    const post3 = {
        "img_url": "https://yt3.ggpht.com/ytc/AKedOLTnjfyEvH5-COw01ni8v9XeLrmjor7Ce04MkVPZ=s176-c-k-c0x00ffffff-no-rj-mo",
        "bio": "Meme",
        "author": user_id
    }
    const newPost1 = await postsModel.create(post1)
    const newPost2 = await postsModel.create(post2)
    await postsModel.create(post3)
    post_id = newPost1._id

    //LIKES
    const like1 = {
        post_id: newPost1._id,
        user_id: user_id
    }
    const like2 = {
        post_id: newPost2._id,
        user_id: user_id
    }
    await likeModel.create(like1)
    await likeModel.create(like2)

    //Second user
    const info = {
        "username": "testtest",
        "email": "tests@testing.com",
        "bio": "I am a test 2",
        "password": "testPassword",
        "birthdate": new Date(),
        "public_likes": true
    }
    const secondUser = await usersModel.create(info)
    user_id2 = secondUser._id
    //Follows

    const follow1 = {
        follower_id: user_id,
        following_id: secondUser._id,
        status: "accept"
    }
    const follow2 = {
        follower_id: secondUser._id,
        following_id: user_id,
        status: "accept"
    }
    const follow = await followModel.create(follow1)
    await followModel.create(follow2)
    response_id = follow._id
})

test('Numero de publicaciones del usuario refleja el numero correcto', async () => {
    const postCount = await postsModel.count({ author: user_id })
    const response = await supertest(app).get('/users/').query({ user_id }).auth(token, { type: 'bearer' })
    expect(response.body.post_count === postCount)
})

test('Numero de seguidores refleja el numero correcto', async () => {
    const followersCount = await followModel.count({ following_id: user_id })
    const response = await supertest(app).get('/users/').query({ user_id }).auth(token, { type: 'bearer' })
    expect(response.body.followers_count === followersCount)
})

test('Numero de seguidos refleja el numero correcto', async () => {
    const followedCount = await followModel.count({ follower_id: user_id })
    const response = await supertest(app).get('/users/').query({ user_id }).auth(token, { type: 'bearer' })
    expect(response.body.followed_count === followedCount)
})

test('Lista de seguidores de un usuario', async () => {
    const response = await supertest(app).get('/follows/followers').query({ user_id }).auth(token, { type: 'bearer' })
    expect(response.statusCode).toEqual(200) && expect(response.body).toBeDefined()
})

test('Lista de seguidos de un usuario', async () => {
    const response = await supertest(app).get('/follows/following').query({ user_id }).auth(token, { type: 'bearer' })
    expect(response.statusCode).toEqual(200) && expect(response.body).toBeDefined()
})

test('Solicitar seguir', async () => {
    const info = {
        "user_id": user_id2
    }
    const response = await supertest(app).post('/follows/request').send(info).auth(token, { type: 'bearer' })
    expect(response.statusCode).toEqual(404) && expect(response.body.message).toEqual('Already followed.')
})

test('Aceptar solicitud', async () => {
    const info = {
        "request_id": response_id,
        "action" : "accept"
    }
    const response = await supertest(app).get('/follows/requests').send(info).auth(token, { type: 'bearer' })
    expect(response.statusCode).toEqual(200) && expect(response.body.message).toEqual('OK')
})

test('Rechazar solicitud', async () => {
    const info = {
        "request_id": response_id,
        "action" : "reject"
    }
    const response = await supertest(app).get('/follows/requests').send(info).auth(token, { type: 'bearer' })
    expect(response.statusCode).toEqual(200) && expect(response.body.message).toEqual('OK')
})

test('Dar me gusta a publicación', async () => {
   
    const response = await supertest(app).post('/posts/like').send({user_id}).auth(token, { type: 'bearer' })
    expect(response.statusCode).toEqual(404) && expect(response.body.message).toEqual('Already liked')
})

//CHECK
test('Publicaciones "gustadas" por un usuario', async () => {
   
    const response = await supertest(app).get('/posts/liked-by').query({user_id}).auth(token, { type: 'bearer' })
    expect(response.statusCode).toEqual(200) && expect(response.body).toBeDefined()
})

test('Guardar publicación', async () => {
    const response = await supertest(app).post('/posts/save').send({post_id}).auth(token, { type: 'bearer' })
    const postSaved = await postsModel.findById({_id : post_id})
    expect(response.statusCode).toEqual(200) && expect(response.body === postSaved)
})

//CHECK
test('Publicaciones guardadas por un usuario', async () => {
    const response = await supertest(app).get('/posts/saved-by').auth(token, { type: 'bearer' })
    console.log(response.body)
    expect(response.statusCode).toEqual(200)
})