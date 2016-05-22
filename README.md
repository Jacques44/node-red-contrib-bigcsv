# node-red-contrib-bigcsv

"CSV" parser for node-red. Original work by IBM dosnt' fit my needs. Buggy with multi-line and no huge file support. Here is a version working with a state for the art library (csv-parse) and working with my bigfile library

![alt tag](https://cloud.githubusercontent.com/assets/18165555/15456092/888aa0c4-2066-11e6-8224-4ec7fc8919f7.png)

![alt tag](https://cloud.githubusercontent.com/assets/18165555/15456091/859c4570-2066-11e6-810d-ec72797ac7ea.png)

## Installation
```bash
npm install node-red-contrib-bigcsv
```

Known issue: work with node v4

Core provides a CSV parser. This one is able to parse multi-line.

## Principles for Big Nodes

See [biglib](https://www.npmjs.com/package/node-red-biglib) for details on Big Nodes.
`Big Lib` and subsequent `Big Nodes` are a family of nodes built for my own purpose. They are all designed to help me build a complete process for **production purposes**. For that I needed nodes able to:

* Flow **big volume** of data (memory control, work with buffers)
* Work with *a flow of blocks* (buffers) (multiple payload within a single job)
* Tell what *they are doing* with extended use of statuses (color/message)
* Use their *second output for flow control* (start/stop/running/status)
* *Reuse messages* in order to propagate _msgid, topic
* Depends on **state of the art** libraries for parsing (csv, xml, xlsxs, line, ...)
* Acts as **filters by default** (1 payload = 1 action) or **data generators** (block flow)

All functionnalities are built under a library named `biglib` and all `Big Nodes` rely on it

## Usages

Big CSV is a filter node for node-red to transform data into csv objects, one message per line. It uses the "csv-parse" library

It works as a filter node that means it takes in the output of a "big file" node or any block node. It's able to read a file by itself to send lines

It has several options as csv-parse offers them: (see http://csv.adaltas.com/parse/)

- delimiter (default comma)
- rowDelimiter (default unix)
- quote (default double quotes)
- escape
- columns
- comment
- relax
- skip_empty_lines
- trim (default)
- ltrim (default false)
- rtrim (default false)
- auto_parse
- auto_parse_date

## Dependencies

[csv-parse](https://www.npmjs.com/package/csv-parse) CSV parsing implementing the Node.js stream.Transform API

[biglib](https://www.npmjs.com/package/node-red-biglib) library for building node-red flows that supports blocks, high volume

## Example flow files

Try pasting in the flow file below that shows the node behaviour 

```json
[{"id":"9c1f18d5.63e0e8","type":"comment","z":"b4b0c2a3.4b4f4","name":"Big CSV node sample usage","info":"","x":146.5,"y":41,"wires":[]},{"id":"d3cf8795.2c3078","type":"inject","z":"b4b0c2a3.4b4f4","name":"GO","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"x":410,"y":100,"wires":[["c7e57a1f.381a88"]]},{"id":"c7e57a1f.381a88","type":"function","z":"b4b0c2a3.4b4f4","name":"sample data","func":"msg.payload = \"Col1,Col2,Col3\\nVal1,\\\"Val\\\"\\\"3\\\"\\\"\\\",Val3\\nThis,is a,\\\"multi\\nline\\\"\\n1,2,2016-01-02\"\nreturn msg;","outputs":1,"noerr":0,"x":590,"y":200,"wires":[["819bdae5.7e6428"]]},{"id":"bcabd332.43543","type":"debug","z":"b4b0c2a3.4b4f4","name":"csv object","active":true,"console":"false","complete":"payload","x":970,"y":260,"wires":[]},{"id":"a780465.f587fb8","type":"debug","z":"b4b0c2a3.4b4f4","name":"status","active":true,"console":"false","complete":"control","x":950,"y":360,"wires":[]},{"id":"83781490.7c87e8","type":"inject","z":"b4b0c2a3.4b4f4","name":"GO with parsing","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"x":140,"y":240,"wires":[["279f5508.d860aa"]]},{"id":"5071718b.af8e9","type":"inject","z":"b4b0c2a3.4b4f4","name":"GO with no parsing","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"x":150,"y":340,"wires":[["9ab9cd9c.65463"]]},{"id":"9ab9cd9c.65463","type":"function","z":"b4b0c2a3.4b4f4","name":"auto_parse=false","func":"msg.config = { auto_parse: false }\nreturn msg;","outputs":1,"noerr":0,"x":370,"y":300,"wires":[["c7e57a1f.381a88"]]},{"id":"279f5508.d860aa","type":"function","z":"b4b0c2a3.4b4f4","name":"auto_parse=true","func":"msg.config = { auto_parse: true, auto_parse_date: true }\nreturn msg;","outputs":1,"noerr":0,"x":334.5,"y":200,"wires":[["c7e57a1f.381a88"]]},{"id":"aae3d444.551c28","type":"comment","z":"b4b0c2a3.4b4f4","name":"This node accepts on the fly configuration","info":"","x":186,"y":164,"wires":[]},{"id":"8a707fdb.758f8","type":"comment","z":"b4b0c2a3.4b4f4","name":"3 lines of data with 1 multi line","info":"","x":640,"y":160,"wires":[]},{"id":"4b231890.b4dce8","type":"comment","z":"b4b0c2a3.4b4f4","name":"control messages (start, stop, ...)","info":"","x":1030,"y":400,"wires":[]},{"id":"1205b30.fedfa4d","type":"comment","z":"b4b0c2a3.4b4f4","name":"One message per line","info":"","x":1000,"y":220,"wires":[]},{"id":"506c748b.af938c","type":"comment","z":"b4b0c2a3.4b4f4","name":"Simple trigger","info":"","x":430,"y":60,"wires":[]},{"id":"16b73073.e948d","type":"inject","z":"b4b0c2a3.4b4f4","name":"GO with an error","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"x":140,"y":400,"wires":[["e2c2d0e9.1d3d3"]]},{"id":"e2c2d0e9.1d3d3","type":"function","z":"b4b0c2a3.4b4f4","name":"Non existing file","func":"msg.filename = \"/A/Probably/Non/Existing/File\"\nreturn msg;","outputs":1,"noerr":0,"x":580,"y":400,"wires":[["819bdae5.7e6428"]]},{"id":"819bdae5.7e6428","type":"bigcsv","z":"b4b0c2a3.4b4f4","name":"","filename":"","x":780,"y":300,"wires":[["bcabd332.43543"],["a780465.f587fb8"]]},{"id":"50fc0dc5.af03f4","type":"comment","z":"b4b0c2a3.4b4f4","name":"See the numbers...","info":"","x":367.5,"y":236,"wires":[]}]
```

![alt tag](https://cloud.githubusercontent.com/assets/18165555/15456089/814f384c-2066-11e6-9542-7fa04b409aca.png)

## Author

  - Jacques W

## License

This code is Open Source under an Apache 2 License.

You may not use this code except in compliance with the License. You may obtain an original copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Please see the
License for the specific language governing permissions and limitations under the License.

## Feedback and Support

Please report any issues or suggestions via the [Github Issues list for this repository](https://github.com/Jacques44/node-red-contrib-bigline/issues).

For more information, feedback, or community support see the Node-Red Google groups forum at https://groups.google.com/forum/#!forum/node-red


