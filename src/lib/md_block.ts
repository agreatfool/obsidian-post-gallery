import * as LibPath from 'path';
import { MarkdownPostProcessorContext, TFile, Vault } from 'obsidian';
import lightGallery from 'lightgallery';
import { v4 as uuidv4 } from 'uuid';

const ASSETS_DIR = 'assets';

interface Frontmatter {
  [key: string]: string | number;
  path: string;
}

export class MarkdownBlockProcessor {
  public async process(source: string, el: HTMLElement, vault: Vault, ctx: MarkdownPostProcessorContext): Promise<void> {
    console.log(source);
    console.log(source.split('\n'));
    console.log(el);
    console.log(ctx);
    this._appendGalleryCss();
    const galleryPath = this._parseMdBlockSource(source, ctx);
    const images = this._getGalleryImages(galleryPath, vault);
    const container = this._genGalleryHtml(images, el);
    this._initLightGallery(container);
  }

  private _appendGalleryCss(): void {
    const cdn = 'https://cdn.bootcdn.net/ajax/libs/lightgallery/2.2.0-beta.3/css/lightgallery-bundle.min.css';
    const head = document.getElementsByTagName('head')[0];
    head.createEl('link', { attr: { href: cdn, type: 'text/css', rel: 'stylesheet' } });
  }

  private _genGalleryHtml(images: string[], root: HTMLElement): HTMLElement {
    const containerId = uuidv4().replace(/-/g, '').toUpperCase();
    const container = root.createEl('div', { cls: 'gallery-container', attr: { id: containerId } });
    for (const image of images) {
      const elA = container.createEl('a', { cls: 'gallery-item', attr: { 'data-src': image } });
      elA.createEl('img', { cls: 'img-responsive', attr: { src: image } });
    }

    return container;
  }

  private _initLightGallery(container: HTMLElement): void {
    console.log('container', container);
    lightGallery(container, {
      licenseKey: '1000-0000-000-0000'
    });
  }

  private _parseMdBlockSource(source: string, ctx: MarkdownPostProcessorContext): string {
    const postAssetsPath = LibPath.join((ctx.frontmatter as Frontmatter).path, ASSETS_DIR);
    const rows = source.split('\n').filter((row) => row !== '');

    let name = ''; // gallery name
    for (const row of rows) {
      if (!row.startsWith('name:')) {
        continue;
      }
      name = row.replace('name:', '').trim();
    }

    let path = LibPath.join(postAssetsPath, name);
    if (path.length > 0 && path[0] === '/') {
      // if the path generated start with "/", remove it
      // since vault.getFiles().shift().path has no leading "/"
      path = path.substr(1);
    }

    return path;
  }

  private _getGalleryImages(galleryPath: string, vault: Vault): string[] {
    // this will give you all the files in the vault, including md files and sub dir images etc
    // remember the files order is always reversed against the order in the Finder
    const vaultFiles = vault.getFiles();
    console.log(vaultFiles);

    return vaultFiles
      .filter((file: TFile) => file.path.startsWith(galleryPath))
      .reverse()
      .map((file: TFile) => vault.getResourcePath(file));
  }
}
