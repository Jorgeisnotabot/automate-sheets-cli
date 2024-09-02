#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program.action(() => {
    console.log('Hello, world!!');
}).description('Prints "Hello, world!!"');

program.parse(process.argv);