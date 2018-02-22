const Wordpress = require('spike-wordpress')
const htmlStandards = require('reshape-standard')
const cssStandards = require('spike-css-standards')
const jsStandards = require('spike-js-standards')
const pageId = require('spike-page-id')
const sugarml = require('sugarml')
const sugarss = require('sugarss')
const env = process.env.SPIKE_ENV
const locals = {}

module.exports = {
  devtool: 'source-map',
  matchers: { html: '*(**/)*.sgr', css: '*(**/)*.sss' },
  ignore: ['**/layout.sgr', '**/_*', '**/.*', 'readme.md', 'yarn.lock'],
  plugins: [
    new Wordpress({
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
          template: {
            path: 'views/article.sgr',
            output: (item) => `posts/${item.slug}.html`
          }
        },
        {
          name: 'features',
          category: 'features',
          order: 'date'
        },
        {
          name: 'blog',
          category: 'blog',
          order: 'date'
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
