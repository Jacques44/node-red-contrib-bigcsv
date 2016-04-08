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
  var fs = require('fs');
  var domain = require('domain');
  var stream = require('stream');

  function BigCSV(config) {

    config.checkpoint = 100;   
    var parser_stream = csv.parse;    
    
    // CSV Parser parameters as described in http://csv.adaltas.com/parse/
    var def_config = config;

    RED.nodes.createNode(this, config);
    var node = this;


    /*********************************************/

    var running = false;

    var runtime_control = {
      config: Object.create(def_config)
    }
    delete runtime_control.config.wires;
    delete runtime_control.config.x;
    delete runtime_control.config.y;
    delete runtime_control.config.z;

    // Require stream to close
    var close_stream = function(input) {
      if (input) input.end();
      return;
    }

    var ready = function() {
      node.status({fill: "blue", shape: "dot", text: "ready !"});
    }

    // Principe #2, end message on output #2
    var on_finish = function(err) {

      runtime_control.state = "end";
      runtime_control.end = new Date();

      if (err) {
        runtime_control.state = "error";
        runtime_control.error = err;
        node.status({fill: "red", shape: "dot", text: err.message });
      } else {
        node.status({fill: "green", shape: "dot", text: "done with " + runtime_control.records + " records" });
      }

      node.send([undefined, { control: runtime_control }]);

      running = false;

      if (err) node.error(err);
    }

    var on_start = function(config, control) {

      runtime_control.records = runtime_control.size = 0;
      runtime_control.start = new Date();
      runtime_control.control = control;  // parent control message
      runtime_control.config = config;
      delete runtime_control.end;
      runtime_control.state = "start";      

      node.send([undefined, { control: runtime_control }]);   

      running = true; 
    }

    var out_stream = function(my_config) {
      // 2. Sender
      var outstream = new stream.Transform({ objectMode: true });
      outstream._transform = function(data, encoding, done) {

        // #3 big node principle: tell me what you are doing, so far
        if (++runtime_control.records % runtime_control.config.checkpoint == 0) node.status({fill: "blue", shape: "dot", text: "sending... " + runtime_control.records + " records so far"});

        // #1 big node principle: send blocks for big files management
        node.send([{ payload: data }]);

        done();
      }      
      return outstream;
    }

    var d;

    // control is an incoming control message { control: {}, config: {} }
    var create_stream = function(msg, in_stream, last) {

      var my_config = (msg || {}).config || def_config;

      var input;
      var output;

      // Error management using domain
      // Everything linked together with error management
      // Cf documentation
      // Run the supplied function in the context of the domain, implicitly binding all event emitters, timers, and lowlevel requests that are created in that context
      domain.create().on('error', on_finish).run(function() {
        (output = (input = in_stream(my_config))
        .pipe(parser_stream(my_config))
        .pipe(out_stream(my_config))
        .on('finish', on_finish))
      });

      // Big node status and statistics
      on_start(my_config, msg.control);

      // Return is the entry point for incoming data
      return { input: input, output: output };
    }

    // Specific for this node

    var has_data = function(msg) {
      return msg.payload || msg.filename;
    }

    var size_stream = function() {
      // Streams are created in the scope of domain (very very important)
      var size_stream = new stream.Transform({ objectMode: true });
      size_stream._transform = function(data, encoding, done) {
        runtime_control.size += data.length;
        this.push(data);
        done();
      }      
      return size_stream;
    }

    var fs_stream = function(my_config) {
      return fs.createReadStream(my_config.filename, my_config);
    }    

    var file_stream = function() {

      var stack = [];

      return function(msg) {

        var next = function() {
          var msg = stack.pop();
          if (msg) create(msg);
        }

        var create = function(msg) {
          create_stream(msg, fs_stream, true).output.on('finish', next);
        }

        if (running) { 
          stack.push(msg);
        } else {
          create(msg);
        }
      }   

    }();

    var data_stream = function() {

      var input_stream;

      return function(msg) {

        var my_stream = size_stream;

        if (msg.control && msg.control.state == "start") {
          input_stream = close_stream(input_stream);

          ready();

          if (msg.config) input_stream = create_stream(msg, my_stream).input;
        }

        if (has_data(msg)) {
          if (! input_stream) input_stream = create_stream(msg, my_stream).input;

          input_stream.write(msg.payload);
        }

        if (msg.control && msg.control.state == "end") {
          runtime_control.control = msg.control;    // Parent control message

          input_stream = close_stream(input_stream);
        }  
      };

    }();

    /****************************************************************/    

    var validate_config = function(config) {
      config.columns = config.columns || true;
      config.checkpoint = 100;
      return config;
    }
    validate_config(def_config);

    this.on('input', function(msg) {

      if (config.is_filename) {

        if (! msg.config) msg.config = Object.create(def_config);      
        msg.config.filename = msg.config.filename || msg.payload || msg.filename;

        validate_config(msg.config);

        file_stream(msg);
      
      } else {

        data_stream(msg);
      
      }
    });

  }

  RED.nodes.registerType("bigcsv", BigCSV);
}
