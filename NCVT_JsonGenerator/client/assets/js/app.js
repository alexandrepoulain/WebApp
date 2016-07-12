(function() {
    'use strict';

    angular.module('application', [
            'ui.router',
            'ngAnimate',
            'ngResource',
            //foundation
            'foundation',
            'foundation.dynamicRouting',
            'foundation.dynamicRouting.animations'

        ])

        .factory('JsonService', function($resource) {
          return $resource('temp/list_script.json');
        })

        .controller('ctrl', function($scope, JsonService, listScript, saveToken, selection){
          JsonService.get(function(data){
            data = data.toJSON();
            console.log(data)
            for (var key in data) {
                if (key == 'Selection'){
                    selection.sendSelect(data[key])
                }
                else{
                    listScript.sendScriptName(key)
                }
            }
            saveToken.sendData(data);
          });
        })
        .service('selection',function () {
            var data = [];
            return {
                sendSelect: function (value_select) {
                    data = value_select
                },
                getSelect: function () {
                    return data 
                }
            };
        })
         // service for the list script
        .service('saveToken',function () {
             var data = {} ;
             return {
                // add the data
                sendData: function (thisData) {
                    data = thisData ;
                },
                // to take the list coresponding to the script  
                getToken:function (script) {
                    return data[script]; 
                }
             };
        })

        // service for the list script
        .service('listScript',function () {
             var listScript = [] ;
             return {
                // add a script
                sendScriptName: function (scriptName) {
                     listScript.push(scriptName) ;
                },
                // to take the list 
                getlistScript:function () {
                     return listScript; 
                }
             };
        })

        // service for the list of outputs
        .service('listOutputs',function () {
             var list = [] ;
             return {
                // add an output: the value associated to the key output
                addOutput: function (element) {
                     list.push(element); 
                },
                // to take the list 
                getList:function () {
                     return list; 
                }
             };
        })
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
        // service for parsing tokens ncvt
        .service('tokenNCVT', function(){
            return {
                parseTokenNCVT: function(value) {
                    var list_original = ['all', 'each_temp', 'each_original', 'all_temp', 'all_original', 'vc', 'dbdesc']
                    // find the ncvt tokens and test them
                    var Regex = /[^{}]+(?=\})/g ;
                    var list_token = value.match(Regex);
                    if(list_token){
                        for (var i = 0; i < list_token.length; i++) {
                            var token = list_token[i];
                            if (list_original.indexOf(token) == -1 ) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
            };  
        })



    // control settings ProcessingBlock
    .controller('CtrlSettingProcessBlock', function($scope, sharedId, listOutputs, listScript, saveToken, selection, tokenNCVT) {
        // when we call the controller we take the 
        var id = sharedId.getProperty();
        // creation of the block 
        $scope.master = { NameBlock: "ProcessingBlock", ID: id, Name: "", Interpreter: "", Selection: [], Inputs: [], Outputs: [], parameters: [] };
        
        // change list of interpreter
        $scope.uploadInterpreter = function(scriptName){
            if (scriptName.endsWith('.mxs') || scriptName.endsWith('.xml')){
                $scope.sequence.Interpreter = "NeuroRT" ;
            }
            else if (scriptName.endsWith('.py')) {
                $scope.sequence.Interpreter = "Python" ;
            }
            else if (scriptName.endsWith('.r') || scriptName.endsWith('.R') ) {
                $scope.sequence.Interpreter = "R" ;
            }
            else if (scriptName.endsWith('.m')) {
                $scope.sequence.Interpreter = "Matlab" ;
            }
            else if (scriptName.endsWith('.cmd')) {
                $scope.sequence.Interpreter = "Shell" ;
            }
        };
        // Selection all or list
        $scope.addSelection = function (elem) {
            if (elem == "${all}") {
                alert('ici')
                $scope.sequence.Selection = "${all}" ;
            }
            else {
                elem = JSON.parse(elem) ;
                console.log(elem)
                $scope.sequence.Selection.push(elem) ;
            }
        };
        $scope.deleteSelection = function (index) {
            $scope.sequence.Selection.splice(index,1);
        };
        $scope.deleteTokenAll = function () {
            $scope.sequence.Selection = []
        };
        // add inputs
        $scope.addInputs = function(key, value) {
            // verif is already in it 
            if (!tokenNCVT.parseTokenNCVT(value)) {
                $scope.sequence.Inputs[value] = false ;
            }
            else {
                var object = {};
                object[key] = value;
                $scope.sequence.Inputs.push(object);
            }
        };
        // delete input
        $scope.deleteInput = function(index){
            $scope.sequence.Inputs.splice(index,1);
        };
        // add outputs
        $scope.addOutputs = function(key, value) {
            if (!tokenNCVT.parseTokenNCVT(value)) {
                $scope.sequence.Inputs[value] = false ;
            }
            else{
                var object = {};
                object[key] = value;
                $scope.sequence.Outputs.push(object);
                // send the output
                listOutputs.addOutput(value);
            }
        };
        // delete output
        $scope.deleteOutput = function(index){
            $scope.sequence.Outputs.splice(index,1);
        };
        // add element in list parameters
        $scope.addParameter = function(key, value) {
            // first we have to find if the value is not a number
            if (!tokenNCVT.parseTokenNCVT(value)) {
                $scope.sequence.Inputs[value] = false ;
            }
            else {
                var object = {};
                if (!isNaN(value)){
                    object[key] = Number(value);
                }
                else {
                    object[key] = value;
                }
                $scope.sequence.parameters.push(object);
                $scope.uploadData($scope.sequence.ID);
            }
        };
        // delete parameter
        $scope.deleteParameter = function(index){
            $scope.sequence.parameters.splice(index,1);
        };
        // to delete the settings wanted
        $scope.deleteSetting = function (setting) {
             $scope.listToken.splice(setting,1);
        };

        // reset block to an empty one
        $scope.reset = function() {
            $scope.sequence = angular.copy($scope.master);
        };
        // needed to the initialisation
        $scope.reset();
        // check if all the parameters have been filled
        $scope.check = function () {
            // go through the block created
            // find the keys in Inputs, Outputs and Parameters
            // push all the keys in a global list
            var list_global = [];
            for(var key in $scope.sequence) {
                if (key == 'parameters' || key == 'Inputs' || key == 'Outputs') {
                    for(var index in $scope.sequence[key]) {
                        for(var new_key in $scope.sequence[key][index]) {
                            list_global.push(new_key);
                        }
                    }
                }
            }
            // make the comparison between
            for (var setting in $scope.listToken) {
                console.log($scope.listToken[setting])
                if(list_global.indexOf($scope.listToken[setting]) == -1) {
                    return false;
                }
            }
            return true; 

        };
        // delete in list of settings
        $scope.deleteInList = function (index) {
            $scope.listToken.splice(index, 1);
        };
        // reset list settings
        $scope.resetSettings = function () {

            $scope.listToken = $scope.listMaster; 
            console.log($scope.listMaster)
        };

        // store the block in local storage
        $scope.saveProcessBlock = function() {
            // before to save it we have to test if all the parameters have been filled
            if (!$scope.check()) {
                alert('Some parameters are not set: block not saved')
            }
            else {
                localStorage.setItem($scope.sequence.ID, JSON.stringify($scope.sequence));    
            }
            
        };
        // get the block by id
        $scope.uploadData = function(id) {
            $scope.listScript = listScript.getlistScript() ;
            // get the block from the local storage: transform into a js object
            var sessionRestaured =  JSON.parse(localStorage.getItem(id));
            try {
                if (sessionRestaured.ID != null)
                    $scope.sequence = sessionRestaured;
            } catch (e) {
                // statements
            }

            $scope.listSelection = selection.getSelect();
            try {
                $scope.listToken = saveToken.getToken($scope.sequence.Name);
                $scope.listMaster = $scope.listToken.slice();
            } catch(e) {

            }
            
        };
        $scope.reload = function()
        {
           location.reload(); 
        };

        $scope.findInput = function (listToken) {
            var suggestInput = [];
            for(var key in listToken) {
                if (listToken[key].indexOf("Input_FileName") != -1 ){
                    suggestInput.push(listToken[key]);
                }
            }
            return suggestInput ;
        };
        $scope.findOutput = function (listToken) {
            var suggest = [];
            for(var key in listToken) {
                if (listToken[key].indexOf("Output_FileName") != -1 ){
                    suggest.push(listToken[key]);
                }
            }
            return suggest ; 
        };     
        $scope.findParam = function (listToken) {
            var suggest = [];
            for(var key in listToken) {
                if (listToken[key].indexOf("Output_FileName") == -1 && listToken[key].indexOf("Input_FileName") == -1 ){
                    suggest.push(listToken[key]);
                }
            }
            return suggest ; 
        };    

        $scope.resetForm = function () {
             $scope.temp3 = "";
             $scope.value3 = "";
        };
                
       
    })

    // controller settings ProcessingSequence
    .controller('CtrlSettingProcessSeq', function($scope, $http, sharedId, listOutputs) {
        // take the id 
        var id = sharedId.getProperty();
        // if the id is empty we set the id at 1
        if (id == "")
            $scope.master = { Name: "Sequence", ID: "1" };
        else
            $scope.master = { Name: "Sequence", ID: id };
       
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
        };


    })

    // control settings CrossValidationBlock
    // In function of the type of cross validation we change the parameters of the block 
    .controller('CtrlSettingCrossBlock', function($scope, sharedId, listOutputs) {
        // take the id of the node
        var id = sharedId.getProperty();
        // var for the reset
        $scope.master = { NameBlock: "CrossValidationBlock", ID: id, "CrossValidationType": "" };
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
            
            if (type == 'leave-one-label-out') {
                $scope.sequence.parameters = { "CrossValidationOutput": [] }   
            }

        };

        // add the CV Outputs (we make a list of them)
        $scope.addCVOutput = function(temp1, value1) {
            var object = {};
            object[temp1] = value1;
            $scope.sequence.parameters.CrossValidationOutput.push(object);
            $scope.saveCrossBlock();
            // send the output to the shared list 
            listOutputs.addOutput(value1);
        };
        // add a ParameterSearch Block
        $scope.addParameterSearchBlock = function() {
            // we make the block and then we put him into the block sequence 
            var ParameterSearchBlock = {"ParameterSearch": []};
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
        $scope.deleteSearchCount = function (indexOfSearch) {
            delete($scope.sequence.parameters["ParameterSearch"][indexOfSearch]["SearchCount"]);
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
        };
    })

    // Controller for the layout (MAIN)
    .controller("TreeController", function($scope, sharedId, $resource, listOutputs) {
        // delete a node of the tree 
        $scope.delete = function(data) {
            if(data.ID != '1') {
                var index = -1 ;
                for (var i = 0; i < $scope.tree[0].nodes.length; i++) {
                    var elem = $scope.tree[0].nodes[i];

                    $scope.findData(data, elem);
                    
                    
                    if (elem.ID == data.ID) {
                        index = i;
                    }
                      
                }
                if (index > -1) {
                    $scope.tree[0].nodes.splice(index, 1);
                }
            }
        };

        $scope.findData = function (data, son) {
            var index = -1 ;
            for (var i = 0; i < son.nodes.length; i++) {
                var elem = son.nodes[i] ;
                $scope.findData(data, elem);
                
                if (elem.ID == data.ID) {
                    index = i;
                    
                }
            } 
            if (index > -1) {
                son.nodes.splice(index, 1);
            }
        };
        // add a node for the tree
        $scope.add = function(data, newName) {
            var post = data.nodes.length + 1;
            var id = data.ID + '-' + post;
            data.nodes.push({ name: newName, ID: id, nodes: [] });
            localStorage.setItem('node' + data.ID, JSON.stringify(data));
        };
        // this function will parse the blocks recursively
        // we find the block with the id of the node and after that 
        // we parse the block in order to find only what concerns us
        $scope.parseData = function(data) {
            // Get the Block corresponding 
            var block = JSON.parse(localStorage.getItem(data.ID));
            // delete "ID" and "Name"
            if (block) {
                delete block["NameBlock"];
                delete block["ID"];
                if (block['Inputs'].length == 0) {
                    delete block['Inputs']
                }
                if (block['Outputs'].length == 0) {
                    delete block['Outputs']
                }
                block["Parameters"] = [];
                // for "parameters" we have to take what's inside the list "parameters"
                if (block.hasOwnProperty("parameters")) {
                    if(block["parameters"].length == 0) {
                        delete block["Parameters"]
                    }
                    else {
                        for (var key3 in block["parameters"]) {
                                block["Parameters"].push(block["parameters"][key3]);
                        }
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

    function config($urlProvider, $locationProvider, $resourceProvider) {
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
