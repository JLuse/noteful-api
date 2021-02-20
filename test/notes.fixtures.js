function makeNotesArray() {
    return [
        {
            id: 1,
            name: 'First test note!',
            modified: '2021-01-16T15:41:12.239Z',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            folder_id: 1
          },
          {
            id: 2,
            name: 'Second test note!',
            modified: '2021-01-16T15:41:12.239Z',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            folder_id: 2
          },
          {
            id: 3,
            name: 'Third test note!',
            modified: '2021-01-16T15:41:12.239Z',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            folder_id: 3
        },
          {
            id: 4,
            name: 'Fourth test note!',
            modified: '2021-01-16T15:41:12.239Z',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            folder_id: 2
        },
          {
            id: 5,
            name: 'Fifth test note!',
            modified: '2021-01-16T15:41:12.239Z',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            folder_id: 1
        },
    ]
}

function makeMaliciousNote() {
    const maliciousNote = {
        id: 911,
        modified: new Date().toISOString(),
        name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        folder_id: 1
       
    }
      const expectedNote = {
        ...maliciousNote,
        name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
       
      }
      return {
        maliciousNote,
        expectedNote,
      }
}

module.exports = { makeNotesArray, makeMaliciousNote }