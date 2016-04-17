# node-red-contrib-biglcsv

"CSV" parser for Big Nodes

![alt tag](https://cloud.githubusercontent.com/assets/18165555/14587338/e2939d76-04b1-11e6-8f70-58620128fda8.png)
![alt tag](https://cloud.githubusercontent.com/assets/18165555/14587341/e5964910-04b1-11e6-8797-b70a6d12504e.png)
![alt tag](https://cloud.githubusercontent.com/assets/18165555/14587342/e79a420c-04b1-11e6-80fb-a3f4b33fa13d.png)

## Installation
```bash
npm install node-red-contrib-bigcsv
```

## Principles for Big Nodes
 
   #1 can handle big data or block mode

   That means, in block mode, not only "one message is a whole file" and able to manage start/end control messages

   #2 send start/end messages as well as statuses

   That means it uses a second output to give control states (start/end/running and error) control messages
 
   #3 tell visually what they are doing

   Visual status on the node tells it's ready/running (blue), all is ok and done (green) or in error (red)

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

	[csv-parse](https://www.npmjs.com/package/csv-parse)
	[biglib](https://www.npmjs.com/package/node-red-biglib)

## Example flow files

  Try pasting in the flow file below that shows the node behaviour 

```json
[{"id":"5c793499.a386cc","type":"bigcsv","z":"cf60aefe.309f5","name":"","filename":"","x":337.5,"y":550,"wires":[[],[]]},{"id":"b0b0578.f4f4fa8","type":"comment","z":"cf60aefe.309f5","name":"Big CSV node sample usage","info":"","x":144,"y":31,"wires":[]},{"id":"da2bdbe4.25d428","type":"inject","z":"cf60aefe.309f5","name":"GO","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"x":404.5,"y":92,"wires":[["83837399.7c7c9"]]},{"id":"83837399.7c7c9","type":"function","z":"cf60aefe.309f5","name":"sample data","func":"msg.control = { state: \"standalone\" }\nmsg.payload = \"Col1,Col2,Col3\\nVal1,\\\"Val\\\"\\\"3\\\"\\\"\\\",Val3\\nThis,is a,\\\"multi\\nline\\\"\\n1,2,2016-01-02\"\nreturn msg;","outputs":1,"noerr":0,"x":564.5,"y":190,"wires":[["d5028068.2afd8"]]},{"id":"c0204178.3fdfc","type":"debug","z":"cf60aefe.309f5","name":"csv object","active":true,"console":"false","complete":"payload","x":866,"y":214,"wires":[]},{"id":"7573e4df.8a8c1c","type":"debug","z":"cf60aefe.309f5","name":"status","active":true,"console":"false","complete":"control","x":854,"y":308,"wires":[]},{"id":"1e457465.e1ba8c","type":"inject","z":"cf60aefe.309f5","name":"GO with parsing","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"x":130,"y":239,"wires":[["236dd58b.dc922a"]]},{"id":"fff60e88.0009f","type":"inject","z":"cf60aefe.309f5","name":"GO with no parsing","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"x":139,"y":337,"wires":[["4807b771.b7f848"]]},{"id":"4807b771.b7f848","type":"function","z":"cf60aefe.309f5","name":"auto_parse=false","func":"msg.config = { auto_parse: false }\nreturn msg;","outputs":1,"noerr":0,"x":340,"y":283,"wires":[["83837399.7c7c9"]]},{"id":"236dd58b.dc922a","type":"function","z":"cf60aefe.309f5","name":"auto_parse=true","func":"msg.config = { auto_parse: true, auto_parse_date: true }\nreturn msg;","outputs":1,"noerr":0,"x":332,"y":190,"wires":[["83837399.7c7c9"]]},{"id":"1aa72d7d.e558d3","type":"comment","z":"cf60aefe.309f5","name":"This node accepts on the fly configuration","info":"","x":183.5,"y":154,"wires":[]},{"id":"278170bb.d87e9","type":"comment","z":"cf60aefe.309f5","name":"3 lines of data with 1 multi line","info":"","x":614,"y":153,"wires":[]},{"id":"46c3865c.b93c78","type":"comment","z":"cf60aefe.309f5","name":"control messages (start, stop, ...)","info":"","x":903,"y":351,"wires":[]},{"id":"c4a81b53.3b57e8","type":"comment","z":"cf60aefe.309f5","name":"One message per line","info":"","x":872,"y":257,"wires":[]},{"id":"83a730d6.7c58d","type":"comment","z":"cf60aefe.309f5","name":"Simple trigger","info":"","x":449,"y":54,"wires":[]},{"id":"71dc7730.8e2388","type":"inject","z":"cf60aefe.309f5","name":"GO with an error","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"x":128,"y":431,"wires":[["38c0fe3c.c73f02"]]},{"id":"38c0fe3c.c73f02","type":"function","z":"cf60aefe.309f5","name":"Non existing file","func":"msg.payload = \"/A/Probably/Non/Existing/File\"\nreturn msg;","outputs":1,"noerr":0,"x":369,"y":431,"wires":[["d5028068.2afd8"]]},{"id":"d5028068.2afd8","type":"bigcsv","z":"cf60aefe.309f5","name":"","filename":"","x":634.5,"y":380,"wires":[["c0204178.3fdfc"],["7573e4df.8a8c1c"]]},{"id":"38e69bd0.c71964","type":"comment","z":"cf60aefe.309f5","name":"See the numbers...","info":"","x":365,"y":226,"wires":[]}]
```

![alt tag](https://cloud.githubusercontent.com/assets/18165555/14587343/ed9e67c8-04b1-11e6-9da5-600e1cda44b7.png)

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


