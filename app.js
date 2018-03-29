require('dotenv').config();
const _ = require('lodash');
const fetch = require('node-fetch')
const Records = require('spike-records')
const contentful = require('spike-contentful')
const htmlStandards = require('reshape-standard')
const cssStandards = require('spike-css-standards')
const jsStandards = require('spike-js-standards')
const pageId = require('spike-page-id')
const sugarml = require('sugarml')
const sugarss = require('sugarss')
const moment = require('moment')
const env = process.env.SPIKE_ENV
const locals = {}

function getPostsOfType(category) {
  return new Promise((resolve, reject) => {
    const getData = (category, number = 0, page = 0) =>
      fetch(`https://public-api.wordpress.com/rest/v1/sites/www.accessaa.co.uk/posts?category=${category}&number=${number}&page=${page}&order_by=date`)
        .then(res => res.json())

    const found = (category) => getData(category).then(json => json.found);

    found(category)
      .then((value) => {
          return Math.ceil(value/100);
      })
      .then((callsToMake) => {
          let tasks = [];
          for (i = 0; i < callsToMake; i++) {
              tasks.push(getData(category, 100, i)) //<--- Fill tasks array with promises that will eventually return a value
          }
          return Promise.all(tasks); //<-- Run these tasks in parallel and return an array of the resolved values of the N Promises.
      })
      .then((arrOfPosts) => {
          let allPosts = [];
          for(var elem of arrOfPosts)
              allPosts = allPosts.concat(elem.posts);
          return resolve(_.uniqWith(allPosts, _.isEqual));// this isn't working as expected :(
      }).catch((err) => {
          console.log(err);
          reject(err);
      })
  })
}

module.exports = {
  devtool: 'source-map',
  matchers: { html: '*(**/)*.sgr', css: '*(**/)*.sss' },
  ignore: [ '**/layout.sgr', '**/_*', '**/.*', 'readme.md', 'yarn.lock'],
  plugins: [
    new Records({
      addDataTo: locals,
      news: {
        callback: getPostsOfType.bind(this, 'news'), //'https://public-api.wordpress.com/rest/v1/sites/www.accessaa.co.uk/posts?number=100&category=news&order_by=date',
        transform: (news) => {
          news.forEach( element => {
            element.content = element.content.replace(/[^ -~]+/g, "")
            element.date = moment(element.date).format('LLL')
            return element
          })
          return news
        },
        template: {
          path: 'views/article.sgr',
          output: (news) => { return `news/${news.slug}.html`}
        }
      },
      features: {
        callback: getPostsOfType.bind(this, 'features'), //'https://public-api.wordpress.com/rest/v1/sites/www.accessaa.co.uk/posts?number=100&category=features&order_by=date',
        transform: (features) => {
          features.forEach( element => {
            element.content = element.content.replace(/[^ -~]+/g, "")
            element.date = moment(element.date).format('LLL')
            element.excerpt = element.excerpt.replace('› Full Story', '')
            return element
          })
          return features
        },
        template: {
          path: 'views/article.sgr',
          output: (features) => { return `features/${features.slug}.html`}
        }
      },
      blogs: {
        callback: getPostsOfType.bind(this, 'blog'), //'https://public-api.wordpress.com/rest/v1/sites/www.accessaa.co.uk/posts?number=12&category=blog&order_by=date',
        transform: (blogs) => {
          blogs.forEach( element => {
            element.content = element.content.replace(/[^ -~]+/g, "")
            element.date = moment(element.date).format('LLL')
            return element
          })
          return blogs
        },
        template: {
          path: 'views/article.sgr',
          output: (blogs) => { return `blogs/${blogs.slug}.html`}
        }
      }
    }),
    new contentful({
      addDataTo: locals,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
      spaceId: 'xb19obi155ii',
      contentTypes: [{
        name: 'issues',
        id: 'issues',
        filters: {
          limit: 12,
          order: '-sys.createdAt'
        },
        transform: (issues) => {
          issues.fields.publicationDate = moment(issues.fields.publicationDate).format('MMMM YYYY')
          return issues
        }
      }]
    })
  ],
  reshape: htmlStandards({
    root: 'views',
    parser: sugarml,
    locals: (ctx) => Object.assign(locals, {pageId: pageId(ctx), foo: 'bar' }),
    // minifying html is breaking whitespace in footer
    // minify: env === 'production'
  }),
  postcss: cssStandards({
    parser: sugarss,
    minify: env === 'production',
    warnForDuplicates: env !== 'production'
  }),
  babel: jsStandards()
}
