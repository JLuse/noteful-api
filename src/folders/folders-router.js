const express = require('express')
const xss = require('xss')
const FoldersService = require('./foldersService')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
    id: folder.id,
    name: xss(folder.name)
  })

foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
              res.json(folders.map(serializeFolder))
            })
            .catch(next)
            //passing next into the .catch from the promise chain so that any errors get handled by our error handler middleware.
      })
      .post(jsonParser, (req, res, next) => {
        const { name} = req.body
        const newFolder = { name }
        FoldersService.insertFolders(
          req.app.get('db'),
          newFolder
        )
          .then(folder => {
            res
              .status(201)
              .location(`/api/folders/${folder.id}`)
              .json(serializeFolder(folder))
          })
          .catch(next)
      })

foldersRouter
      .route('/:folder_id')
      .all((req, res, next) => {
        FoldersService.getById(
            req.app.get('db'), 
            req.params.folder_id
            )
            .then(folder => {
              if(!folder){
                return res.status(404).json({
                  error: { message: `Folder does not exist`}
                })
              }
              res.folder = folder
              next()
            })
            .catch(next)
      })
      .get((req, res, next) => {
            res.json(serializeFolder(res.folder))
        })
      .delete((req, res, next) => {
        FoldersService.deleteFolder(
          req.app.get('db'),
          req.params.folder_id
        )
          .then(numRowsAffected => {
            res.status(204).end()
          })
          .catch(next)
      })
      .patch(jsonParser, (req, res, next) => {
        const { name } = req.body
        const folderToUpdate = { name }
    
        const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
          return res.status(400).json({
          error: {
            message: `Request body must contain 'name'`
          }
        })
      }
    
       FoldersService.updateFolder(
            req.app.get('db'),
            req.params.folder_id,
            folderToUpdate
          )
            .then(numRowsAffected => {
              res.status(204).end()
            })
            .catch(next)
        })

module.exports = foldersRouter