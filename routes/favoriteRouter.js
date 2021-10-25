const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');

const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();




favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Favorite.find({
        user: req.user_.id
    })
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findById({
        user: req.user._id
    })
    .then(favorite => {
        if (favorite) {
            if (favorite.campsites.indexOf(favorite._id) === -1) {
                favorite.campsites.push(favorite._id)
                }
                favorite.save()
                    .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                    })
                    .catch(err => next(err));
                }
                else {
                Favorite.create({
                    user: req.user._id,
                    campsites: req.body
                })
                .then(favorite => {
                    console.log('Favorite Created ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            }
        })
    .catch(err => next(err));
})
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
      res.statusCode = 403;
      res.end(`PUT operation nt supported on /favorites`);
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
      Favorite.findOneAndRemove({user: req.user._id})
      .then(favorites => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res/semd('Favortes has been deleted.');
      })
  })





favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end (`GEt operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id}) 
    .then(favorites => {
      if (favorites) {   
        if (favorites.campsites.includes(req.params.campsiteId)) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.send('Campsite already in your favorites.');
        } else { 
          favorites.campsites.push(req.params.campsiteId);
          favorites.save()
          .then(favorites => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
          })
        }
        } else {
          Favorite.create({user: req.user._id, campsites: req.body})
          .then(favorite => {
            console.log('Favorite added', favorite);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          })
        } 
    })
    .catch(err => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
      Favorite.findByIdAndDelete(req.params.favoriteId)
      .then(response => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(response);
      })
      .catch(err => next(err));
  });
  
  
  
  module.exports = favoriteRouter;
