(function() {
    'use strict';

    angular.module('application', [
            'ui.router',
            'ngAnimate',
            //foundation
            'foundation',
            'foundation.dynamicRouting',
            'foundation.dynamicRouting.animations'
        ])
        // service to share the id 
        .service('sharedId', function() {
            var property = "";
            return {
                getProperty: function() {
                    return property;
                },
                setProperty: function(value) {
                    property = value;
                }
            };
        })
        // service to share the path between the template ProcessingSequence and the layout  
        .service('sharedPath', function() {
            var path = "";
            return {
                getPath: function() {
                    return path;
                },
                setPath: function(value) {
                    path = value;
                }
            };
        })


    // control settings ProcessingBlock
    .controller('CtrlSettingProcessBlock', function($scope, sharedId) {
        // when we call the controller we take the 
        var id = sharedId.getProperty();
        // creation of the block 
        $scope.master = { Name: "ProcessingBlock", ID: id, nameScript: "", interpreter: "", selection: "", inputs: [], outputs: [], parameters: [] };
        // add inputs
        $scope.addInputs = function(key, value) {
            var object = {};
            object[key] = value;
            $scope.sequence.inputs.push(ret);
            $scope.saveProcessBlock();
        };
        // add outputs
        $scope.addOutputs = function(key, value) {
            var object = {};
            object[key] = value;
            $scope.sequence.outputs.push(object);
            $scope.saveProcessBlock();
        };
        // add element in list parameters
        $scope.addParameter = function(key, value) {
            var object = {};
            object[key] = value;
            $scope.sequence.parameters.push(object);
            $scope.saveProcessBlock();
        };
        // reset block to an empty one
        $scope.reset = function() {
            $scope.sequence = angular.copy($scope.master);
        };
        // needed to the initialisation
        $scope.reset();
        // store the block in local storage
        $scope.saveProcessBlock = function() {

            localStorage.setItem($scope.sequence.ID, JSON.stringify($scope.sequence));
        };
        // get the block by id
        $scope.uploadData = function(id) {
            // get the block from the local storage: transform into a js object
            var sessionRestaured =  JSON.parse(localStorage.getItem(id));
            try {
                if (sessionRestaured.ID != null)
                    $scope.sequence = sessionRestaured;
            } catch (e) {
                // statements
                console.log("Pas d'id pour session");
            }
            console.log(sessionRestaured);
        };
    })

    // controller settings ProcessingSequence
    .controller('CtrlSettingProcessSeq', function($scope, $http, sharedId, sharedPath) {
        // take the id 
        var id = sharedId.getProperty();
        // if the id is empty we set the id at 1
        if (id == "")
            $scope.master = { Name: "Sequence", ID: "1", path: "" };
        else
            $scope.master = { Name: "Sequence", ID: id, path: "" };
        // send the path to the service
        $scope.sendPath = function(path) {
            if (path == "")
                alert("Path not defined !")
            else
                sharedPath.setPath(path);
        };
        // reset the processing sequence 
        $scope.reset = function() {
            $scope.sequence = angular.copy($scope.master);
        };
        $scope.reset();
        // save the block to local storage
        $scope.saveSeqBlock = function() {
            localStorage.setItem($scope.sequence.ID, JSON.stringify($scope.sequence));
        };
        // in function of the id take the block in the local storage corresponding
        $scope.uploadData = function(id) {
            var sessionRestaured = JSON.parse(localStorage.getItem(id));
            try {
                if (sessionRestaured.ID != null)
                    $scope.sequence = sessionRestaured;
            } catch (e) {
                // statements
                console.log("No id for the session");
            }
            console.log(sessionRestaured);
        };


    })

    // control settings CrossValidationBlock
    // In function of the type of cross validation we change the parameters of the block 
    .controller('CtrlSettingCrossBlock', function($scope, sharedId) {
        // take the id of the node
        var id = sharedId.getProperty();
        // var for the reset
        $scope.master = { Name: "CrossValidationBlock", ID: id, "CrossValidationType": "" };
        // function to choose the type of CV we want
        $scope.chooseTypeCV = function(type) {
            // in function on the type we give the parameters
            $scope.sequence["CrossValidationType"] = type;
            // add CVCount 
            if (type == 'k-fold' || type == 'bootstrapping') {
                $scope.sequence.parameters = {
                    "CrossValidationCount": "",
                    "CrossValidationOutput": []
                };
            }
            // No CVCount 
            if (type == 'leave-one-out') {
                $scope.sequence.parameters = { "CrossValidationOutput": [] }
            }

        };

        // add the CV Outputs (we make a list of them)
        $scope.addCVOutput = function(temp1, value1) {
            var object = {};
            object[temp1] = value1;
            $scope.sequence.parameters.CrossValidationOutput.push(object);
            $scope.saveCrossBlock();
        };
        // add a ParameterSearch Block
        $scope.addParameterSearchBlock = function() {
            // we make the block and then we put him into the block sequence 
            var ParameterSearchBlock = { "ParameterSearch": [] };
            $scope.sequence.parameters["ParameterSearch"] = [];
            $scope.sequence.parameters["OptimizedOutput"] = "";
            $scope.sequence.parameters["OptimizationType"] = "";
        };
        // add a ParameterSearch
        $scope.addParameterSearch = function() {
            // creation of the element 
            var ParameterSearchVar = {
                "Name": "",
                "TypeValue": "",
                "TypeRange": "",
                "Values": [],
                "SearchType": "",
                "SearchCount": ""
            };
            $scope.sequence.parameters["ParameterSearch"].push(ParameterSearchVar);
        };
        // add a value 
        $scope.addCvValues = function(key2, number) {
            $scope.sequence.parameters.ParameterSearch[key2]['Values'].push(number);
            $scope.saveCrossBlock();
        };
        // set the OptimizationType
        $scope.setOptimizationType = function(param) {
            $scope.sequence.parameters['OptimizationType'] = param;
            $scope.saveCrossBlock();
        }
        // reset of the block
        $scope.reset = function() {
            $scope.sequence = angular.copy($scope.master);
        };
        $scope.reset();
        // save the block to local storage
        $scope.saveCrossBlock = function() {
            localStorage.setItem($scope.sequence.ID, JSON.stringify($scope.sequence));
        };
        // find the block saved for the id 
        $scope.uploadData = function(id) {
            var sessionRestaured = JSON.parse(localStorage.getItem(id));
            try {
                if (sessionRestaured.ID != null)
                    $scope.sequence = sessionRestaured;
            } catch (e) {
                console.log("No id for the session");
            }
            console.log(sessionRestaured);
        };
    })

    // Controller for the layout (MAIN)
    .controller("TreeController", function($scope, sharedId, sharedPath) {
        // delete a node of the tree 
        $scope.delete = function(data) {
            data.nodes = [];
        };
        // add a node for the tree
        $scope.add = function(data, newName) {
            var post = data.nodes.length + 1;
            var id = data.ID + '-' + post;
            data.nodes.push({ name: newName, ID: id, nodes: [] });
        };
        // this function will parse the blocks recursively
        // we find the block with the id of the node and after that 
        // we parse the block in order to find only what concerns us
        $scope.parseData = function(data) {
            // Get the Block corresponding 
            var block = JSON.parse(localStorage.getItem(data.ID));
            // delete "ID" and "Name"
            if (block) {
                delete block["Name"];
                delete block["ID"];
                // for "parameters" we have to take what's inside the list "parameters"
                if (block.hasOwnProperty("parameters")) {
                    for (var key3 in block["parameters"]) {
                        block[key3] = block["parameters"][key3];
                    }
                    // after that we delete it 
                    delete block["parameters"]
                }
            }
            // in function of the name we create the object
            if (data.name == "ProcessingSequence" || data.name == "TrainingProcessingBlock" || data.name == "ValidationProcessingBlock") {
                // if this is a ProcessingSequence/TrainingProcessingBlock/ValidationProcessingBlock we create a list
                var object = [];
                // if it has sons 
                if (data.nodes.length != 0) {
                    // we take his sons 
                    for (var j = 0, length2 = data.nodes.length; j < length2; j++) {
                        // parse the son
                        var son = $scope.parseData(data.nodes[j]);
                        object.push(son);
                    }
                }
            } else if (data.name == "CrossValidationBlock" || data.name == "ProcessingBlock") {
                // if this is a CrossValidationBlock/ProcessingBlock we create an object
                var object = {};
                var object_temp = {};
                // if it has sons 
                if (data.nodes.length != 0) {
                    // we take his sons 
                    for (var j = 0, length2 = data.nodes.length; j < length2; j++) {
                        // parse the son 
                        var son = $scope.parseData(data.nodes[j]);
                        for (var key in son) {
                            object_temp[key] = son[key];
                            object = angular.extend(object, object_temp);
                            console.log(object);
                        }
                    }
                }
                // add the parameters of the block
                for (var key2 in block) {
                    object[key2] = block[key2];
                }
            }
            //  the block to return we create
            var element = {}
            element[data.name] = object;
            return element;
        }
        // save the .json on local storage: we have to begin from the processingSequence node
        $scope.saveJson = function(data) {
            var newData = $scope.parseData(data);
            // after the parsing we have a good object to save
            localStorage.setItem("dataToSave", angular.toJson(newData, 4));
        };
        // to save on the pc 
        $scope.saveToPc = function() {
            var data = localStorage.getItem("dataToSave");
            var filename ;
            if (!data) {
                console.error('No data');
                return;
            }

            if (filename == undefined) {
                filename = 'download.json';
            }

            if (typeof data === 'object') {
                data = JSON.stringify(data, undefined, 2);
            }

            var blob = new Blob([data], { type: 'text/json' }),
                e = document.createEvent('MouseEvents'),
                a = document.createElement('a');

            a.download = filename;
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
            e.initEvent('click', true, false, window,
                0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
        };
        // save the id 
        $scope.saveDataId = function(id) {
            sharedId.setProperty(id);
        };

        $scope.tree = [{ name: "ProcessingSequence", ID: '1', nodes: [] }];
    })





    .config(config)
        .run(run);




    config.$inject = ['$urlRouterProvider', '$locationProvider'];

    function config($urlProvider, $locationProvider) {
        $urlProvider.otherwise('/');

        $locationProvider.html5Mode({
            enabled: false,
            requireBase: false
        });

        $locationProvider.hashPrefix('!');
    }

    function run() {
        FastClick.attach(document.body);
    }

})();
