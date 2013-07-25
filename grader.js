#!/usr/bin/env node
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var rest = require('restler');

var assertFileExists = function (infile){
var instr = infile.toString();
var sys = require('util');    
if(!fs.existsSync(instr)){
    console.log("%s does not exist. Exiting.",instr);
    process.exit(1);
    }
    return instr; 

 
};

var cheerioHtmlFile = function(htmlfile){
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile){
    return JSON.parse(fs.readFileSync(checksfile));
};

var parseUrl = function(url,checksfile){
    rest.get(url).on('complete',function(result){
	if( result instanceof Error){
	    console.log('Bad URL !!!!');
	}else{
	    fs.writeFileSync('test.html',result);
	    var checksJson = checkHtmlFile('test.html',checksfile);
	    var outJson = JSON.stringify(checksJson, null, 4);
	    fs.writeFileSync('output.json',outJson);
	    console.log(outJson);
    	}    
    }		     
		     
)};

var checkHtmlFile = function(htmlfile,checksfile){
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
  };
    return out;

};



var clone = function(fn){
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u --url <url>', 'Path to url' )
        .parse(process.argv);
    
    var checksJson ;
    if(program.url){
	console.log('Url exists');
	parseUrl(program.url,program.checks);
    }else{
	checksJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checksJson,null,4);
	console.log(outJson);
	
    }	
   } else {
    exports.checkHtmlFile = checkHtmlFile;
}

