# gallerygrid [![Build Status](https://travis-ci.org/GabLeRoux/gallerygrid.svg?branch=master)](https://travis-ci.org/GabLeRoux/gallerygrid)

**This fork is patched to be compatible with webpack when used with `bower`**
Todo: Find a better way to point to fonts.

Heavily based on http://tympanus.net/codrops/2014/03/21/google-grid-gallery/

Dependencies:
* font-awesome~4.2.0
* lodash~2.4.1
* masonry~3.2.1
* classie~1.0.1
* modernizr~2.8.3
* imagesloaded~3.1.8


## Usage

* include gallerygrid.css and gallerygrid.js
* to create a GalleryGrid instance, first select the gallery element you want to use, then pass it into the GalleryGrid constructor like so: `new GalleryGrid(document.getElementById('grid-gallery'))`

Sample markup:
```jade
#grid-gallery.grid-gallery
    section.grid-wrap
        ul.grid
            li.grid-sizer
            li
                figure
                    img(src='img/thumb/1.png', alt='img01')
                    figcaption
                        h3 Letterpress asymmetrical
                        p Chillwave hoodie ea gentrify aute sriracha consequat.

    section.slideshow
        ul
            li
                figure
                    figcaption
                        h3 Letterpress asymmetrical
                        p Kale chips lomo biodiesel stumptown Godard quis, ullamco craft beer.
                    img(src='img/large/1.png', alt='img01')
        nav
            span.nav-prev.fa.fa-fw.fa-arrow-left
            span.nav-next.fa.fa-fw.fa-arrow-right
            span.nav-close.fa.fa-fw.fa-remove
        .info-keys.icon Navigate with arrow keys
```

## Development

* install yarn
* install dependencies
* See `package.json`'s `scripts`

```bash
yarn
yarn run test
yarn run build
```

## LICENSE

[MIT](LICENSE.md) © [herosheets](https://github.com/herosheets)

