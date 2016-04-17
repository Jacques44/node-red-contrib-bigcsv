/*
  Copyright (c) 2016 Jacques W.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.

  This a Blue Node!

  /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
 
   Big Nodes principles:
 
   #1 can handle big data
   #2 send status messages on a second output (start, end, running, error)
   #3 visually tell what they are doing (blue: ready/running, green: ok/done, error)

   Any issues? https://github.com/Jacques44
 
  /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

*/

module.exports = function(RED) {

  var biglib = require('node-red-biglib');
  var csv = require('csv');

  function BigCSV(config) {

    RED.nodes.createNode(this, config);    

    // Options the parser will understand
    // See http://csv.adaltas.com/parse/
    var csv_config = {
      "columns": { default: true, validation: function(v) { return v || true } }, 
      "delimiter": undefined, "rowDelimiter": undefined,
      "quote": undefined, "escape": undefined, "comment": undefined, "relax": undefined, "skip_empty_lines": undefined,
      "trim": undefined, "ltrim": undefined, "rtrim": undefined, "auto_parse": undefined, "auto_parse_date": undefined 
    }
    var bignode = new biglib({ config: config, parser: csv.parse, parser_config: csv_config, node: this, status: 'records' });

    // biglib changes the configuration to add some properties
    config = bignode.config();

    this.on('input', bignode.main.bind(bignode));

  }

  RED.nodes.registerType("bigcsv", BigCSV);
}


