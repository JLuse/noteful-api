const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeFoldersArray, makeMaliciousFolder } = require('./folders.fixtures')

describe('Folders Endpoints', function() {
    let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE notes, folders RESTART IDENTITY CASCADE'))

  describe(`GET /folders`, () => {
    context('Given there are no folders in the database', () => {
        it(`responds with 200 and an empty list`, () => {
            return supertest(app)
                .get('/api/folders')
                .expect(200, [])
        })
    })
    context('Given there are folders in the database', () => {
        const testFolders = makeFoldersArray()
   
        beforeEach('insert folders', () => {
          return db
            .into('folders')
            .insert(testFolders)
        })
        it('GET /folders responds with 200 and all of the folders', () => {
            return supertest(app)
                .get('/api/folders')
                .expect(200, testFolders)
        })
    })
    context(`Given an XSS attack article`, () => {
        const { maliciousFolder, expectedFolder} = makeMaliciousFolder()
  
        beforeEach('insert malicious folder', () => {
              return db
                .into('folders')
                .insert([ maliciousFolder ])
        })
  
        it('removes XSS attack content', () => {
          return supertest(app)
            .get(`/api/folders/${maliciousFolder.id}`)
            .expect(200)
            .expect(res => {
              expect(res.body.name).to.eql(expectedFolder.name)
            })
        })
      })
  })

    describe(`GET /folders/:folder_id`, () => {
        context(`Given no folders`, () => {
            it(`responds with 404`, () => {
                const folderId= 123456
                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .expect(404, { error: {message: `Folder does not exist`} })
            })
        })
        context('Given there are folders in the database', () => {
            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
                return db
                .into('folders')
                .insert(testFolders)
            })

            it('GET /api/folders/:folder_id responds with 200 and specified folder', () => {
                const folderId = 2
                const expectedFolder = testFolders[folderId - 1]
                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .expect(200, expectedFolder)
            })

        })
    })
    describe(`POST /api/folders`, () => {
        it(`creates a folder and responds with 201 and the new folder`, () => {
            const newFolder = {
              name: 'Test Folder'
            }
            return supertest(app)
                .post(`/api/folders`)
                .send(newFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.name).to.eql(newFolder.name)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
                })
                .then(postRes => 
                    supertest(app)
                    .get(`/api/folders/${postRes.body.id}`)
                    .expect(postRes.body)
                    )
        })
    })
    describe(`DELETE /api/folders/:folder_id`, () => {
        context(`Given no folders`, () => {
          it(`responds with 404`, () => {
            const folderId = 123456
            return supertest(app)
              .delete(`/api/folders/${folderId}`)
              .expect(404, { error: { message: `Folder does not exist` } })
          })
        })
    
        context('Given there are folders in the database', () => {
          const testFolders = makeFoldersArray();
    
          beforeEach('insert folder', () => {
            return db
              .into('folders')
              .insert(testFolders)
          })
    
          it('responds with 204 and removes the folder', () => {
            const idToRemove = 2
            const expectedFolders = testFolders.filter(folder => folder.id !== idToRemove)
            return supertest(app)
              .delete(`/api/folders/${idToRemove}`)
              .expect(204)
              .then(res =>
                supertest(app)
                  .get(`/api/folders`)
                  .expect(expectedFolders)
              )
          })
        })
      })
      describe(`PATCH /api/folders/:folder_id`, () => {
        context(`Given no folders`, () => {
          it(`responds with 404`, () => {
            const folderId = 123456
            return supertest(app)
              .delete(`/api/folders/${folderId}`)
              .expect(404, { error: { message: `Folder does not exist` } })
          })
        })
    
        context('Given there are folders in the database', () => {
          const testFolders = makeFoldersArray()
    
          beforeEach('insert folders', () => {
            return db
              .into('folders')
              .insert(testFolders)
          })
    
          it('responds with 204 and updates the folder', () => {
            const idToUpdate = 2
            const updateFolder = {
              name: 'Updated Name'
            }
            const expectedFolder = {
              ...testFolders[idToUpdate - 1],
              ...updateFolder
            }
            return supertest(app)
              .patch(`/api/folders/${idToUpdate}`)
              .send(updateFolder)
              .expect(204)
              .then(res =>
                supertest(app)
                  .get(`/api/folders/${idToUpdate}`)
                  .expect(expectedFolder)
              )
          })
        })
      })
})