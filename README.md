# obsidian-post-gallery

## Pre-conditions

- This plugin only supports `OSX`
- Post need to have `frontmatter`, and front matter need to contain `path`, the relative path to your vault
- Post's dir need to contain the folder `assets`
- Pictures which would be displayed in the gallery need to be put in one folder under the `assets`
    - `/${path}/assets/gallery00`
    - `/${path}/assets/gallery01`

**frontmatter example**

```yaml
---
uuid: "6CF41F914BCB4B43B2665684DF81E08C"
path: "/album-test-post"
date: "2019-01-08"
slug: "album-test-post"
title: "Album test post"
---
```

## How to use

**Install**

```bash
$ yarn global add @agreatfool/obsidian-post-gallery
$ obsidian-post-gallery-install -v ${your_vault_path}
```

**Reopen your obsidian**

- Edit the post, add frontmatter as described above
- Put images under the folder as described above
- Edit the post, add `post-gallery` block

**Example**

`````
Only gallery name specified, others use default value (rowHeight: 240, margins: 5):

```post-gallery
name: gallery00
```
`````

![](./doc/images/ScreenShot_2021-09-30%2020.12.52.png)

`````
Specified the "rowHeight" as 120, and "margins" between images as 10

```post-gallery
name: gallery00
rowHeight: 120
margins: 10
```
`````

![](./doc/images/ScreenShot_2021-09-30%2020.13.22.png)

Click the image in the gallery would open the OSX default preview app

![](./doc/images/ScreenShot_2021-09-30%2020.16.35.png)

## Others
### Credits

This plugin is using [Justified Gallery](https://miromannino.github.io/Justified-Gallery/)

### install.js

```bash
$ obsidian-post-gallery-install -h
Usage: install [options]

Obsidian plugin "obsidian-post-gallery" installer, help to install the plugin

Options:
  -V, --version      output the version number
  -v, --vault <dir>  directory of target vault
  -h, --help         display help for command
```

### How to build & publish

```bash
$ npm run dev
$ git add .
$ git commit -m "..."
$ npm version patch
$ npm publish
$ git push origin master --verbose
```
