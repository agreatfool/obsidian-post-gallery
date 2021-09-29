import * as LibPath from 'path';
import { App, FileSystemAdapter, MarkdownPostProcessorContext, TFile, Vault } from 'obsidian';
import { exec } from 'child_process';
import { nanoid } from 'nanoid';

import * as $ from './gallery/gallery.bundle';
console.log('gallery.bundle.js', $); // this line of code is used to force rollup to embed the sources into bundle

const CONTAINER_ID = 'gallery-container';
const ASSETS_DIR = 'assets';

interface Frontmatter {
  [key: string]: string | number;
  path: string;
}

interface MarkdownBlockArgs {
  name: string; // self-defined gallery name, shall be the folder name under assets
  assetPath: string; // parsed, not original provided in the md block
  // other options details could be found: https://miromannino.github.io/Justified-Gallery/options-and-events/
  rowHeight: number;
  margins: number;
}

export class MarkdownBlockProcessor {
  private static _instance: MarkdownBlockProcessor;
  public static get(): MarkdownBlockProcessor {
    if (!MarkdownBlockProcessor._instance) {
      MarkdownBlockProcessor._instance = new MarkdownBlockProcessor();
    }
    return MarkdownBlockProcessor._instance;
  }

  private _app: App;
  private _vault: Vault;

  public async process(app: App, source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<void> {
    console.log('InPostGalleryPlugin.MarkdownBlockProcessor.process');

    this._app = app;
    this._vault = app.vault;
    const galleryArgs = this._parseMdBlockSource(source, ctx);
    console.log('galleryArgs', galleryArgs);

    const images = this._getGalleryImagesResourcePaths(galleryArgs.assetPath);
    const galleryId = await this._genGalleryHtml(images, el);
    await this._initGallery(galleryId, galleryArgs);
  }

  public async shutdown(): Promise<void> {
    console.log('shutdown');
  }

  private async _genGalleryHtml(imageResourcePaths: string[], root: HTMLElement): Promise<string> {
    const galleryId = this._genGalleryId();
    const createElAsync = async function <K extends keyof HTMLElementTagNameMap>(
      el: HTMLElement,
      tag: K,
      o: DomElementInfo | string,
      callback?: (el: HTMLElementTagNameMap[K]) => void
    ): Promise<HTMLElementTagNameMap[K]> {
      return new Promise((resolve) => {
        el.createEl(tag, o, (el: HTMLElementTagNameMap[K]) => {
          if (callback) {
            callback(el);
          }
          resolve(el);
        });
      });
    };
    const container = await createElAsync(root, 'div', { attr: { id: galleryId } });
    for (const imageResourcePath of imageResourcePaths) {
      const elA = await createElAsync(container, 'a', { attr: { src: imageResourcePath } });
      elA.onClickEvent(async (event: MouseEvent) => {
        if (event.button === 0) {
          // left button
          this._openFile(imageResourcePath);
        }
      });
      await createElAsync(elA, 'img', { attr: { src: imageResourcePath } });
    }
    return galleryId;
  }

  private async _initGallery(galleryId: string, args: MarkdownBlockArgs): Promise<void> {
    const head = document.getElementsByTagName('head')[0];
    return new Promise((resolve) => {
      head.createEl('script', { attr: { type: 'text/javascript' } }, (el: HTMLScriptElement) => {
        el.text = `$("#${galleryId}").justifiedGallery(${JSON.stringify(args)});`;
        resolve();
      });
    });
  }

  private _parseMdBlockSource(source: string, ctx: MarkdownPostProcessorContext): MarkdownBlockArgs {
    const postAssetsPath = LibPath.join((ctx.frontmatter as Frontmatter).path, ASSETS_DIR);
    const rows = source.split('\n').filter((row) => row !== '');

    const data = this._makeDefaultBlockData();

    for (const row of rows) {
      this._parseBlockVal(row, 'name', data);
      this._parseBlockVal(row, 'rowHeight', data);
      this._parseBlockVal(row, 'margins', data);
    }

    let path = LibPath.join(postAssetsPath, data.name);
    if (path.length > 0 && path[0] === '/') {
      // if the path generated start with "/", remove it
      // since vault.getFiles().shift().path has no leading "/"
      path = path.substr(1);
    }
    data.assetPath = path;

    return data;
  }

  private _getGalleryImagesResourcePaths(galleryPath: string): string[] {
    // this will give you all the files in the vault, including md files and sub dir images etc
    // remember the files order is always reversed against the order in the Finder
    const vaultFiles = this._vault.getFiles();

    return vaultFiles
      .filter((file: TFile) => file.path.startsWith(galleryPath))
      .reverse()
      .map((file: TFile) => this._vault.getResourcePath(file));
  }

  private _parseBlockVal(row: string, blockKey: keyof MarkdownBlockArgs, data: MarkdownBlockArgs): void {
    const patternWithoutQuote = new RegExp(`${blockKey}:\\s(.+)`);
    const patternWithQuote = new RegExp(`${blockKey}:\\s"(.+)"`);

    if (row.startsWith(`${blockKey}:`)) {
      const matchedWithoutQuote = row.match(patternWithoutQuote);
      if (matchedWithoutQuote) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data[blockKey] = matchedWithoutQuote[1];
      }
      const matchedQuote = row.match(patternWithQuote);
      if (matchedQuote) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        data[blockKey] = matchedQuote[1];
      }
    }
  }

  private _makeDefaultBlockData(): MarkdownBlockArgs {
    return {
      name: '',
      assetPath: '',
      rowHeight: 240,
      margins: 5
    } as MarkdownBlockArgs;
  }

  private _getVaultPath(): string {
    return (this._vault.getRoot().vault.adapter as FileSystemAdapter).getBasePath();
  }

  private _genGalleryId(): string {
    return `${CONTAINER_ID}-${nanoid(10)}`;
  }

  private _openFile(resourcePath: string): void {
    // "app://local//Users/XXX/Library/Mobile Documents/iCloud~md~obsidian/Documents/plugin_test/20190108-long-test/assets/gallery01/gallery00001.jpeg?1632796390000"
    let path = decodeURIComponent(resourcePath).replace('app://local/', '');
    if (path.includes('?')) {
      path = path.substr(0, path.indexOf('?'));
    }
    exec(`open "${path}"`, (err: Error, stdout: string, stderr: string) => {
      console.log(`open file: "${path}", err: ${err}, stdout: "${stdout}", stderr: "${stderr}"`);
    });
  }
}
