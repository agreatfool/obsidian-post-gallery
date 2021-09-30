#!/usr/bin/env node

const LibFs = require('fs');
const LibOs = require('os');
const LibPath = require('path');
const mkdirp = require('mkdirp');
const { Command } = require('commander');
const pkg = require('./package.json');
const program = new Command();
const PLUGIN_NAME = 'obsidian-post-gallery';

program
  .version(pkg.version)
  .description('Obsidian plugin "obsidian-post-gallery" installer, help to install the plugin')
  .requiredOption('-v, --vault <dir>', 'directory of target vault')
  .parse(process.argv);

const options = program.opts();
const CMD_ARGS_VAULT_PATH = options.vault;

class Installer {
  run() {
    this._validate();
    this._process();
  }

  _validate() {
    console.log('Validating ...');
    if (LibOs.platform() !== 'darwin') {
      console.log('Only MacOS supported!');
      process.exit(1);
    }
    if (!LibFs.existsSync(CMD_ARGS_VAULT_PATH) || !LibFs.statSync(CMD_ARGS_VAULT_PATH).isDirectory()) {
      console.log('Invalid vault path specified!');
      process.exit(1);
    }
  }

  _process() {
    // check dir ".obsidian"
    const configPath = LibPath.join(CMD_ARGS_VAULT_PATH, '.obsidian');
    if (!LibFs.existsSync(configPath) || !LibFs.statSync(configPath).isDirectory()) {
      console.log('Vault has no ".obsidian" config folder, exit ...');
      process.exit(1);
    }

    // make plugin dir
    const pluginPath = LibPath.join(configPath, 'plugins', PLUGIN_NAME);
    if (!LibFs.existsSync(pluginPath)) {
      mkdirp.sync(pluginPath);
    }

    // add plugin name into plugins list
    const configFilePath = LibPath.join(configPath, 'community-plugins.json');
    let pluginsList = [];
    if (LibFs.existsSync(configFilePath)) {
      pluginsList = JSON.parse(LibFs.readFileSync(configFilePath).toString());
    }
    if (!pluginsList.includes(PLUGIN_NAME)) {
      pluginsList.push(PLUGIN_NAME);
    }
    LibFs.writeFileSync(configFilePath, JSON.stringify(pluginsList, null, 2));

    // copy plugin files
    const distPath = LibPath.join(__dirname, 'dist');
    for (const file of LibFs.readdirSync(distPath)) {
      if (file === '.DS_Store') {
        continue;
      }
      const source = LibPath.join(distPath, file);
      const dest = LibPath.join(pluginPath, file);
      LibFs.copyFileSync(source, dest);
    }
    console.log('done');
  }
}

new Installer().run();

process.on('uncaughtException', (error) => {
  console.error(`Process on uncaughtException error = ${error.stack}`);
});

process.on('unhandledRejection', (error) => {
  console.error(`Process on unhandledRejection error`, error);
});
