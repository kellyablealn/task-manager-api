const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Kelly',
        email: 'kellyableal@gmail.com',
        password: 'senha12345'
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
})

test('Should not signup because email must be unique', async () => {
    await request(app).post('/users').send({
        name: 'Pedro',
        email: 'mike@example.com',
        password: 'senha123456'
    }).expect(400)
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(response.body.user._id)
    expect(user.tokens[1].token).toBe(response.body.token)
})

test('Should not login - wrong password', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: '23kjdksld34'
    }).expect(400)
})


test('Should not login nonexisting user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email+'r',
        password: userOne.password
    }).expect(400)
})

test('Should get profile for user', async () => {
    await request(app).get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app).get('/users/me')
        .send()
        .expect(401)
})


test('Should not delete profile user for unauthenticated user', async () => {
    await request(app).delete('/users/me')
        .send()
        .expect(401)
})

test('Should delete profile user', async () => {
    const response = await request(app).delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOne._id)     
    expect(user).toBeNull()
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})


test('Should update valid user fields', async () => {
    const name = "Gabriela"
    await request(app)
        .patch('/users/me')
        .send({
            name: name
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200)
    
    const user = await User.findById(userOneId)
    expect(user.name).toEqual(name)
})

test('Should not update with invalid fields', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            location: "somewhere else"
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(400)
})

test('Should not update nonauthenticated user', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: "kelly"
        })
        .expect(401)
})

//
// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated

//
// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks