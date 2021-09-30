import * as LibOs from 'os';
import { MarkdownPostProcessorContext, Plugin } from 'obsidian';
import { MarkdownBlockProcessor } from './lib/md_block';

export default class InPostGalleryPlugin extends Plugin {
  async onload(): Promise<void> {
    if (LibOs.platform() !== 'darwin') {
      console.log(`InPostGalleryPlugin.onload unsupported platform: ${LibOs.platform()}`);
      return;
    }
    console.log('InPostGalleryPlugin.onload');

    this.registerMarkdownCodeBlockProcessor('post-gallery', async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      await MarkdownBlockProcessor.get().process(this.app, source, el, ctx);
    });
  }

  async onunload(): Promise<void> {
    console.log('InPostGalleryPlugin.onunload');

    await MarkdownBlockProcessor.get().shutdown();
  }
}
