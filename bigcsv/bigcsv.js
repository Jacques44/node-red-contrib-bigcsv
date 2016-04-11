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

var csv = require('csv');
var biglib = require('node-red-biglib');

module.exports = function(RED) {

  function BigCSV(config) {

    // 1. config is coming from RED with user wishes
    // 2. config is validated through biglib
    // 3. config has a local validation function
    var validate_config = function(config) {
      config.columns = config.columns || true;
      return config;
    }

    // bigcsv validations
    validate_config(config);

    // new instance of biglib for this configuration
    var bignode = new biglib({ config: config, parser: csv.parse, node: this });

    // biglib changes the configuration to add some properties
    config = bignode.config();

    RED.nodes.createNode(this, config);

    this.on('input', function(msg) {

      if (config.is_filename) {

        // if no configuration available from the incoming message, a new one is returned, cloned from default
        msg.config = bignode.new_config(msg.config);  
        msg.config.filename = msg.config.filename || msg.payload || msg.filename;

        // bigcsv validations
        validate_config(msg.config);

        bignode.file_stream(msg);
      
      } else {

        bignode.data_stream(msg);
      
      }
    });

  }

  RED.nodes.registerType("bigcsv", BigCSV);
}


