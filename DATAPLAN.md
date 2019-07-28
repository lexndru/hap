# Data Planning Specification

The notion of "data planning" is used to describe the complete cycle of working with data, starting with the activity of gathering valuable information from certain documents and arrange the data into structured sets, and concluding with the presentation and long-term storage of the respective data. The process of gathering can be defined step-by-step with simple instructions and the final output can be converted into a more appropriate format for what it represents.

The notion of "dataplan" is used to describe a proposal specification to achieve this previous statement. In a dataplan context, there are two modules to work with: declarations and definitions. Both modules are required by a dataplan and each module has its own protocol.

The `declare` protocol is applied by the *declaration* module. A dataplan must have only one `declare` instance of the declaration module. Once set, it cannot be changed. The protocol requires a dictionary-like map of all exportable fields. Each field is defined as a key-value pair where the *key* is an unique name of the exported field and the *value* is the corresponding data type of the field. E.g. an "age" field could have the key "age" and the value "integer" or an "email" field could have the value "string".

The table below describes all supported data types by the declaration module.

Alias | Description
----- | -----------
`decimal` | Precision correctly-rounded floating point
`string`, `text` | Any sequence of characters including empty spaces
`integer` | Numeric values up to 2^63 - 1
`ascii` | ASCII only strings (only if you know what you're doing)
`bytes` | Raw sequence of bytes (only if you know what you're doing)
`percentage` | Floating point number with up to 53 bits of precision
`boolean` | Represent truth value of an expression

The `define` protocol is applied by the *definition* module and a dataplan must have only one `define` instance of the definition module. Analogue, once the definition module is set, it cannot be changed. The protocol requires an ordered list of dictionary-like maps as definitions. Each definition is represented as a key-value pair where the *key* must be string representing a variable and the *value* is a set of instructions.

Variables can be exported if they are "declared" by the `declare` protocol. A variable either is directly assigned to a value or evaluates an ordered list of instructions. A direct assignment takes a string and allocates it to the respective variable. An evaluation runs through all instructions step-by-step. The evaluation must have at least one instruction.

An instruction is a dictionary-like map represented by a key-value pair where the *key* is a directive and the *value* is the input parameters. The result of the evaluated directive steps ahead to the next instruction until it reaches the end, concluding with an indirect assignment to the variable owning this set of instructions.

The table below describes all supported directives by the definitions module.

Directive | Arguments | Description | Sample
--------- | --------- | ----------- | ------
`query_css` | (string) CSS selector | Return result of evaluated CSS selector | `{"query_css": "h1.title"}`
`query_xpath` | (string) XPath expression | Return result of evaluated XPath expression | `{"query_xpath": "//h1[@class='title']"}`
`query` | (string) CSS selector | Alias of `query_css` | `{"query_css": "body > div > a.active"}`
`pattern` | (string) RegEx | Extract first unnamed group or save all named groups as variables | `{"pattern": "Hello, (?P<subject>\w+)!"}`
`remove` | (string) RegEx | Remove matching regex from the previous stored value | `{"remove": "\D+"}`
`replace` | (list:2) RegEx, String | Replace a regex or a string with another string | `{"replace": ["\D+", "-"]}}`
`glue` | (list:n) String, String ... | Concatenate strings with variable interpolation support | `{"glue": ["My name is", ":me"]}`

The declaration module and the definition module are two major components of the dataplan. Without these two modules, there is no data planning ahead. Usage of variables can be found across multiple definitions, but a variable keep the first non-empty string found.

The `link` protocol is applied by the *resource* module. The resource module must be able to resolve the path to a resource. A dataplan must have only one `link` instance of the resource module, but the `link` can be changed at any point in time with another one that respects the data planning.

The `records` protocol is applied by the *storage* module. The storage module is responsible of keeping all runtime results within the dataplan. The protocol requires an ordered list of dictionary-like maps implementing the fields from the `declare` protocol with their respective data type and a timestamp of the evaluation.

The `config` protocol is applied by the *configurable* module. This module can be used to configure access to a resource. The protocol requires a dictionary-like map of key-value pair where *key* is the property to configure and *value* is its appropriate value to be set. A dataplan can have only one `config` protocol.

The `meta` protocol is applied by the *metadata* module. This module can be used to set meta information about data planning. The protocol requires a dictionary-like map of key-value pair where *key* is the meta field to define and *value* is its appropriate value to be set. A dataplan can have only one `meta` protocol.


# Hap! dataplan implementation table
Current implementations of Hap! are using JSON formatted files to store and implement dataplans. The table below describes each dataplan module as an appropriate property of a JSON object. Please consider this table and other examples from this repository as references to implement dataplans.

Property | Type | Description | Sample
-------- | ---- | ----------- | ------
`declare` | map | Collectable fields with conversion | `{"name": "text"}`
`define`  | list of maps | Instructions to collect declared fields | `[{"name": {"query_xpath": "//*[@id='name']"}, "item": "AS IS" }]`
`link`    | string | Source of HTML document to parse | `http://localhost` or `file:///tmp/document.html`
`config`  | map | Outgoing configurable parameters | `{"headers": {"User-Agent": "Hap! for Linux"}}`
`meta`    | map | Metadata about dataplan | `{"name": "general purpose dataplan", "tags": "anything"}`
`records`* | list of maps | Collected results for declared fields | `[{"name": "some text after parsing"}]`

Notes:
 - The `records` property is read-only; Hap! automatically updates (or creates) this property and appends records with every run.
 - The `meta` property does not impact the functionality of Hap!, but instead is used to organize and identify dataplans.
 - The current implementation allows only the `headers` as a configurable parameter for the `config` property (headers can be anything).
