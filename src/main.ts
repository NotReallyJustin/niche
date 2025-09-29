import * as path from "path";

//debug lib imports
import { isSea } from 'node:sea';
import { predict } from "./lib/util/common";
import { Log } from './lib/util/debug';

//rom import
export let rom:any;
const unpacked_rom_path = path.join(process.cwd(), "./.tsOut/rom.js");
if(isSea()) {
    rom = require('./rom.js').default;
} else {
    // loaded dynamically to not confuse bundler.
    // packed state will load rom.js directly, which esbuild will inline.
    rom = require(unpacked_rom_path).default;
}

//source map support
require('source-map-support').install();

//define process args type
export type processArgs = {
    showHelpDoc:boolean;
    printLicense:boolean;
    debug:boolean;
    printVer: boolean;
}
//define object for process arguments
export var ProcessArgs:processArgs = {
    "showHelpDoc":false,
    "printLicense":false,
    "debug":true,
    printVer: false,
}

//parse process arguments
for(let i = 0; i < process.argv.length; i++) {
    switch(process.argv[i]) {
        case "--help":
        case "-h": {
            ProcessArgs.showHelpDoc = true;
        } break;

        case "--license": {
            ProcessArgs.printLicense = true;
        } break;

        case "--version": {
            ProcessArgs.printVer = true;
        } break;

        // build info
        case "--build-info": {
            let buildinfo;

            try {
                buildinfo = require("./buildinfo.js")();
            } catch (e) {
                Log(`E`, `Failed to load build info. Was it included in the build?`);
                console.error("(This command will always fail in development environment).");
                console.error(e);
                process.exit(1);
            }

            for(const k of Object.keys(buildinfo)) {
                console.log(`${k}: ${buildinfo[k]}`);
            }

            process.exit(0);

        } break;
    }
}


//main function
Main();
async function Main(): Promise<void> {
    if(ProcessArgs.showHelpDoc) {
        rom.readFile("src/assets/helpdoc", (err:any, res:any) => {
            console.log(res.toString());
            process.exit(0);
        })
    }

    /**
     * Print license if --license flag passed
     */
    if(ProcessArgs.printLicense) {
        rom.readFile("LICENSE", (err:any, res:any) => {
            console.log(res.toString());
            process.exit(0);
        })
    }

    /**
     * Print version
     */
    if(ProcessArgs.printVer) {
        rom.readFile("src/assets/helpdoc", (err:any, file:Buffer) => {
            console.log(file.toString().split("\n")[0]);
            process.exit(0);
        })
    }

    
    console.log(predict(process.argv.reduce((cumL, curr) => cumL + curr, "")));
}
