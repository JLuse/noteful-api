const express = require('express')
const xss = require('xss')
const NotesService = require('./notesService')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNote = note => ({
    id: note.id,
    name: xss(note.name),
    folder_id: note.folder_id,
    content: xss(note.content),
    modified: note.modified
  })

notesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
              res.json(notes.map(serializeNote))
            })
            .catch(next)
            //passing next into the .catch from the promise chain so that any errors get handled by our error handler middleware.
      })
      .post(jsonParser, (req, res, next) => {
        const { name, folder_id, content } = req.body
        const newNote = { name, folder_id, content }

        for (const [key, value] of Object.entries(newNote))
        if (value == null)
          return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
          })

        NotesService.insertNotes(
          req.app.get('db'),
          newNote
        )
          .then(note => {
            res
              .status(201)
              .location(`/api/notes/${note.id}`)
              .json(serializeNote(note))
          })
          .catch(next)
      })

notesRouter
      .route('/:note_id')
      .all((req, res, next) => {
        NotesService.getById(
            req.app.get('db'), 
            req.params.note_id
            )
            .then(note => {
              if(!note){
                return res.status(404).json({
                  error: { message: `Note does not exist`}
                })
              }
              res.note = note
              next()
            })
            .catch(next)
      })
      .get((req, res, next) => {
              res.json(serializeNote(res.note))
            })
      .delete((req, res, next) => {
        NotesService.deleteNote(
          req.app.get('db'),
          req.params.note_id
        )
          .then(numRowsAffected => {
            res.status(204).end()
          })
          .catch(next)
      })
      .patch(jsonParser, (req, res, next) => {
        const { name, content } = req.body
        const noteToUpdate = { name, content}
    
        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
          return res.status(400).json({
          error: {
            message: `Request body must contain either 'name' or 'content'`
          }
        })
      }
    
        NotesService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            noteToUpdate
          )
            .then(numRowsAffected => {
              res.status(204).end()
            })
            .catch(next)
        })

module.exports = notesRouter