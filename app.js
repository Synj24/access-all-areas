const wordpress = require('spike-wordpress')
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
    new wordpress({
      site: 'www.accessaa.co.uk',
      addDataTo: locals,
      posts: [
        {
          name: 'posts',
          number: '10'
        },
        {
          name: 'news',
          category: 'news',
          order: 'date',
          transform: (news) => {
            news.date = moment(news.date).format('LLL')
            return news
          },
          template: {
            path: 'views/article.sgr',
            output: (item) => { return `news/${item.slug}.html` }
          }
        },
        {
          name: 'features',
          category: 'features',
          order: 'date',
          transform: (features) => {
            features.date = moment(features.date).format('LLL')
            features.excerpt = features.excerpt.replace('› Full Story', '')
            return features
          },
          template: {
            path: 'views/article.sgr',
            output: (item) => { return `features/${item.slug}.html` }
          }
        },
        {
          name: 'blog',
          category: 'blog',
          order: 'date',
          transform: (blog) => {
            blog.date = moment(blog.date).format('LLL')
            return blog
          },
          template: {
            path: 'views/article.sgr',
            output: (item) => { return `blogs/${item.slug}.html` }
          }
        }
      ]
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
