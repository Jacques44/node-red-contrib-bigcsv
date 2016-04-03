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
   #3 tell what they are doing

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
    
    // CSV Parser parameters as described in http://csv.adaltas.com/parse/
    var csv_options = config;

    // Returns a configured CSV parser based on given configuration (on the fly) or by setup
    var parser = function(config) {
      if (!config) config = csv_options;

      // Special case, if no columns specified, first line is a list of columns by default
      if (! config.columns) config.columns = true;

      return csv.parse(config);
    }

    RED.nodes.createNode(this, config);
    var node = this;

    var nb = 0;

    // Payload message is a file name?
    if (config.is_filename) {

      // CSV livrary used in pipe mode

      // Foreach file name
      this.on('input', function(msg) {

        var options = {}; // pour l'encoding plus tard
        node.status({fill: "blue", shape: "dot", text: "reading " + msg.payload});

        // Records sent so far
        nb = 0;

        // Error management using domain
        var d = domain.create();
        d.on('error', function(err) {
          node.status({fill: "red", shape: "dot", text: err.message });
          node.error(err);
        });

        var p = parser(msg.options);

        // finish function
        var finish = function() {
          p.end();
          node.status({fill: "green", shape: "dot", text: "done with " + nb + " records"});
        };

        // Sender
        var outstream = csv.transform(function(data) {
          if (++nb % config.checkpoint == 0) node.status({fill: "blue", shape: "dot", text: "reading... " + nb + " so far"});
          node.send({ payload: data });
        });        

        // Sender
        var counter = csv.transform(function(data) {
          console.log("top");

          return data;
        });  

        // Go!
        d.run(function() {        
          fs.createReadStream(msg.payload, options)
            .pipe(counter)
            .pipe(p)
            .pipe(outstream)
            .on('finish', finish);               
        });

      })
      
    } else {      

      // Used in stream mode

       // Records sent so far
      var nb;

      var receiver;

      var init = function(options, noready) {

        console.log("New stream");

        // Error management using domain
        var d = domain.create();
        d.on('error', function(err) {
          node.status({fill: "red", shape: "dot", text: err.message });
          node.error(err);
        });

        // Sender
        var outstream = csv.transform(function(data) {
          if (++nb % config.checkpoint == 0) node.status({fill: "blue", shape: "dot", text: "sending... " + nb + " so far"});

          node.send({ payload: data });
        });        

        // Simple tunnel for pipes
        var cat = new stream.Transform({ objectMode: true });
        cat._transform = function(data, encoding, done) {
          if (++nb % config.checkpoint == 0) node.status({fill: "blue", shape: "dot", text: "sending... " + nb + " so far"});

            node.send({ payload: data });

          done();
        };        

        var p = parser(options);
        
        // Go!
        d.run(function() {        
            p
            .pipe(outstream)
            .on('finish', finish);               
        });

        if (!noready) node.status({fill: "blue", shape: "dot", text: "ready !"});

        nb = 0;

        return p;
      }

     // finish function
      var finish = function() {
        node.status({fill: "green", shape: "dot", text: "done with " + nb + " records"});
      };      

      receiver = init();

      // If new message...
      this.on('input', function(msg) {

        if (msg.control) {
          if (msg.control == "start") {
            // A new start...
            if (receiver) receiver.end();
            receiver = init(msg.config);
            return;
          }
          if (msg.control == "end") {
            receiver.end();
            receiver = undefined;
            return;
          }
        }

        if (!receiver) {
          receiver = init();
        }

        receiver.write(msg.payload);
      })

    }

  }

  RED.nodes.registerType("bigcsv", BigCSV);
}
