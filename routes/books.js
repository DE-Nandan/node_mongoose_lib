const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const path = require('path')
const fs = require('fs')
const uploadPath = path.join('public',Book.coverImageBasePath)
const Author = require('../models/author')
const multer = require('multer')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest : uploadPath,
    fileFilter : (req,file,callback) =>{
        callback(null,imageMimeTypes.includes(file.mimetype))
    }
    // limits:{fieldSize: 25 * 1024 * 1024}
})
//All Books Route
router.get('/', async (req, res) => {
    let query = Book.find()
    if (req.query.title != null && req.query.title != '') {
      query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
      query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
      query = query.gte('publishDate', req.query.publishedAfter)
    }
   try {
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
    
})

//New Book Route
router.get('/new', async (req, res) => {

    renderNewPage(res,new Book())

    //    try{
//      const authors = await Author.find({})
//      const book = new Book()
//      res.render('books/new', {
//         authors : authors,
//         book:book
//      })
//     }
//    catch{
//      res.redirect('books')
//    }
   
})

//Create Book route
router.post('/',upload.single('cover'), async (req, res) => {
  const fileName =  req.file != null ? req.file.filename : null
    const book =  new Book({
    title : req.body.title,
    author : req.body.author,
    publishDate : new Date(req.body.publishDate),
    pageCount : req.body.pageCount,
    coverImageName : fileName,
    description : req.body.description
   })

   try{
      const newBook = await book.save()
      res.redirect('books')
    }
   catch{
    if(book.coverImageName != null){
   
        removeBookCover(book.coverImageName)    
    }
    renderNewPage(res,book,true) 
   }
})

function removeBookCover(fileName)
{
   // console.log(fileName)
    fs.unlink(path.join(uploadPath,fileName),(err => {
        if(err) console.log(hello + err);
    }))
    // fs.unlink(path.join(upload,fileName), err => {
    //     console.log("jhgjggj hihg hrioh")
    //     if(err) console.log(err)
    // })
}

async function renderNewPage(res,book,hasError = false){
    try{
        const authors = await Author.find({})
        const book = new Book()
        const params = {
            authors : authors,
            book:book
        }

        if(hasError) params.errorMessage = 'Eror Creating A book'
        res.render('books/new', params)
       }
      catch (err){
        console.log(err);
        res.redirect('books')
      }
}

module.exports = router