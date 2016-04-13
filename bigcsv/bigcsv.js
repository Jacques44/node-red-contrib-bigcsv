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
   #2 send start/end messages
   #3 visually tell what they are doing

   Any issues? https://github.com/Jacques44
 
  /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

*/

module.exports = function(RED) {

  var csv = require('csv');
  var biglib = require('node-red-biglib');

  function BigCSV(config) {

    RED.nodes.createNode(this, config);    

    // new instance of biglib for this configuration
    var bignode = new biglib({ config: config, parser: csv.parse, node: this, status: 'records' });

    // biglib changes the configuration to add some properties
    config = bignode.config();

    this.on('input', function(msg) {

      // if no configuration available from the incoming message, a new one is returned, cloned from default
      msg.config = bignode.new_config(msg.config); 

      msg.config.filename = msg.config.filename || msg.filename;
      msg.config.columns = msg.config.columns || true;

      if (msg.config.filename) {

        bignode.stream_file_blocks(msg);
      
      } else {

        bignode.stream_data_blocks(msg);
      
      }
    });

  }

  RED.nodes.registerType("bigcsv", BigCSV);
}


