const wordpress = require('spike-wordpress')
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
            return features
          },
          transform: (features) => {
            features.excerpt = features.excerpt.replace('› Full Story', '');
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
