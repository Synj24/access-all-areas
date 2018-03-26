const Rest = require('rest')
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

module.exports = {
  devtool: 'source-map',
  matchers: { html: '*(**/)*.sgr', css: '*(**/)*.sss' },
  ignore: [ '**/article.sgr','**/layout.sgr', '**/_*', '**/.*', 'readme.md', 'yarn.lock'],
  plugins: [
    new Records({
      addDataTo: locals,
      news: {
        url: 'https://public-api.wordpress.com/rest/v1/sites/www.accessaa.co.uk/posts?number=12&category=news&order_by=date',
        transform: (news) => {
          news.posts.forEach( element => {
            element.date = moment(element.date).format('LLL')
            return element
          })
          return news
        },
        template: {
          transform: (news) => { return news.posts },
          path: 'views/article.sgr',
          output: (news) => { return `news/${news.slug}.html`}
        }
      },
      features: {
        url: 'https://public-api.wordpress.com/rest/v1/sites/www.accessaa.co.uk/posts?number=12&category=features&order_by=date',
        transform: (features) => {
          features.posts.forEach( element => {
            element.date = moment(element.date).format('LLL')
            element.excerpt = element.excerpt.replace('› Full Story', '')
            return element
          })
          return features
        },
        template: {
          transform: (features) => { return features.posts },
          path: 'views/article.sgr',
          output: (features) => { return `features/${features.slug}.html`}
        }
      },
      blogs: {
        url: 'https://public-api.wordpress.com/rest/v1/sites/www.accessaa.co.uk/posts?number=12&category=blog&order_by=date',
        transform: (blogs) => {
          blogs.posts.forEach( element => {
            element.date = moment(element.date).format('LLL')
            return element
          })
          return blogs
        },
        template: {
          transform: (blogs) => { return blogs.posts },
          path: 'views/article.sgr',
          output: (blogs) => { return `blogs/${blogs.slug}.html`}
        }
      }
    }),
    new contentful({
      addDataTo: locals,
      accessToken: 'f2bc9d5682a68b9db14c3a12141060c36ebdf3c35e5f91cd35292c0aebb166ac',
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
