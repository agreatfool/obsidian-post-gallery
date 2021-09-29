import { App, MarkdownPostProcessorContext, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { MarkdownBlockProcessor } from './lib/md_block';

export default class InPostGalleryPlugin extends Plugin {
  async onload(): Promise<void> {
    console.log('Loading InPostGalleryPlugin');
    this.registerMarkdownCodeBlockProcessor('post-gallery', async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      await new MarkdownBlockProcessor().process(source, el, this.app.vault, ctx);
    });
  }
}
